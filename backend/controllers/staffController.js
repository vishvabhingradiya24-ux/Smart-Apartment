const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

require("dotenv").config();

const registerStaff = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      staff_type,
      password
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !phone ||
      !staff_type ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const allowedStaffTypes = [
      "Security Staff",
      "Maintenance Staff",
      "Housekeeping Staff",
      "Reception Staff",
      "Other"
    ];

    if (!allowedStaffTypes.includes(staff_type)) {
      return res.status(400).json({
        message: "Invalid staff type"
      });
    }

    const [existingStaff] = await pool.query(
      "SELECT id FROM staff WHERE email = ?",
      [email]
    );

    if (existingStaff.length > 0) {
      return res.status(409).json({
        message: "Staff email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO staff
      (first_name, last_name, email, phone, staff_type, password)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        phone,
        staff_type,
        hashedPassword
      ]
    );

    res.status(201).json({
      message: "Staff registered successfully",
      staffId: result.insertId
    });

  } catch (error) {
    console.error("Staff Registration Error:", error);

    res.status(500).json({
      message: "Staff registration failed"
    });
  }
};

const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const [staffList] = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        staff_type,
        password,
        created_at
      FROM staff
      WHERE email = ?`,
      [email]
    );

    if (staffList.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const staff = staffList[0];

    const passwordMatch = await bcrypt.compare(
      password,
      staff.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: staff.id,
        email: staff.email,
        role: "Staff",
        staff_type: staff.staff_type
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    delete staff.password;

    res.status(200).json({
      message: "Staff login successful",
      token,
      staff
    });

  } catch (error) {
    console.error("Staff Login Error:", error);

    res.status(500).json({
      message: "Staff login failed"
    });
  }
};

module.exports = {
  registerStaff,
  loginStaff
};