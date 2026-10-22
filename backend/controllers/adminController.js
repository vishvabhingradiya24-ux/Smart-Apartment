const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { syncMaintenanceDues } = require("../utils/maintenance");
const { STAFF_DEPARTMENTS } = require("../constants/staffDepartments");
const { getEmailError, getPhoneError } = require("../utils/validation");

require("dotenv").config();

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const emailError = getEmailError(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const [admins] = await pool.query(
      `SELECT
        id,
        name,
        email,
        password,
        created_at
      FROM admins
      WHERE email = ?`,
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const admin = admins[0];

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Fallback secret કી આપી છે જેથી secretOrPrivateKey ની એરર ક્યારેય ન આવે
    const secretKey = process.env.JWT_SECRET || "my_smart_apartment_secret_key_12345";

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "Admin"
      },
      secretKey,
      {
        expiresIn: "1d"
      }
    );

    delete admin.password;

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin
    });

  } catch (error) {
    console.error("Admin Login Error:", error);

    res.status(500).json({
      message: "Admin login failed"
    });
  }
};

const isAdminUser = (user) =>
  String(user?.role || user?.user_type || "").trim().toLowerCase() === "admin";

const isValidDateOnly = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const isValidMoney = (value, allowZero = false) => {
  const amount = String(value ?? "");
  return /^\d{1,8}(?:\.\d{1,2})?$/.test(amount) &&
    (allowZero ? Number(amount) >= 0 : Number(amount) > 0);
};

const getAdminDashboard = async (req, res) => {
  try {
    if (!isAdminUser(req.user)) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const [residentRows] = await pool.query(
      `SELECT COUNT(*) AS total_residents,
              COUNT(DISTINCT CONCAT_WS('-', block_wing, flat_number)) AS total_flats
       FROM residents
       WHERE user_type = 'Resident' AND is_active = 1`
    );
    const [complaintRows] = await pool.query(
      `SELECT COUNT(*) AS total_complaints,
              SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_complaints
       FROM complaints`
    );
    const [paymentRows] = await pool.query(
      `SELECT COUNT(*) AS total_payments,
              COALESCE(SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END), 0) AS paid_total,
              SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_payments
       FROM payments`
    );
    const [visitorRows] = await pool.query(
      `SELECT SUM(CASE WHEN DATE(entry_time) = CURDATE() THEN 1 ELSE 0 END) AS visitors_today,
              SUM(CASE WHEN entry_time IS NOT NULL AND exit_time IS NULL THEN 1 ELSE 0 END) AS checked_in_today
       FROM visitors WHERE entry_time IS NOT NULL`
    );
    const [staffRows] = await pool.query(`SELECT COUNT(*) AS active_staff FROM staff`);
    const [facilityRows] = await pool.query(
      `SELECT COUNT(*) AS active_amenities FROM facilities WHERE availability_status = 'Available'`
    );

    const [bookingRows] = await pool.query(
      `SELECT COUNT(*) AS pending_bookings FROM facility_bookings WHERE status = 'Pending'`
    );

    const [complaints] = await pool.query(
      `SELECT c.complaint_title AS title, c.status, c.complaint_date AS activity_date,
              r.block_wing, r.flat_number
       FROM complaints c LEFT JOIN residents r ON r.id = c.resident_id
       ORDER BY c.complaint_date DESC LIMIT 5`
    );
    const [payments] = await pool.query(
      `SELECT p.amount, p.status, p.created_at AS activity_date,
              r.block_wing, r.flat_number
       FROM payments p LEFT JOIN residents r ON r.id = p.resident_id
       ORDER BY p.created_at DESC LIMIT 5`
    );
    const [visitors] = await pool.query(
      `SELECT v.visitor_name, v.entry_time AS activity_date,
              r.block_wing, r.flat_number
       FROM visitors v LEFT JOIN residents r ON r.id = v.resident_id
       WHERE v.entry_time IS NOT NULL
       ORDER BY v.entry_time DESC LIMIT 5`
    );
    const [tasks] = await pool.query(
      `SELECT t.task_name, t.status, t.created_at AS activity_date,
              s.first_name, s.last_name
       FROM tasks t LEFT JOIN staff s ON s.id = t.assigned_to
       ORDER BY t.created_at DESC LIMIT 5`
    );
    const [residents] = await pool.query(
      `SELECT first_name, last_name, block_wing, flat_number, created_at AS activity_date
       FROM residents ORDER BY created_at DESC LIMIT 5`
    );

    const activities = [
      ...complaints.map((row) => ({
        type: "Complaint", description: `${row.title || "Complaint"}${row.flat_number ? ` from Flat ${row.block_wing || ""}-${row.flat_number}` : ""}`,
        time: row.activity_date, status: row.status || "Pending", icon: "📋",
      })),
      ...payments.map((row) => ({
        type: "Payment", description: `₹${Number(row.amount || 0).toLocaleString("en-IN")} payment${row.flat_number ? ` from Flat ${row.block_wing || ""}-${row.flat_number}` : ""}`,
        time: row.activity_date, status: row.status || "Pending", icon: "💳",
      })),
      ...visitors.map((row) => ({
        type: "Visitor", description: `${row.visitor_name || "Visitor"} entered${row.flat_number ? ` for Flat ${row.block_wing || ""}-${row.flat_number}` : ""}`,
        time: row.activity_date, status: "Entry recorded", icon: "🚪",
      })),
      ...tasks.map((row) => ({
        type: "Task", description: `${row.task_name || "Task"}${row.first_name ? ` assigned to ${row.first_name} ${row.last_name || ""}` : ""}`,
        time: row.activity_date, status: row.status || "Assigned", icon: "🔧",
      })),
      ...residents.map((row) => ({
        type: "Resident", description: `${row.first_name} ${row.last_name}${row.flat_number ? ` joined Flat ${row.block_wing || ""}-${row.flat_number}` : " joined"}`,
        time: row.activity_date, status: "New", icon: "👤",
      })),
    ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 6);

    res.status(200).json({
      stats: {
        residents: Number(residentRows[0].total_residents || 0),
        complaints: Number(complaintRows[0].total_complaints || 0),
        pendingComplaints: Number(complaintRows[0].pending_complaints || 0),
        paidTotal: Number(paymentRows[0].paid_total || 0),
        pendingPayments: Number(paymentRows[0].pending_payments || 0),
        pendingBookings: Number(bookingRows[0].pending_bookings || 0),
        visitorsToday: Number(visitorRows[0].visitors_today || 0),
        checkedInToday: Number(visitorRows[0].checked_in_today || 0),
      },
      community: {
        residents: Number(residentRows[0].total_residents || 0),
        flats: Number(residentRows[0].total_flats || 0),
        staff: Number(staffRows[0].active_staff || 0),
        amenities: Number(facilityRows[0].active_amenities || 0),
      },
      recentActivities: activities,
    });
  } catch (error) {
    console.error("Get Admin Dashboard Error:", error);
    res.status(500).json({ message: "Unable to load dashboard data" });
  }
};

const requireAdmin = (req, res) => {
  if (!isAdminUser(req.user)) {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }
  return true;
};

const getAdminResidents = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [residents] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, block_wing, flat_number,
              ownership_type, is_active, created_at
       FROM residents
       WHERE user_type = 'Resident'
       ORDER BY is_active DESC, block_wing ASC, CAST(flat_number AS UNSIGNED) ASC, flat_number ASC`
    );
    res.status(200).json({ residents });
  } catch (error) {
    console.error("Get Admin Residents Error:", error);
    res.status(500).json({ message: "Unable to fetch residents" });
  }
};

const validateResidentContactDetails = (body = {}) => {
  const firstName = typeof body.first_name === "string" ? body.first_name.trim() : "";
  const lastName = typeof body.last_name === "string" ? body.last_name.trim() : "";
  const enteredEmail = typeof body.email === "string" ? body.email.trim() : "";
  const email = enteredEmail.toLowerCase();
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const namePattern = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9]{10}$/;

  if (!firstName || !lastName || !email || !phone) {
    return { error: "First name, last name, email and phone are required" };
  }
  if (firstName.length > 100 || lastName.length > 100) {
    return { error: "Names must be 100 characters or fewer" };
  }
  if (!namePattern.test(firstName) || !namePattern.test(lastName)) {
    return { error: "Names can contain letters, spaces, apostrophes, periods and hyphens" };
  }
  if (/[A-Z]/.test(enteredEmail)) return { error: "Email must not contain uppercase letters" };
  if (email.length > 150) return { error: "Email must be 150 characters or fewer" };
  if (!emailPattern.test(email)) return { error: "Enter a valid email address" };
  if (!phonePattern.test(phone)) {
    return { error: "Enter a phone number with exactly 10 digits" };
  }

  return { value: { firstName, lastName, email, phone } };
};

const validateResidentDetails = (body = {}) => {
  const contactValidation = validateResidentContactDetails(body);
  if (contactValidation.error) return contactValidation;

  const allowedWings = ["A", "B", "C", "D"];
  const allowedFlats = new Set(
    Array.from({ length: 5 }, (_, floorIndex) =>
      [1, 2, 3, 4].map((unit) => String((floorIndex + 1) * 100 + unit)),
    ).flat(),
  );
  const blockWing = typeof body.block_wing === "string" ? body.block_wing.trim() : "";
  const flatNumber = typeof body.flat_number === "string" ? body.flat_number.trim() : "";
  const ownershipType = typeof body.ownership_type === "string" ? body.ownership_type.trim() : "";
  const password = body.password;
  if (
    !allowedWings.includes(blockWing) ||
    !allowedFlats.has(flatNumber) ||
    !["Owner", "Rent"].includes(ownershipType)
  ) {
    return { error: "Block/Wing, flat number and ownership type are required" };
  }
  if (
    typeof password !== "string" ||
    password.length < 5 ||
    (password.match(/[0-9]/g) || []).length < 3 ||
    !/[^A-Za-z0-9\s]/.test(password) ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return { error: "Password must have at least 5 characters, 3 digits, 1 special character and be no more than 72 bytes" };
  }

  return {
    value: {
      ...contactValidation.value,
      blockWing,
      flatNumber,
      ownershipType,
      password,
    },
  };
};

const createAdminResident = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const validation = validateResidentDetails(req.body, true);
    if (validation.error) return res.status(400).json({ message: validation.error });
    const resident = validation.value;

    const [existingResidents] = await pool.query(
      "SELECT id FROM residents WHERE email = ? LIMIT 1",
      [resident.email]
    );
    if (existingResidents.length) return res.status(409).json({ message: "Email is already registered" });

    const [existingFlatResidents] = await pool.query(
      "SELECT id FROM residents WHERE user_type = 'Resident' AND block_wing = ? AND flat_number = ? LIMIT 1",
      [resident.blockWing, resident.flatNumber]
    );
    if (existingFlatResidents.length) {
      return res.status(409).json({ message: "A resident is already registered in this flat" });
    }

    const hashedPassword = await bcrypt.hash(resident.password, 10);
    const [result] = await pool.query(
      `INSERT INTO residents
         (first_name, last_name, email, phone, user_type, block_wing, flat_number,
          ownership_type, password, is_active)
       VALUES (?, ?, ?, ?, 'Resident', ?, ?, ?, ?, 1)`,
      [
        resident.firstName,
        resident.lastName,
        resident.email,
        resident.phone,
        resident.blockWing,
        resident.flatNumber,
        resident.ownershipType,
        hashedPassword,
      ]
    );
    res.status(201).json({ message: "Resident added successfully", residentId: result.insertId });
  } catch (error) {
    console.error("Create Admin Resident Error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      if (error.message.includes("uq_residents_flat")) {
        return res.status(409).json({ message: "A resident is already registered in this flat" });
      }
      return res.status(409).json({ message: "Email is already registered" });
    }
    if (error.errno === 3819 || error.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
      return res.status(400).json({ message: "Resident details do not meet database validation rules" });
    }
    res.status(500).json({ message: "Unable to add resident" });
  }
};

const updateAdminResident = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const allowedFields = ["first_name", "last_name", "email", "phone"];
    if (Object.keys(req.body || {}).some((field) => !allowedFields.includes(field))) {
      return res.status(400).json({ message: "Only resident name, email and phone can be updated" });
    }

    const validation = validateResidentContactDetails(req.body);
    if (validation.error) return res.status(400).json({ message: validation.error });
    const resident = validation.value;

    const [existingResidents] = await pool.query(
      "SELECT id FROM residents WHERE email = ? AND id <> ? LIMIT 1",
      [resident.email, req.params.id]
    );
    if (existingResidents.length) return res.status(409).json({ message: "Email is already registered" });

    const [rows] = await pool.query(
      "SELECT id FROM residents WHERE id = ? AND user_type = 'Resident'",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Resident not found" });

    await pool.query(
      `UPDATE residents
       SET first_name = ?, last_name = ?, email = ?, phone = ?
       WHERE id = ? AND user_type = 'Resident'`,
      [resident.firstName, resident.lastName, resident.email, resident.phone, req.params.id]
    );
    res.status(200).json({ message: "Resident updated successfully" });
  } catch (error) {
    console.error("Update Admin Resident Error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email is already registered" });
    }
    if (error.errno === 3819 || error.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
      return res.status(400).json({ message: "Resident details do not meet database validation rules" });
    }
    res.status(500).json({ message: "Unable to update resident" });
  }
};

const setAdminResidentArchived = async (req, res, archived) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [residents] = await pool.query(
      "SELECT id, is_active FROM residents WHERE id = ? AND user_type = 'Resident' LIMIT 1",
      [req.params.id]
    );
    if (!residents.length) return res.status(404).json({ message: "Resident not found" });
    const activeValue = archived ? 0 : 1;
    if (Number(residents[0].is_active) === activeValue) {
      return res.status(200).json({
        message: archived ? "Resident is already archived" : "Resident is already active",
        is_active: activeValue,
      });
    }
    await pool.query("UPDATE residents SET is_active = ? WHERE id = ?", [activeValue, req.params.id]);
    res.status(200).json({
      message: archived ? "Resident archived; existing records were preserved" : "Resident restored",
      is_active: activeValue,
    });
  } catch (error) {
    console.error(`${archived ? "Archive" : "Restore"} Admin Resident Error:`, error);
    res.status(500).json({ message: `Unable to ${archived ? "archive" : "restore"} resident` });
  }
};

const archiveAdminResident = (req, res) => setAdminResidentArchived(req, res, true);
const restoreAdminResident = (req, res) => setAdminResidentArchived(req, res, false);

const updateResidentOwnership = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { ownership_type } = req.body;
    if (!["Owner", "Rent"].includes(ownership_type)) {
      return res.status(400).json({ message: "Ownership type must be Owner or Rent" });
    }

    const [result] = await pool.query(
      "UPDATE residents SET ownership_type = ? WHERE id = ? AND user_type = 'Resident'",
      [ownership_type, req.params.id]
    );
    if (result.affectedRows === 0) {
      const [residents] = await pool.query("SELECT id FROM residents WHERE id = ?", [req.params.id]);
      if (!residents.length) return res.status(404).json({ message: "Resident not found" });
    }
    res.status(200).json({ message: "Resident ownership updated", ownership_type });
  } catch (error) {
    console.error("Update Resident Ownership Error:", error);
    res.status(500).json({ message: "Unable to update resident ownership" });
  }
};

const getAdminStaff = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [staff] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, department, created_at
       FROM staff ORDER BY first_name ASC, last_name ASC`
    );
    res.status(200).json({ staff });
  } catch (error) {
    console.error("Get Admin Staff Error:", error);
    res.status(500).json({ message: "Unable to fetch staff" });
  }
};

const createAdminStaff = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { first_name, last_name, email, phone, department, password } = req.body;

    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !STAFF_DEPARTMENTS.includes(department) ||
      !password
    ) {
      return res.status(400).json({ message: "All fields and a valid department are required" });
    }

    if (
      password.length < 5 ||
      (password.match(/[0-9]/g) || []).length < 3 ||
      !/[^A-Za-z0-9\s]/.test(password) ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({ message: "Password must have at least 5 characters, 3 digits, 1 special character and be no more than 72 bytes" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [existingStaff] = await pool.query(
      "SELECT id FROM staff WHERE email = ?",
      [normalizedEmail]
    );
    if (existingStaff.length > 0) {
      return res.status(409).json({ message: "Staff email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO staff (first_name, last_name, email, phone, department, password)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        first_name.trim(),
        last_name.trim(),
        normalizedEmail,
        phone.trim(),
        department,
        hashedPassword,
      ]
    );

    res.status(201).json({
      message: "Staff member added successfully",
      staffId: result.insertId,
    });
  } catch (error) {
    console.error("Create Admin Staff Error:", error);
    res.status(500).json({ message: "Unable to add staff member" });
  }
};

const updateAdminStaffDepartment = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { department } = req.body;
    if (!STAFF_DEPARTMENTS.includes(department)) {
      return res.status(400).json({ message: "Select a valid staff department" });
    }

    const [staffRows] = await pool.query("SELECT id FROM staff WHERE id = ?", [req.params.id]);
    if (staffRows.length === 0) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    await pool.query(
      "UPDATE staff SET department = ? WHERE id = ?",
      [department, req.params.id]
    );
    res.status(200).json({ message: "Staff department updated", department });
  } catch (error) {
    console.error("Update Admin Staff Department Error:", error);
    res.status(500).json({ message: "Unable to update staff department" });
  }
};

const updateAdminStaff = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const firstName = typeof req.body.first_name === "string" ? req.body.first_name.trim() : "";
    const lastName = typeof req.body.last_name === "string" ? req.body.last_name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
    const { department } = req.body;
    const namePattern = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;

    if (!namePattern.test(firstName) || !namePattern.test(lastName) || firstName.length > 100 || lastName.length > 100) {
      return res.status(400).json({ message: "Enter valid first and last names up to 100 characters" });
    }
    const emailError = getEmailError(email);
    if (emailError || email.length > 150) {
      return res.status(400).json({ message: emailError || "Email must be no more than 150 characters" });
    }
    const phoneError = getPhoneError(phone);
    if (phoneError) {
      return res.status(400).json({ message: phoneError });
    }
    if (!STAFF_DEPARTMENTS.includes(department)) {
      return res.status(400).json({ message: "Select a valid staff department" });
    }

    const [existingStaff] = await pool.query(
      "SELECT id FROM staff WHERE email = ? AND id <> ?",
      [email, req.params.id]
    );
    if (existingStaff.length) {
      return res.status(409).json({ message: "Staff email already registered" });
    }

    const [staffRows] = await pool.query("SELECT id FROM staff WHERE id = ?", [req.params.id]);
    if (!staffRows.length) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    await pool.query(
      `UPDATE staff
       SET first_name = ?, last_name = ?, email = ?, phone = ?, department = ?
       WHERE id = ?`,
      [firstName, lastName, email, phone, department, req.params.id]
    );

    res.status(200).json({ message: "Staff member updated successfully" });
  } catch (error) {
    console.error("Update Admin Staff Error:", error);
    res.status(500).json({ message: "Unable to update staff member" });
  }
};

const getAdminSecurity = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [guards] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, created_at
       FROM staff
       ORDER BY first_name ASC, last_name ASC`
    );
    const [visitorStats] = await pool.query(
      `SELECT SUM(CASE WHEN DATE(entry_time) = CURDATE() THEN 1 ELSE 0 END) AS visitors_today,
              SUM(CASE WHEN entry_time IS NOT NULL AND exit_time IS NULL THEN 1 ELSE 0 END) AS checked_in_today
       FROM visitors WHERE entry_time IS NOT NULL`
    );
    res.status(200).json({
      guards,
      visitorsToday: Number(visitorStats[0].visitors_today || 0),
      checkedInToday: Number(visitorStats[0].checked_in_today || 0),
    });
  } catch (error) {
    console.error("Get Admin Security Error:", error);
    res.status(500).json({ message: "Unable to fetch security records" });
  }
};

const getAdminPayments = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    await syncMaintenanceDues();
    const [payments] = await pool.query(
      `SELECT p.id AS payment_id, p.resident_id, p.amount, p.billing_month,
              p.due_date, p.paid_date, p.status, p.payment_method,
              p.transaction_id, p.razorpay_order_id, p.created_at,
              p.payment_type, p.penalty_amount,
              r.first_name, r.last_name, r.block_wing, r.flat_number
       FROM payments p LEFT JOIN residents r ON r.id = p.resident_id
       ORDER BY COALESCE(p.paid_date, p.created_at, p.due_date) DESC, p.id DESC`
    );
    res.status(200).json({ payments });
  } catch (error) {
    console.error("Get Admin Payments Error:", error);
    res.status(500).json({ message: "Unable to fetch payments" });
  }
};

const getAdminVisitors = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [visitors] = await pool.query(
      `SELECT v.visitor_id, v.visitor_name, v.contact_number, v.purpose,
              v.visit_date, v.expected_time, v.status, v.entry_time, v.exit_time, v.created_at,
              r.id AS resident_id, r.first_name AS resident_first_name,
              r.last_name AS resident_last_name, r.block_wing, r.flat_number
       FROM visitors v LEFT JOIN residents r ON r.id = v.resident_id
       WHERE v.entry_time IS NOT NULL
       ORDER BY v.visit_date DESC, v.expected_time DESC, v.visitor_id DESC`
    );
    res.status(200).json({ visitors });
  } catch (error) {
    console.error("Get Admin Visitors Error:", error);
    res.status(500).json({ message: "Unable to fetch visitor records" });
  }
};

const getAdminNotifications = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [notices] = await pool.query(
      `SELECT n.notice_id, n.title, n.description, n.notice_type, n.publish_date AS happened_at,
              a.name AS admin_name
       FROM notices n LEFT JOIN admins a ON a.id = n.posted_by
       ORDER BY n.publish_date DESC LIMIT 10`
    );
    const [payments] = await pool.query(
      `SELECT p.id, p.amount, p.status, p.created_at AS happened_at,
              r.id AS resident_id, r.first_name, r.last_name
       FROM payments p LEFT JOIN residents r ON r.id = p.resident_id
       ORDER BY p.created_at DESC LIMIT 10`
    );
    const [complaints] = await pool.query(
      `SELECT c.complaint_id, c.complaint_title, c.status, c.complaint_date AS happened_at,
              r.id AS resident_id, r.first_name, r.last_name, r.flat_number
       FROM complaints c LEFT JOIN residents r ON r.id = c.resident_id
       ORDER BY c.complaint_date DESC LIMIT 10`
    );
    const [visitors] = await pool.query(
      `SELECT v.visitor_id, v.visitor_name, v.purpose, v.entry_time AS happened_at,
              r.id AS resident_id, r.first_name, r.last_name, r.flat_number
       FROM visitors v LEFT JOIN residents r ON r.id = v.resident_id
       WHERE v.entry_time IS NOT NULL
       ORDER BY v.entry_time DESC LIMIT 10`
    );
    const [tasks] = await pool.query(
      `SELECT t.task_id, t.task_name, t.status, t.created_at AS happened_at,
              s.first_name, s.last_name
       FROM tasks t LEFT JOIN staff s ON s.id = t.assigned_to
       ORDER BY t.created_at DESC LIMIT 10`
    );
    const [bookings] = await pool.query(
      `SELECT fb.booking_id, fb.status, fb.booking_date AS happened_at,
              f.facility_name, r.id AS resident_id, r.first_name, r.last_name, r.flat_number
       FROM facility_bookings fb
       LEFT JOIN facilities f ON f.facility_id = fb.facility_id
       LEFT JOIN residents r ON r.id = fb.resident_id
       ORDER BY fb.booking_date DESC, fb.booking_id DESC LIMIT 10`
    );

    const notifications = [
      ...notices.map((item) => ({ id: `notice-${item.notice_id}`, title: item.title, message: item.description, type: item.notice_type || "Notice", date: item.happened_at, actorName: item.admin_name || "System", actorType: item.admin_name ? "Admin" : "System" })),
      ...payments.map((item) => ({ id: `payment-${item.id}`, title: `Payment ${item.status || "updated"}`, message: `₹${Number(item.amount || 0).toLocaleString("en-IN")}${item.first_name ? ` from ${item.first_name} ${item.last_name || ""}` : ""}`, type: "Payment", date: item.happened_at, userId: item.resident_id, actorName: [item.first_name, item.last_name].filter(Boolean).join(" ") || `Resident #${item.resident_id}`, actorType: "Resident" })),
      ...complaints.map((item) => ({ id: `complaint-${item.complaint_id}`, title: item.complaint_title || "Complaint update", message: `${item.status || "Pending"}${item.first_name ? ` · ${item.first_name} ${item.last_name || ""}${item.flat_number ? ` · Flat ${item.flat_number}` : ""}` : ""}`, type: "Complaint", date: item.happened_at, userId: item.resident_id, actorName: [item.first_name, item.last_name].filter(Boolean).join(" ") || `Resident #${item.resident_id}`, actorType: "Resident" })),
      ...visitors.map((item) => ({ id: `visitor-${item.visitor_id}`, title: `${item.visitor_name || "Visitor"} · Entry recorded`, message: `${item.purpose || "Visitor"}${item.first_name ? ` for ${item.first_name} ${item.last_name || ""}${item.flat_number ? ` · Flat ${item.flat_number}` : ""}` : ""}`, type: "Visitor", date: item.happened_at, userId: item.resident_id, actorName: [item.first_name, item.last_name].filter(Boolean).join(" ") || `Resident #${item.resident_id}`, actorType: "Resident" })),
      ...tasks.map((item) => ({ id: `task-${item.task_id}`, title: item.task_name || "Staff task", message: `${item.status || "Pending"}${item.first_name ? ` · Assigned to ${item.first_name} ${item.last_name || ""}` : ""}`, type: "Task", date: item.happened_at, actorName: [item.first_name, item.last_name].filter(Boolean).join(" ") || "Unassigned", actorType: "Staff" })),
      ...bookings.map((item) => ({ id: `booking-${item.booking_id}`, title: `${item.facility_name || "Facility"} booking · ${item.status || "Pending"}`, message: `${item.first_name ? `${item.first_name} ${item.last_name || ""}${item.flat_number ? ` · Flat ${item.flat_number}` : ""}` : "Resident booking request"}`, type: "Booking", date: item.happened_at, userId: item.resident_id, actorName: [item.first_name, item.last_name].filter(Boolean).join(" ") || `Resident #${item.resident_id}`, actorType: "Resident" })),
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 30);

    const [readRows] = await pool.query(
      "SELECT notification_id FROM admin_notification_reads WHERE admin_id = ?",
      [req.user.id]
    );
    const readIds = new Set(readRows.map((row) => row.notification_id));
    res.status(200).json({
      notifications: notifications.map((item) => ({ ...item, isRead: readIds.has(item.id) })),
    });
  } catch (error) {
    console.error("Get Admin Notifications Error:", error);
    res.status(500).json({ message: "Unable to fetch recent system activity" });
  }
};

const updateAdminNotificationReadState = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const match = /^([a-z]+)-(\d+)$/.exec(req.params.id || "");
    const source = match && ({
      notice: { table: "notices", idColumn: "notice_id" },
      payment: { table: "payments", idColumn: "id" },
      complaint: { table: "complaints", idColumn: "complaint_id" },
      visitor: { table: "visitors", idColumn: "visitor_id", additionalCondition: " AND entry_time IS NOT NULL" },
      task: { table: "tasks", idColumn: "task_id" },
      booking: { table: "facility_bookings", idColumn: "booking_id" },
    })[match[1]];
    const isRead = req.body?.isRead;
    if (!source || !Number.isSafeInteger(Number(match[2])) || ![true, false].includes(isRead)) {
      return res.status(400).json({ message: "Invalid notification read status request" });
    }

    const [records] = await pool.query(
      `SELECT 1 FROM ${source.table} WHERE ${source.idColumn} = ?${source.additionalCondition || ""} LIMIT 1`,
      [Number(match[2])]
    );
    if (!records.length) return res.status(404).json({ message: "Notification activity not found" });

    if (isRead) {
      await pool.query(
        `INSERT INTO admin_notification_reads (admin_id, notification_id)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
        [req.user.id, req.params.id]
      );
    } else {
      await pool.query(
        "DELETE FROM admin_notification_reads WHERE admin_id = ? AND notification_id = ?",
        [req.user.id, req.params.id]
      );
    }

    res.status(200).json({ message: `Notification marked as ${isRead ? "read" : "unread"}`, isRead });
  } catch (error) {
    console.error("Update Admin Notification Read State Error:", error);
    res.status(500).json({ message: "Unable to update notification read status" });
  }
};

let adminSettingsSchemaReady = false;
const ensureAdminSettingsSchema = async () => {
  if (adminSettingsSchemaReady) return;
  for (const column of ["notification_preferences", "security_preferences"]) {
    const [rows] = await pool.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'admins' AND column_name = ? LIMIT 1`,
      [column]
    );
    if (!rows.length) await pool.query(`ALTER TABLE admins ADD COLUMN ${column} JSON NULL`);
  }
  adminSettingsSchemaReady = true;
};

// An admin created before a society existed has no society_id, which left the
// Settings page empty. Link such an admin to the society automatically: the only
// society if there is one, or a default one if the table is empty. With several
// societies the choice is not obvious, so nothing is assigned.
const ensureAdminSociety = async (adminId) => {
  const [admins] = await pool.query("SELECT society_id FROM admins WHERE id = ?", [adminId]);
  if (!admins.length || admins[0].society_id) return;

  const [societies] = await pool.query("SELECT society_id FROM societies ORDER BY society_id LIMIT 2");
  let societyId = null;

  if (societies.length === 0) {
    const [created] = await pool.query("INSERT INTO societies (society_name) VALUES ('Smart Apartment')");
    societyId = created.insertId;
  } else if (societies.length === 1) {
    societyId = societies[0].society_id;
  }

  if (societyId) {
    await pool.query("UPDATE admins SET society_id = ? WHERE id = ? AND society_id IS NULL", [societyId, adminId]);
  }
};

const getAdminSettings = async (req, res) => {
  try {
    await ensureAdminSettingsSchema();
    if (!requireAdmin(req, res)) return;
    await ensureAdminSociety(req.user.id);
    const [admins] = await pool.query(
          `SELECT a.id, a.name, a.email, a.phone, a.society_id,
              a.notification_preferences, a.security_preferences,
              s.society_name AS society_name, s.address AS society_address,
              s.contact_email AS society_email, s.contact_phone AS society_phone,
              s.total_blocks, s.total_flats, s.status AS society_status
       FROM admins a
       LEFT JOIN societies s ON s.society_id = a.society_id
       WHERE a.id = ?
       LIMIT 1`,
      [req.user.id]
    );
    if (admins.length === 0) {
      return res.status(404).json({ message: "Admin account not found" });
    }
    if (!admins[0].society_id) {
      return res.status(404).json({ message: "No society is assigned to this admin" });
    }

    await pool.query("SELECT 1");
    const admin = admins[0];
    res.status(200).json({
      society: {
        id: admin.society_id,
        name: admin.society_name,
        address: admin.society_address,
        email: admin.society_email,
        phone: admin.society_phone,
        totalBlocks: String(admin.total_blocks),
        totalFlats: String(admin.total_flats),
        status: admin.society_status,
      },
      admin: { id: admin.id, name: admin.name, email: admin.email, phone: admin.phone || "" },
      notifications: admin.notification_preferences || {
        complaints: true,
        payments: true,
        bookings: true,
        notices: true,
        security: true,
        events: false,
      },
      security: admin.security_preferences || {
        twoFactor: false,
        sessionTimeout: "30",
        loginAlerts: true,
      },
      database: { status: "Connected" },
    });
  } catch (error) {
    console.error("Get Admin Settings Error:", error);
    res.status(500).json({ message: "Unable to fetch admin settings" });
  }
};

const updateAdminSocietySettings = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { name, address, email, phone, totalBlocks, totalFlats } = req.body;
    const blocks = Number(totalBlocks);
    const flats = Number(totalFlats);
    if (!name?.trim() || !email?.trim() || !Number.isInteger(blocks) || blocks < 0 ||
        !Number.isInteger(flats) || flats < 0) {
      return res.status(400).json({ message: "Enter valid society details and non-negative block/flat counts" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Enter a valid society email address" });
    }

    await ensureAdminSociety(req.user.id);
    const [societies] = await pool.query(
      `SELECT s.society_id FROM societies s
       INNER JOIN admins a ON a.society_id = s.society_id
       WHERE a.id = ? LIMIT 1`,
      [req.user.id]
    );
    if (!societies.length) return res.status(404).json({ message: "Society not found for this admin" });

    await pool.query(
      `UPDATE societies s
       INNER JOIN admins a ON a.society_id = s.society_id
       SET s.society_name = ?, s.address = ?, s.contact_email = ?, s.contact_phone = ?,
           s.total_blocks = ?, s.total_flats = ?
       WHERE a.id = ?`,
       [name.trim(), address?.trim() || "", email.trim().toLowerCase(), phone?.trim() || "", blocks, flats, req.user.id]
    );
    res.status(200).json({ message: "Society settings saved" });
  } catch (error) {
    console.error("Update Admin Society Settings Error:", error);
    res.status(500).json({ message: "Unable to save society settings" });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { name, email, phone } = req.body;
    if (!name?.trim() || !email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Enter a valid name and email address" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [duplicates] = await pool.query(
      "SELECT id FROM admins WHERE email = ? AND id <> ? LIMIT 1",
      [normalizedEmail, req.user.id]
    );
    if (duplicates.length) {
      return res.status(409).json({ message: "This email is already used by another admin" });
    }
    await pool.query(
      "UPDATE admins SET name = ?, email = ?, phone = ? WHERE id = ?",
      [name.trim(), normalizedEmail, phone?.trim() || null, req.user.id]
    );
    res.status(200).json({ message: "Admin profile updated" });
  } catch (error) {
    console.error("Update Admin Profile Error:", error);
    res.status(500).json({ message: "Unable to update admin profile" });
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { currentPassword, newPassword } = req.body;
    if (
      !currentPassword ||
      typeof newPassword !== "string" ||
      newPassword.length < 5 ||
      (newPassword.match(/[0-9]/g) || []).length < 3 ||
      !/[^A-Za-z0-9\s]/.test(newPassword) ||
      Buffer.byteLength(newPassword, "utf8") > 72
    ) {
      return res.status(400).json({ message: "New password must have at least 5 characters, 3 digits, 1 special character and be no more than 72 bytes" });
    }
    const [admins] = await pool.query("SELECT password FROM admins WHERE id = ? LIMIT 1", [req.user.id]);
    if (!admins.length) return res.status(404).json({ message: "Admin account not found" });
    const passwordMatches = await bcrypt.compare(currentPassword, admins[0].password);
    if (!passwordMatches) return res.status(400).json({ message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE admins SET password = ? WHERE id = ?", [hashedPassword, req.user.id]);
    res.status(200).json({ message: "Admin password updated" });
  } catch (error) {
    console.error("Change Admin Password Error:", error);
    res.status(500).json({ message: "Unable to update admin password" });
  }
};

const saveAdminPreference = async (req, res, column, value) => {
  if (!requireAdmin(req, res)) return;
  await pool.query(
    `UPDATE admins SET ${column} = CAST(? AS JSON) WHERE id = ?`,
    [JSON.stringify(value), req.user.id]
  );
  res.status(200).json({ message: "Preferences saved" });
};

const updateAdminNotifications = async (req, res) => {
  try {
    await ensureAdminSettingsSchema();
    const { complaints, payments, bookings, notices, security, events } = req.body;
    const preferences = { complaints, payments, bookings, notices, security, events };
    if (Object.values(preferences).some((value) => typeof value !== "boolean")) {
      return res.status(400).json({ message: "All notification preferences must be true or false" });
    }
    await saveAdminPreference(req, res, "notification_preferences", preferences);
  } catch (error) {
    console.error("Update Admin Notification Preferences Error:", error);
    res.status(500).json({ message: "Unable to save notification preferences" });
  }
};

const updateAdminSecurityPreferences = async (req, res) => {
  try {
    await ensureAdminSettingsSchema();
    const { twoFactor, sessionTimeout, loginAlerts } = req.body;
    if (typeof twoFactor !== "boolean" || typeof loginAlerts !== "boolean" ||
        !["15", "30", "60", "120"].includes(String(sessionTimeout))) {
      return res.status(400).json({ message: "Invalid security preferences" });
    }
    await saveAdminPreference(req, res, "security_preferences", {
      twoFactor,
      sessionTimeout: String(sessionTimeout),
      loginAlerts,
    });
  } catch (error) {
    console.error("Update Admin Security Preferences Error:", error);
    res.status(500).json({ message: "Unable to save security preferences" });
  }
};

const getAdminPaymentResidents = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [residents] = await pool.query(
      `SELECT id, first_name, last_name, block_wing, flat_number
       FROM residents WHERE user_type = 'Resident' AND is_active = 1
       ORDER BY block_wing, CAST(flat_number AS UNSIGNED), flat_number`
    );
    res.status(200).json({ residents });
  } catch (error) {
    console.error("Get Admin Payment Residents Error:", error);
    res.status(500).json({ message: "Unable to fetch residents for payments" });
  }
};

const createAdminPayment = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { resident_id, amount, billing_month, due_date } = req.body;
    const residentId = Number(resident_id);
    const paymentAmount = Number(amount);
    if (!Number.isInteger(residentId) || residentId <= 0 || !Number.isFinite(paymentAmount) ||
        !isValidMoney(amount) || !billing_month?.trim() || !isValidDateOnly(due_date)) {
      return res.status(400).json({ message: "Resident, positive amount, billing month and due date are required" });
    }
    const [residents] = await pool.query(
      "SELECT id FROM residents WHERE id = ? AND user_type = 'Resident' AND is_active = 1",
      [residentId]
    );
    if (!residents.length) return res.status(404).json({ message: "Resident not found" });

    const [result] = await pool.query(
      `INSERT INTO payments (resident_id, amount, billing_month, due_date, status)
       VALUES (?, ?, ?, ?, 'Pending')`,
      [residentId, paymentAmount.toFixed(2), billing_month.trim(), due_date]
    );
    res.status(201).json({ message: "Payment due added", paymentId: result.insertId });
  } catch (error) {
    console.error("Create Admin Payment Error:", error);
    res.status(500).json({ message: "Unable to create payment record" });
  }
};

const updateAdminPayment = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { amount, billing_month, due_date } = req.body;
    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || !isValidMoney(amount) || !billing_month?.trim() || !isValidDateOnly(due_date)) {
      return res.status(400).json({ message: "Positive amount, billing month and due date are required" });
    }
    const [payments] = await pool.query(
      "SELECT status, razorpay_order_id FROM payments WHERE id = ? LIMIT 1",
      [req.params.id]
    );
    if (!payments.length) return res.status(404).json({ message: "Payment record not found" });
    if (payments[0].status !== "Pending") {
      return res.status(409).json({ message: "Only pending payments can be edited" });
    }
    if (payments[0].razorpay_order_id) {
      return res.status(409).json({ message: "Payment cannot be edited after checkout has started" });
    }
    const [result] = await pool.query(
      `UPDATE payments
       SET amount = ?, billing_month = ?, due_date = ?
       WHERE id = ? AND status = 'Pending' AND razorpay_order_id IS NULL`,
      [paymentAmount.toFixed(2), billing_month.trim(), due_date, req.params.id]
    );
    if (!result.affectedRows) {
      const [currentPayments] = await pool.query(
        "SELECT status, razorpay_order_id FROM payments WHERE id = ? LIMIT 1",
        [req.params.id]
      );
      if (!currentPayments.length) return res.status(404).json({ message: "Payment record not found" });
      if (currentPayments[0].status !== "Pending" || currentPayments[0].razorpay_order_id) {
        return res.status(409).json({ message: "Payment changed and can no longer be edited" });
      }
    }
    res.status(200).json({ message: "Pending payment updated" });
  } catch (error) {
    console.error("Update Admin Payment Error:", error);
    res.status(500).json({ message: "Unable to update payment record" });
  }
};

const cancelAdminPayment = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [payments] = await pool.query(
      "SELECT status, razorpay_order_id FROM payments WHERE id = ? LIMIT 1",
      [req.params.id]
    );
    if (!payments.length) return res.status(404).json({ message: "Payment record not found" });
    if (payments[0].status !== "Pending") {
      return res.status(409).json({ message: "Only pending payment dues can be removed" });
    }
    if (payments[0].razorpay_order_id) {
      return res.status(409).json({ message: "This payment has a checkout attempt and cannot be removed" });
    }

    const [result] = await pool.query(
      `UPDATE payments
       SET status = 'Cancelled'
       WHERE id = ? AND status = 'Pending' AND razorpay_order_id IS NULL`,
      [req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(409).json({ message: "Payment changed and can no longer be removed" });
    }
    res.status(200).json({ message: "Pending payment removed from dues; its record was preserved" });
  } catch (error) {
    console.error("Remove Admin Payment Error:", error);
    res.status(500).json({ message: "Unable to remove payment due" });
  }
};

const AMENITY_NAMES = ["Swimming Pool", "Fitness Gym", "Community Hall", "Garden & Kids Play Area", "Badminton Court", "Rooftop Terrace"];
const AMENITY_PERIODS = ["Per Day", "Per Hour", "Per Month"];
const AMENITY_STATUSES = ["Available", "Booked", "Maintenance"];
const COMMUNITY_HALL_ADDONS = [
  ["Air Conditioning (AC)", 500, "Fixed"],
  ["Extra Chairs", 10, "Per Item"],
  ["Extra Tables", 50, "Per Item"],
  ["Sound System", 300, "Fixed"],
  ["Projector & Screen", 500, "Fixed"],
  ["Decoration Setup", 1000, "Fixed"],
  ["Cleaning Service", 300, "Fixed"],
  ["Generator Backup", 500, "Fixed"],
  ["Stage Setup", 700, "Fixed"],
  ["Catering Setup Area", 500, "Fixed"],
];

let amenitySetupDone = false;
const ensureAmenitySetup = async () => {
  if (amenitySetupDone) return;
  await pool.query(
    `CREATE TABLE IF NOT EXISTS facility_selected_addons (
       facility_id INT NOT NULL,
       addon_id INT NOT NULL,
       PRIMARY KEY (facility_id, addon_id),
       CONSTRAINT fk_fsa_facility FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE CASCADE,
       CONSTRAINT fk_fsa_addon FOREIGN KEY (addon_id) REFERENCES facility_addons(addon_id) ON DELETE CASCADE
     )`
  );
  for (const [name, price, type] of COMMUNITY_HALL_ADDONS) {
    const [rows] = await pool.query("SELECT addon_id FROM facility_addons WHERE addon_name = ? LIMIT 1", [name]);
    if (!rows.length) {
      await pool.query(
        "INSERT INTO facility_addons (addon_name, charge_type, price, status) VALUES (?, ?, ?, 'Available')",
        [name, type, price]
      );
    }
  }
  amenitySetupDone = true;
};

const getAdminAmenities = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    await ensureAmenitySetup();
    const [amenities] = await pool.query(
      `SELECT f.facility_id, f.facility_name, f.description, f.location,
              f.availability_status, f.base_charge, f.charge_period,
              COUNT(DISTINCT fb.booking_id) AS total_bookings,
              COUNT(DISTINCT CASE WHEN fb.status IN ('Pending', 'Approved') THEN fb.booking_id END) AS open_bookings,
              GROUP_CONCAT(DISTINCT fsa.addon_id) AS selected_addon_ids
       FROM facilities f
       LEFT JOIN facility_bookings fb ON fb.facility_id = f.facility_id
       LEFT JOIN facility_selected_addons fsa ON fsa.facility_id = f.facility_id
       GROUP BY f.facility_id, f.facility_name, f.description, f.location,
                f.availability_status, f.base_charge, f.charge_period
       ORDER BY f.facility_name ASC`
    );
    const [addons] = await pool.query(
      `SELECT addon_id, addon_name, description, charge_type, price, status
       FROM facility_addons ORDER BY addon_name ASC`
    );
    res.status(200).json({
      amenities: amenities.map((a) => ({
        ...a,
        selected_addon_ids: a.selected_addon_ids ? a.selected_addon_ids.split(",").map(Number) : [],
      })),
      addons,
    });
  } catch (error) {
    console.error("Get Admin Amenities Error:", error);
    res.status(500).json({ message: "Unable to fetch amenities" });
  }
};

const validateFacility = (body) => {
  const baseCharge = Number(body.base_charge);
  if (!AMENITY_NAMES.includes(body.facility_name) || !Number.isFinite(baseCharge) || !isValidMoney(body.base_charge, true) ||
      !AMENITY_STATUSES.includes(body.availability_status) ||
      !AMENITY_PERIODS.includes(body.charge_period)) return null;
  const ids = body.facility_name === "Community Hall" && Array.isArray(body.addon_ids)
    ? [...new Set(body.addon_ids.map(Number).filter(Number.isInteger))]
    : [];
  return {
    name: body.facility_name,
    description: body.description?.trim() || null,
    location: body.location?.trim() || null,
    status: body.availability_status,
    charge: baseCharge,
    period: body.charge_period,
    addonIds: ids,
  };
};

const saveFacilityAddons = async (facilityId, addonIds) => {
  await pool.query("DELETE FROM facility_selected_addons WHERE facility_id = ?", [facilityId]);
  for (const id of addonIds) {
    await pool.query("INSERT IGNORE INTO facility_selected_addons (facility_id, addon_id) SELECT ?, addon_id FROM facility_addons WHERE addon_id = ?", [facilityId, id]);
  }
};

const createAdminAmenity = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    await ensureAmenitySetup();
    const facility = validateFacility(req.body);
    if (!facility) return res.status(400).json({ message: "Enter valid facility details" });
    const [result] = await pool.query(
      `INSERT INTO facilities (facility_name, description, location, availability_status, base_charge, charge_period)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [facility.name, facility.description, facility.location, facility.status, facility.charge, facility.period]
    );
    await saveFacilityAddons(result.insertId, facility.addonIds);
    res.status(201).json({ message: "Amenity created", facilityId: result.insertId });
  } catch (error) {
    console.error("Create Admin Amenity Error:", error);
    res.status(500).json({ message: "Unable to create amenity" });
  }
};

const updateAdminAmenity = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    await ensureAmenitySetup();
    const facility = validateFacility(req.body);
    if (!facility) return res.status(400).json({ message: "Enter valid facility details" });
    const [amenities] = await pool.query("SELECT facility_id FROM facilities WHERE facility_id = ? LIMIT 1", [req.params.id]);
    if (!amenities.length) return res.status(404).json({ message: "Amenity not found" });
    await pool.query(
      `UPDATE facilities
       SET facility_name = ?, description = ?, location = ?, availability_status = ?,
           base_charge = ?, charge_period = ?
       WHERE facility_id = ?`,
      [facility.name, facility.description, facility.location, facility.status, facility.charge, facility.period, req.params.id]
    );
    await saveFacilityAddons(req.params.id, facility.addonIds);
    res.status(200).json({ message: "Amenity updated" });
  } catch (error) {
    console.error("Update Admin Amenity Error:", error);
    res.status(500).json({ message: "Unable to update amenity" });
  }
};

const validateAddon = (body) => {
  const price = Number(body.price);
  if (!body.addon_name?.trim() || !Number.isFinite(price) || !isValidMoney(body.price, true) ||
      !["Fixed", "Per Item", "Per Person"].includes(body.charge_type) ||
      !["Available", "Unavailable"].includes(body.status)) return null;
  return {
    name: body.addon_name.trim(),
    description: body.description?.trim() || null,
    type: body.charge_type,
    price,
    status: body.status,
  };
};

const createAdminAmenityAddon = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const addon = validateAddon(req.body);
    if (!addon) return res.status(400).json({ message: "Enter valid add-on details" });
    const [result] = await pool.query(
      `INSERT INTO facility_addons (addon_name, description, charge_type, price, status)
       VALUES (?, ?, ?, ?, ?)`,
      [addon.name, addon.description, addon.type, addon.price, addon.status]
    );
    res.status(201).json({ message: "Amenity add-on created", addonId: result.insertId });
  } catch (error) {
    console.error("Create Admin Amenity Add-on Error:", error);
    res.status(500).json({ message: "Unable to create amenity add-on" });
  }
};

const updateAdminAmenityAddon = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const addon = validateAddon(req.body);
    if (!addon) return res.status(400).json({ message: "Enter valid add-on details" });
    const [addons] = await pool.query("SELECT addon_id FROM facility_addons WHERE addon_id = ? LIMIT 1", [req.params.id]);
    if (!addons.length) return res.status(404).json({ message: "Amenity add-on not found" });
    await pool.query(
      `UPDATE facility_addons
       SET addon_name = ?, description = ?, charge_type = ?, price = ?, status = ?
       WHERE addon_id = ?`,
      [addon.name, addon.description, addon.type, addon.price, addon.status, req.params.id]
    );
    res.status(200).json({ message: "Amenity add-on updated" });
  } catch (error) {
    console.error("Update Admin Amenity Add-on Error:", error);
    res.status(500).json({ message: "Unable to update amenity add-on" });
  }
};

module.exports = {
  loginAdmin,
  getAdminDashboard,
  getAdminResidents,
  createAdminResident,
  updateAdminResident,
  archiveAdminResident,
  restoreAdminResident,
  getAdminStaff,
  createAdminStaff,
  updateAdminStaff,
  updateAdminStaffDepartment,
  getAdminSecurity,
  getAdminPayments,
  getAdminVisitors,
  getAdminAmenities,
  getAdminNotifications,
  updateAdminNotificationReadState,
  updateResidentOwnership,
  getAdminSettings,
  updateAdminSocietySettings,
  updateAdminProfile,
  changeAdminPassword,
  updateAdminNotifications,
  updateAdminSecurityPreferences,
  getAdminPaymentResidents,
  createAdminPayment,
  updateAdminPayment,
  cancelAdminPayment,
  getAdminAmenities,
  createAdminAmenity,
  updateAdminAmenity,
  createAdminAmenityAddon,
  updateAdminAmenityAddon,
};
