const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const transporter = require("../config/email");
const { getEmailError, getPhoneError } = require("../utils/validation");
require("dotenv").config();

let passwordResetSchemaReady = false;
let passwordResetSchemaPromise = null;

const ensurePasswordResetSchema = async () => {
  if (passwordResetSchemaReady) return;
  if (passwordResetSchemaPromise) return passwordResetSchemaPromise;

  passwordResetSchemaPromise = (async () => {
    const columns = [
      ["reset_otp_hash", "VARCHAR(255) NULL"],
      ["reset_otp_expires_at", "DATETIME NULL"],
      ["reset_otp_attempts", "INT NOT NULL DEFAULT 0"],
    ];

    for (const [column, definition] of columns) {
      const [existing] = await pool.query(
        `SELECT 1
         FROM information_schema.columns
         WHERE table_schema = DATABASE()
           AND table_name = 'residents'
           AND column_name = ?
         LIMIT 1`,
        [column]
      );

      if (!existing.length) {
        await pool.query(`ALTER TABLE residents ADD COLUMN ${column} ${definition}`);
      }
    }

    passwordResetSchemaReady = true;
  })();

  try {
    await passwordResetSchemaPromise;
  } finally {
    passwordResetSchemaPromise = null;
  }
};

let residentNotificationReadSchemaReady = false;
let residentNotificationReadSchemaPromise = null;

const ensureResidentNotificationReadSchema = async () => {
  if (residentNotificationReadSchemaReady) return;
  if (residentNotificationReadSchemaPromise) return residentNotificationReadSchemaPromise;

  residentNotificationReadSchemaPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resident_notification_reads (
        resident_id INT NOT NULL,
        notification_id VARCHAR(100) NOT NULL,
        read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (resident_id, notification_id),
        CONSTRAINT fk_resident_notification_reads_resident
          FOREIGN KEY (resident_id) REFERENCES residents(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    residentNotificationReadSchemaReady = true;
  })();

  try {
    await residentNotificationReadSchemaPromise;
  } finally {
    residentNotificationReadSchemaPromise = null;
  }
};

const isResidentUser = (req, res) => {
  const residentId = Number(req.user?.id);
  if (
    req.user?.user_type !== "Resident" ||
    !Number.isSafeInteger(residentId) ||
    residentId <= 0
  ) {
    res.status(403).json({ message: "Only residents can access notification read status" });
    return false;
  }

  return true;
};

const getMyNotificationReadState = async (req, res) => {
  try {
    if (!isResidentUser(req, res)) return;

    await ensureResidentNotificationReadSchema();
    const [rows] = await pool.query(
      "SELECT notification_id FROM resident_notification_reads WHERE resident_id = ?",
      [req.user.id]
    );

    res.status(200).json({ readIds: rows.map((row) => row.notification_id) });
  } catch (error) {
    console.error("Get Resident Notification Read State Error:", error);
    res.status(500).json({ message: "Unable to fetch notification read status" });
  }
};

const updateResidentNotificationReadState = async (req, res) => {
  try {
    if (!isResidentUser(req, res)) return;

    const match = /^(notice|poll|visitor)-([1-9]\d*)$/.exec(req.params.id || "");
    const isRead = req.body?.isRead;
    if (!match || !Number.isSafeInteger(Number(match[2])) || isRead !== true) {
      return res.status(400).json({ message: "Invalid notification read status request" });
    }

    const [, type, rawId] = match;
    const notificationId = Number(rawId);
    let records;

    if (type === "notice") {
      [records] = await pool.query(
        `SELECT notice_id FROM notices
         WHERE notice_id = ? AND status = 'Active'
           AND (expiry_date IS NULL OR expiry_date >= NOW())
           AND publish_date <= NOW()
         LIMIT 1`,
        [notificationId]
      );
    } else if (type === "poll") {
      [records] = await pool.query(
        `SELECT poll_id FROM polls
         WHERE poll_id = ? AND status = 'Active' AND end_date >= CURDATE()
         LIMIT 1`,
        [notificationId]
      );
    } else {
      [records] = await pool.query(
        "SELECT visitor_id FROM visitors WHERE visitor_id = ? AND resident_id = ? LIMIT 1",
        [notificationId, req.user.id]
      );
    }

    if (!records.length) return res.status(404).json({ message: "Notification not found" });

    await ensureResidentNotificationReadSchema();
    await pool.query(
      `INSERT INTO resident_notification_reads (resident_id, notification_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
      [req.user.id, req.params.id]
    );

    res.status(200).json({ message: "Notification marked as read", isRead: true });
  } catch (error) {
    console.error("Update Resident Notification Read State Error:", error);
    res.status(500).json({ message: "Unable to update notification read status" });
  }
};


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
      ownership_type,
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

    const emailError = getEmailError(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const phoneError = getPhoneError(phone);
    if (phoneError) {
      return res.status(400).json({ message: phoneError });
    }

    if (user_type === "Resident") {
      if (!block_wing || !flat_number || !ownership_type) {
        return res.status(400).json({
          message:
            "Block/Wing, Flat Number, and Owner/Rent status are required for residents"
        });
      }

      if (!["Owner", "Rent"].includes(ownership_type)) {
        return res.status(400).json({
          message: "Owner/Rent status must be Owner or Rent"
        });
      }

      if (!["A", "B", "C", "D"].includes(block_wing)) {
        return res.status(400).json({
          message: "Block/Wing must be A, B, C or D"
        });
      }

      if (!/^[1-5]0[1-4]$/.test(flat_number)) {
        return res.status(400).json({
          message: "Flat number must be between 101 and 504 (for example 101)"
        });
      }

      const [existingFlatResidents] = await pool.query(
        "SELECT id FROM residents WHERE user_type = 'Resident' AND block_wing = ? AND flat_number = ? LIMIT 1",
        [block_wing, flat_number]
      );
      if (existingFlatResidents.length > 0) {
        return res.status(409).json({
          message: "A resident is already registered in this flat"
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
        ownership_type,
        password
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        user_type === "Resident"
          ? ownership_type
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

    if (error.code === "ER_DUP_ENTRY" && error.message.includes("uq_residents_flat")) {
      return res.status(409).json({
        message: "A resident is already registered in this flat"
      });
    }

    if (error.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
      return res.status(400).json({
        message: "Please check your details (wing, flat number, phone and email) and try again"
      });
    }

    res.status(500).json({ message: "Registration failed" });
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

    const emailError = getEmailError(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
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
      WHERE email = ?
      AND is_active = 1`,
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
  let failureStage = "database";
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    await ensurePasswordResetSchema();

    if (!transporter || !process.env.EMAIL_USER) {
      return res.status(503).json({
        message: "Password reset email is not configured. Set EMAIL_USER and EMAIL_PASS in backend/.env, then restart the backend.",
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
      `UPDATE residents
       SET reset_otp_hash = ?, reset_otp_expires_at = ?, reset_otp_attempts = 0
       WHERE id = ?`,
      [otpHash, expiresAt, users[0].id]
    );

    failureStage = "email";
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
    } catch (error) {
      await pool.query(
        `UPDATE residents
         SET reset_otp_hash = NULL, reset_otp_expires_at = NULL, reset_otp_attempts = 0
         WHERE id = ?`,
        [users[0].id]
      );
      error.emailDeliveryFailure = true;
      throw error;
    }

    res.status(200).json({
      message:
        "OTP sent successfully"
    });

  } catch (error) {
    console.error("Forgot Password Email Error:", {
      stage: failureStage,
      code: error.code || null,
      responseCode: error.responseCode || null,
      message: error.message || "Email delivery failed",
    });

    res.status(failureStage === "email" ? 502 : 500).json({
      message: failureStage === "email"
        ? "Unable to deliver OTP email. Check the email settings in backend/.env and try again."
        : "Unable to process the password reset request. Please try again.",
    });
  }
};


// ==============================
// VERIFY OTP
// ==============================

const verifyOTP = async (req, res) => {
  try {
    await ensurePasswordResetSchema();

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
      `SELECT id, reset_otp_hash AS otp_hash,
              reset_otp_expires_at AS expires_at,
              reset_otp_attempts AS attempts
       FROM residents
       WHERE email = ? AND reset_otp_hash IS NOT NULL
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
        `UPDATE residents
         SET reset_otp_attempts = reset_otp_attempts + 1
         WHERE id = ?`,
        [otpRecord.id]
      );

      return res.status(400).json({
        message:
          "Invalid OTP"
      });
    }

    await pool.query(
      `UPDATE residents
       SET reset_otp_hash = NULL, reset_otp_expires_at = NULL, reset_otp_attempts = 0
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
    await ensurePasswordResetSchema();

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

const updateMyProfile = async (req, res) => {
  try {
    if (req.user.user_type !== "Resident") {
      return res.status(403).json({ message: "Only residents can update this profile" });
    }

    const residentId = req.user.id;
    const firstName = req.body.first_name?.trim();
    const lastName = req.body.last_name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const phone = req.body.phone?.trim();

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: "All profile fields are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const [existingUsers] = await pool.query(
      "SELECT id FROM residents WHERE email = ? AND id <> ? LIMIT 1",
      [email, residentId]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    await pool.query(
      `UPDATE residents
       SET first_name = ?, last_name = ?, email = ?, phone = ?
       WHERE id = ?`,
      [firstName, lastName, email, phone, residentId]
    );

    const [residents] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, block_wing, flat_number, created_at
       FROM residents WHERE id = ?`,
      [residentId]
    );

    if (residents.length === 0) {
      return res.status(404).json({ message: "Resident not found" });
    }

    res.status(200).json({ ...residents[0], user_type: "Resident" });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Unable to update profile" });
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
  getMyProfile,
  updateMyProfile,
  getMyNotificationReadState,
  updateResidentNotificationReadState
};