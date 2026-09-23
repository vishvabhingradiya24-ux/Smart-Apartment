const bcrypt = require("bcryptjs");
const { pool } = require("./config/db");

const seedAdmin = async () => {
  try {
    const name = "Apartment Admin";
    const email = "admin@gmail.com";
    const password = "admin@123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const [existingAdmin] = await pool.query(
      "SELECT id FROM admins WHERE email = ?",
      [email]
    );

    if (existingAdmin.length > 0) {
      await pool.query(
        "UPDATE admins SET name = ?, password = ? WHERE email = ?",
        [name, hashedPassword, email]
      );

      console.log("Admin password reset successfully");
      console.log("Email:", email);
      console.log("Password:", password);
    } else {
      await pool.query(
        "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword]
      );

      console.log("Admin created successfully");
      console.log("Email:", email);
      console.log("Password:", password);
    }

    process.exit(0);
  } catch (error) {
    console.error("Admin seeder error:", error);
    process.exit(1);
  }
};

seedAdmin();