const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

require("dotenv").config();

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
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

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "Admin"
      },
      process.env.JWT_SECRET,
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

module.exports = {
  loginAdmin
};