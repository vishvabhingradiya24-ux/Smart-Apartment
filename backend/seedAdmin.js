const bcrypt = require("bcryptjs");
const { pool } = require("./config/db");

const seedAdmin = async () => {
  try {
    const name = "Apartment Admin";
    const email = "admin@gmail.com";
    const password = "admin@123";

    const [existingAdmin] = await pool.query(
      "SELECT id FROM admins WHERE email = ?",
      [email]
    );

    if (existingAdmin.length > 0) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    console.log("Admin created successfully");
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("Admin seeder error:", error.message);
    process.exit(1);
  }
};

seedAdmin();