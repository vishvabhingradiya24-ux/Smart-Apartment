const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const transporter = require("../config/email");
require("dotenv").config();


// ==============================
// REGISTER RESIDENT / USER
// ==============================

const registerResident = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      user_type,
      block_wing,
      flat_number,
      password
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !phone ||
      !user_type ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    const allowedTypes = [
      "Resident",
      "Security",
      "Staff"
    ];

    if (!allowedTypes.includes(user_type)) {
      return res.status(400).json({
        message: "Invalid user type"
      });
    }

    if (user_type === "Resident") {
      if (!block_wing || !flat_number) {
        return res.status(400).json({
          message:
            "Block/Wing and Flat Number are required for residents"
        });
      }
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

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const [result] = await pool.query(
      `INSERT INTO residents
      (
        first_name,
        last_name,
        email,
        phone,
        user_type,
        block_wing,
        flat_number,
        password
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        phone,
        user_type,
        user_type === "Resident"
          ? block_wing
          : null,
        user_type === "Resident"
          ? flat_number
          : null,
        hashedPassword
      ]
    );

    res.status(201).json({
      message: "Registration successful",
      userId: result.insertId
    });

  } catch (error) {
    console.error(
      "Registration Error:",
      error
    );

    res.status(500).json({
      message: "Registration failed"
    });
  }
};


// ==============================
// LOGIN
// ==============================

const loginResident = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required"
      });
    }

    const [users] = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        user_type,
        block_wing,
        flat_number,
        password,
        created_at
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

    const passwordMatch =
      await bcrypt.compare(
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

    delete user.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    res.status(500).json({
      message: "Login failed"
    });
  }
};


// ==============================
// FORGOT PASSWORD
// ==============================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const [users] = await pool.query(
      "SELECT id, first_name FROM residents WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message:
          "No account found with this email"
      });
    }

    const otp = Math.floor(
      100000 +
      Math.random() * 900000
    ).toString();

    const otpHash = await bcrypt.hash(
      otp,
      10
    );

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await pool.query(
      `DELETE FROM password_reset_otps
       WHERE email = ?`,
      [email]
    );

    await pool.query(
      `INSERT INTO password_reset_otps
      (
        email,
        otp_hash,
        expires_at,
        attempts
      )
      VALUES (?, ?, ?, 0)`,
      [
        email,
        otpHash,
        expiresAt
      ]
    );

    console.log(
      "Sending OTP email to:",
      email
    );

    const mailInfo =
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject:
          "Smart Apartment - Password Reset OTP",
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Smart Apartment</h2>

            <p>Hello ${users[0].first_name},</p>

            <p>
              Your password reset OTP is:
            </p>

            <h1
              style="
                letter-spacing: 5px;
                color: #2563eb;
              "
            >
              ${otp}
            </h1>

            <p>
              This OTP is valid for 10 minutes.
            </p>

            <p>
              If you did not request a password reset,
              please ignore this email.
            </p>
          </div>
        `
      });

    console.log(
      "EMAIL SENT:",
      mailInfo.messageId
    );

    console.log(
      "EMAIL RESPONSE:",
      mailInfo.response
    );

    console.log(
      "EMAIL ACCEPTED:",
      mailInfo.accepted
    );

    console.log(
      "EMAIL REJECTED:",
      mailInfo.rejected
    );

    res.status(200).json({
      message:
        "OTP sent successfully"
    });

  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to send OTP"
    });
  }
};


// ==============================
// VERIFY OTP
// ==============================

const verifyOTP = async (req, res) => {
  try {
    const {
      email,
      otp
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message:
          "Email and OTP are required"
      });
    }

    const [records] = await pool.query(
      `SELECT *
       FROM password_reset_otps
       WHERE email = ?
       ORDER BY id DESC
       LIMIT 1`,
      [email]
    );

    if (records.length === 0) {
      return res.status(404).json({
        message:
          "OTP not found. Please request a new OTP."
      });
    }

    const otpRecord = records[0];

    if (
      new Date() >
      new Date(otpRecord.expires_at)
    ) {
      return res.status(400).json({
        message:
          "OTP has expired. Please request a new OTP."
      });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        message:
          "Too many invalid attempts. Please request a new OTP."
      });
    }

    const otpMatch =
      await bcrypt.compare(
        otp.toString(),
        otpRecord.otp_hash
      );

    if (!otpMatch) {
      await pool.query(
        `UPDATE password_reset_otps
         SET attempts = attempts + 1
         WHERE id = ?`,
        [otpRecord.id]
      );

      return res.status(400).json({
        message:
          "Invalid OTP"
      });
    }

    await pool.query(
      `DELETE FROM password_reset_otps
       WHERE id = ?`,
      [otpRecord.id]
    );

    const resetToken =
      jwt.sign(
        {
          email,
          purpose: "password-reset"
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "10m"
        }
      );

    res.status(200).json({
      message:
        "OTP verified successfully",
      resetToken
    });

  } catch (error) {
    console.error(
      "Verify OTP Error:",
      error
    );

    res.status(500).json({
      message:
        "OTP verification failed"
    });
  }
};


// ==============================
// RESET PASSWORD
// ==============================

const resetPassword = async (req, res) => {
  try {
    const {
      email,
      resetToken,
      newPassword
    } = req.body;

    if (
      !email ||
      !resetToken ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "Email, reset token and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters"
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        message:
          "Invalid or expired reset token"
      });
    }

    if (
      decoded.email !== email ||
      decoded.purpose !== "password-reset"
    ) {
      return res.status(401).json({
        message:
          "Invalid reset token"
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    const [result] =
      await pool.query(
        `UPDATE residents
         SET password = ?
         WHERE email = ?`,
        [
          hashedPassword,
          email
        ]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message:
          "User not found"
      });
    }

    res.status(200).json({
      message:
        "Password reset successfully"
    });

  } catch (error) {
    console.error(
      "Reset Password Error:",
      error
    );

    res.status(500).json({
      message:
        "Password reset failed"
    });
  }
};


// ==============================
// GET ALL RESIDENTS
// ==============================

const getResidents = async (req, res) => {
  try {
    const [residents] =
      await pool.query(
        `SELECT
          id,
          first_name,
          last_name,
          email,
          phone,
          user_type,
          block_wing,
          flat_number,
          created_at
        FROM residents
        ORDER BY id DESC`
      );

    res.status(200).json(
      residents
    );

  } catch (error) {
    console.error(
      "Get Residents Error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to fetch residents"
    });
  }
};


// ==============================
// GET MY PROFILE
// ==============================

const getMyProfile = async (req, res) => {
  try {
    const residentId = req.user.id;

    const [residents] = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        block_wing,
        flat_number,
        created_at
      FROM residents
      WHERE id = ?`,
      [residentId]
    );

    if (residents.length === 0) {
      return res.status(404).json({
        message: "Resident not found"
      });
    }

    res.status(200).json({
      ...residents[0],
      user_type: "Resident"
    });

  } catch (error) {
    console.error(
      "Get Profile Error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch profile"
    });
  }
};


// ==============================
// EXPORTS
// ==============================

module.exports = {
  registerResident,
  loginResident,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getResidents,
  getMyProfile
};