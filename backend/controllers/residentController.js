const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerResident = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      user_type,
      password
    } = req.body;

    if (!first_name || !last_name || !email || !password || !user_type) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    const allowedTypes = ["Resident", "Security", "Staff"];

    if (!allowedTypes.includes(user_type)) {
      return res.status(400).json({
        message: "Invalid user type"
      });
    }

    const [existingUser] = await pool.query(
      "SELECT id FROM residents WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO residents
      (first_name, last_name, email, phone, user_type, password)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        phone || null,
        user_type,
        hashedPassword
      ]
    );

    res.status(201).json({
      message: "Registration successful",
      userId: result.insertId
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed"
    });
  }
};

const loginResident = async (req, res) => {
  try {
    const { email, password, user_type } = req.body;

    if (!email || !password || !user_type) {
      return res.status(400).json({
        message: "Email, password and user type are required"
      });
    }

    const [users] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, user_type, password
       FROM residents
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    if (user.user_type !== user_type) {
      return res.status(401).json({
        message: "Selected user type does not match this account"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        user_type: user.user_type
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed"
    });
  }
};

const getResidents = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, user_type, created_at
       FROM residents`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch residents"
    });
  }
};

module.exports = {
  registerResident,
  loginResident,
  getResidents
};