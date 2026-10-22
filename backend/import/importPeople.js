// Imports a list of residents or staff from a CSV file (Excel can save and open CSV).
//
//   node import/importPeople.js residents import/data/residents.csv            check only
//   node import/importPeople.js residents import/data/residents.csv --apply    write to the database
//   node import/importPeople.js staff     import/data/staff.csv     [--apply]
//
// Run it from the backend folder. Without --apply nothing is written: the file is
// only checked, so you can fix mistakes first. The rules are the same as the
// "Add resident" form and the Staff registration, and passwords are stored hashed
// (bcrypt), exactly like the app does.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Load backend/.env no matter which folder the command is run from.
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { STAFF_DEPARTMENTS } = require("../constants/staffDepartments");

// ---------------------------------------------------------------------------
// CSV reading
// ---------------------------------------------------------------------------

// Excel in some regions saves with ";" or tabs, so the separator is detected.
const detectDelimiter = (text) => {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const counts = [",", ";", "\t"].map((delimiter) => [delimiter, firstLine.split(delimiter).length - 1]);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
};

// Small RFC 4180 parser: quoted cells, "" escapes and line breaks inside quotes.
const parseCsv = (input) => {
  const text = input.replace(/^﻿/, "");
  const delimiter = detectDelimiter(text);
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
};

const HEADER_ALIASES = {
  first: "first_name",
  firstname: "first_name",
  last: "last_name",
  lastname: "last_name",
  surname: "last_name",
  mobile: "phone",
  phone_number: "phone",
  mobile_number: "phone",
  block: "block_wing",
  wing: "block_wing",
  blockwing: "block_wing",
  flat: "flat_number",
  flat_no: "flat_number",
  flatnumber: "flat_number",
  ownership: "ownership_type",
  type: "ownership_type",
  dept: "department",
};

const normalizeHeader = (value) => {
  const key = String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return HEADER_ALIASES[key] || key;
};

// ---------------------------------------------------------------------------
// Validation (same rules as the app)
// ---------------------------------------------------------------------------

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FLAT_PATTERN = /^[1-5]0[1-4]$/;
const WINGS = ["A", "B", "C", "D"];

const checkName = (value, label, errors) => {
  if (!value) errors.push(`${label} is missing`);
  else if (value.length > 100) errors.push(`${label} is longer than 100 characters`);
  else if (!NAME_PATTERN.test(value)) errors.push(`${label} may only contain letters, spaces, . ' and -`);
};

const checkEmail = (value, errors) => {
  if (!value) return errors.push("Email is missing");
  if (value.length > 150) return errors.push("Email is longer than 150 characters");
  if (!EMAIL_PATTERN.test(value)) return errors.push(`Email "${value}" is not valid`);
  // example.com is reserved for samples, so a row copied from the example file is caught.
  if (/@example\.(com|org|net)$/.test(value)) return errors.push(`Email "${value}" looks like the sample data. Replace it with the real email`);
  return undefined;
};

// 10 digits; "+91 98765-43210", "09876543210" and similar are tidied up first.
const cleanPhone = (value) => {
  const digits = String(value).replace(/[\s()+-]/g, "");
  if (/^\d{12}$/.test(digits) && digits.startsWith("91")) return digits.slice(2);
  if (/^\d{11}$/.test(digits) && digits.startsWith("0")) return digits.slice(1);
  return digits;
};

const checkPhone = (value, errors) => {
  if (!/^[0-9]{10}$/.test(value)) errors.push(`Phone "${value}" must be exactly 10 digits`);
};

// Same rule as the app: 5+ characters, 3+ digits, 1 special character, max 72 bytes.
const checkPassword = (value, errors) => {
  if (
    value.length < 5 ||
    (value.match(/[0-9]/g) || []).length < 3 ||
    !/[^A-Za-z0-9\s]/.test(value) ||
    Buffer.byteLength(value, "utf8") > 72
  ) {
    errors.push("Password needs at least 5 characters, 3 digits and 1 special character (like @ or #)");
  }
};

// Readable temporary password: letters without look-alikes, 4 digits and 1 symbol.
const generatePassword = () => {
  const letters = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const pick = (set) => set[crypto.randomInt(set.length)];
  const part = (set, count) => Array.from({ length: count }, () => pick(set)).join("");

  return `${part(letters, 4)}${part("23456789", 4)}${pick("@#$%")}${part(letters, 2)}`;
};

const COLUMNS = {
  residents: {
    required: ["first_name", "last_name", "email", "phone", "block_wing", "flat_number", "ownership_type"],
    optional: ["password"],
  },
  staff: {
    required: ["first_name", "last_name", "email", "phone", "department"],
    optional: ["password"],
  },
};

// Turns the CSV rows into { records, errors, notes }. `line` is the row number as
// Excel shows it (the header is row 1).
const readPeople = (type, csvRows) => {
  const spec = COLUMNS[type];
  const errors = [];
  const notes = [];
  const records = [];

  if (csvRows.length === 0) return { records, errors: ["The file is empty"], notes };

  const headers = csvRows[0].map(normalizeHeader);
  const missing = spec.required.filter((column) => !headers.includes(column));
  if (missing.length) {
    return { records, errors: [`Missing column(s): ${missing.join(", ")}. Use the template file for the exact headers`], notes };
  }

  const unknown = headers.filter((header) => header && !spec.required.includes(header) && !spec.optional.includes(header));
  if (unknown.length) notes.push(`Ignoring unknown column(s): ${unknown.join(", ")}`);

  const seenEmails = new Map();
  const seenFlats = new Map();
  let lowercased = 0;

  csvRows.slice(1).forEach((cells, index) => {
    const line = index + 2;
    if (cells.every((cell) => String(cell).trim() === "")) return; // blank line

    const get = (column) => {
      const position = headers.indexOf(column);
      return position === -1 ? "" : String(cells[position] ?? "").trim();
    };

    const rowErrors = [];
    const firstName = get("first_name");
    const lastName = get("last_name");
    const rawEmail = get("email");
    const email = rawEmail.toLowerCase();
    const phone = cleanPhone(get("phone"));
    const record = { line, firstName, lastName, email, phone, password: get("password") };

    checkName(firstName, "First name", rowErrors);
    checkName(lastName, "Last name", rowErrors);
    checkEmail(email, rowErrors);
    checkPhone(phone, rowErrors);
    if (rawEmail !== email) lowercased += 1;

    if (type === "residents") {
      record.blockWing = get("block_wing").toUpperCase();
      record.flatNumber = get("flat_number");
      const ownership = get("ownership_type").toLowerCase();
      record.ownershipType = ownership === "owner" ? "Owner" : ownership === "rent" || ownership === "rented" ? "Rent" : "";

      if (!WINGS.includes(record.blockWing)) rowErrors.push(`Block/Wing "${get("block_wing")}" must be A, B, C or D`);
      if (!FLAT_PATTERN.test(record.flatNumber)) rowErrors.push(`Flat number "${record.flatNumber}" must be like 101 to 504 (floors 1-5, flats 01-04)`);
      if (!record.ownershipType) rowErrors.push(`Ownership type "${get("ownership_type")}" must be Owner or Rent`);

      const flatKey = `${record.blockWing}-${record.flatNumber}`;
      if (!rowErrors.length && seenFlats.has(flatKey)) {
        rowErrors.push(`Flat ${flatKey} is already used in row ${seenFlats.get(flatKey)} of this file`);
      } else {
        seenFlats.set(flatKey, line);
      }
    } else {
      const wanted = get("department").toLowerCase();
      record.department = STAFF_DEPARTMENTS.find((department) => department.toLowerCase() === wanted) || "";
      if (!record.department) rowErrors.push(`Department "${get("department")}" must be one of: ${STAFF_DEPARTMENTS.join(", ")}`);
    }

    if (email && seenEmails.has(email)) {
      rowErrors.push(`Email ${email} is already used in row ${seenEmails.get(email)} of this file`);
    } else if (email) {
      seenEmails.set(email, line);
    }

    if (record.password) checkPassword(record.password, rowErrors);

    rowErrors.forEach((message) => errors.push(`Row ${line}: ${message}`));
    records.push(record);
  });

  if (lowercased) notes.push(`${lowercased} email(s) were changed to lowercase (the app only accepts lowercase emails)`);
  if (records.length === 0) errors.push("The file has no data rows");

  return { records, errors, notes };
};

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

// Splits the valid rows into new people, people who already exist (skipped)
// and conflicts (a different person already lives in that flat).
const comparePeopleWithDatabase = async (type, records) => {
  const table = type === "residents" ? "residents" : "staff";
  const [existing] = await pool.query(`SELECT email FROM ${table}`);
  const existingEmails = new Set(existing.map((row) => String(row.email).toLowerCase()));

  const conflicts = [];
  let flatOwners = new Map();

  if (type === "residents") {
    const [flats] = await pool.query(
      "SELECT block_wing, flat_number, email FROM residents WHERE block_wing IS NOT NULL AND flat_number IS NOT NULL"
    );
    flatOwners = new Map(flats.map((row) => [`${row.block_wing}-${row.flat_number}`, row.email]));
  }

  const fresh = [];
  const skipped = [];

  records.forEach((record) => {
    if (existingEmails.has(record.email)) {
      skipped.push(record);
      return;
    }

    if (type === "residents") {
      const owner = flatOwners.get(`${record.blockWing}-${record.flatNumber}`);
      if (owner) {
        conflicts.push(`Row ${record.line}: flat ${record.blockWing}-${record.flatNumber} already belongs to ${owner}`);
        return;
      }
    }

    fresh.push(record);
  });

  return { fresh, skipped, conflicts };
};

// Hashes the passwords (creating temporary ones where the cell was empty) and
// inserts everything inside the given connection's open transaction.
const insertPeople = async (connection, type, records) => {
  const generated = [];
  const prepared = [];

  for (const record of records) {
    let password = record.password;

    if (!password) {
      password = generatePassword();
      generated.push({ name: `${record.firstName} ${record.lastName}`, email: record.email, password });
    }

    prepared.push({ ...record, hash: await bcrypt.hash(password, 10) });
  }

  for (const record of prepared) {
    if (type === "residents") {
      await connection.query(
        `INSERT INTO residents
           (first_name, last_name, email, phone, user_type, block_wing, flat_number, ownership_type, password, is_active)
         VALUES (?, ?, ?, ?, 'Resident', ?, ?, ?, ?, 1)`,
        [record.firstName, record.lastName, record.email, record.phone, record.blockWing, record.flatNumber, record.ownershipType, record.hash]
      );
    } else {
      await connection.query(
        `INSERT INTO staff (first_name, last_name, email, phone, department, password)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [record.firstName, record.lastName, record.email, record.phone, record.department, record.hash]
      );
    }
  }

  return generated;
};

// ---------------------------------------------------------------------------
// Command line
// ---------------------------------------------------------------------------

const csvCell = (value) => (/[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

const main = async () => {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const [type, file] = args.filter((arg) => !arg.startsWith("--"));

  if (!COLUMNS[type] || !file) {
    console.log("Usage:  node import/importPeople.js <residents|staff> <file.csv> [--apply]");
    console.log("Without --apply the file is only checked and nothing is written.");
    return 1;
  }

  const filePath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return 1;
  }

  const { records, errors, notes } = readPeople(type, parseCsv(fs.readFileSync(filePath, "utf8")));
  notes.forEach((note) => console.log(`Note: ${note}`));

  if (errors.length) {
    console.log(`\nFound ${errors.length} problem(s). Fix them in the file and run again. Nothing was written.\n`);
    errors.forEach((message) => console.log(`  ${message}`));
    return 1;
  }

  const { fresh, skipped, conflicts } = await comparePeopleWithDatabase(type, records);

  console.log(`\nRows in file:            ${records.length}`);
  console.log(`New (will be added):     ${fresh.length}`);
  console.log(`Already registered:      ${skipped.length}${skipped.length ? " (skipped, same email)" : ""}`);
  skipped.forEach((record) => console.log(`  Row ${record.line}: ${record.email}`));

  if (conflicts.length) {
    console.log(`\nFound ${conflicts.length} conflict(s). Nothing was written.\n`);
    conflicts.forEach((message) => console.log(`  ${message}`));
    return 1;
  }

  if (fresh.length === 0) {
    console.log("\nNothing new to add.");
    return 0;
  }

  if (!apply) {
    console.log("\nThe file looks good. Nothing was written yet.");
    console.log("Run the same command again with --apply to add these people.");
    return 0;
  }

  const connection = await pool.getConnection();
  let generated;

  try {
    await connection.beginTransaction();
    generated = await insertPeople(connection, type, fresh);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.log(`\nImport failed, nothing was saved: ${error.message}`);
    return 1;
  } finally {
    connection.release();
  }

  console.log(`\nDone. Added ${fresh.length} ${type}.`);

  if (generated.length) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const output = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}_login_passwords_${stamp}.csv`);
    const lines = ["name,email,temporary_password", ...generated.map((row) => [row.name, row.email, row.password].map(csvCell).join(","))];
    fs.writeFileSync(output, `${lines.join("\r\n")}\r\n`, { flag: "wx" });

    console.log(`\n${generated.length} password(s) were empty in the file, so temporary ones were created.`);
    console.log(`They are saved in: ${output}`);
    console.log("Give each person their password, then delete that file.");
  }

  return 0;
};

if (require.main === module) {
  main()
    .then((code) => pool.end().then(() => process.exit(code)))
    .catch((error) => {
      console.error("Import error:", error.message);
      pool.end().finally(() => process.exit(1));
    });
}

module.exports = { parseCsv, readPeople, comparePeopleWithDatabase, insertPeople, generatePassword };
