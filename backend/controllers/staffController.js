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

const getAllStaff = async (req, res) => {
  try {
    const [staffList] = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        staff_type,
        created_at
      FROM staff
      ORDER BY first_name ASC, last_name ASC`
    );

    res.status(200).json(staffList);

  } catch (error) {
    console.error("Get All Staff Error:", error);

    res.status(500).json({
      message: "Unable to fetch staff"
    });
  }
};

// ==========================================
// GET TASKS ASSIGNED TO LOGGED-IN STAFF
// ==========================================

const getStaffTasks = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token is required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED STAFF TOKEN:", decoded);

    const staffId = decoded.id;

    if (!staffId) {
      return res.status(401).json({
        message: "Staff ID not found in token"
      });
    }

    const [tasks] = await pool.query(
  `SELECT
    task_id,
    task_name,
    description,
    assigned_to,
    priority,
    status,
    due_date,
    created_at
  FROM tasks
  WHERE assigned_to = ?
  ORDER BY created_at DESC`,
  [staffId]
);

    console.log(
      `Tasks found for staff ${staffId}:`,
      tasks
    );

    res.status(200).json({
      tasks
    });

  } catch (error) {
    console.error(
      "Get Staff Tasks Error:",
      error
    );

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token"
      });
    }

    res.status(500).json({
      message: "Unable to fetch staff tasks"
    });
  }
};


// ==========================================
// UPDATE STAFF TASK STATUS
// ==========================================

const updateStaffTaskStatus = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token is required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const staffId = decoded.id;
    const { taskId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Completed"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status"
      });
    }

    const [existingTask] = await pool.query(
      `SELECT task_id
       FROM tasks
       WHERE task_id = ?
       AND assigned_to = ?`,
      [taskId, staffId]
    );

    if (existingTask.length === 0) {
      return res.status(404).json({
        message: "Task not found or not assigned to you"
      });
    }

    await pool.query(
  `UPDATE tasks
   SET status = ?
   WHERE task_id = ?
   AND assigned_to = ?`,
  [status, taskId, staffId]
);
    res.status(200).json({
      message: "Task status updated successfully"
    });

  } catch (error) {
    console.error(
      "Update Staff Task Status Error:",
      error
    );

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token"
      });
    }

    res.status(500).json({
      message: "Unable to update task status"
    });
  }
};



module.exports = {
  registerStaff,
  loginStaff,
  getAllStaff,
  getStaffTasks,
  updateStaffTaskStatus
};