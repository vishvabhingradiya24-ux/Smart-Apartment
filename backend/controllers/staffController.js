const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { STAFF_DEPARTMENTS } = require("../constants/staffDepartments");
const { getEmailError, getPhoneError } = require("../utils/validation");

require("dotenv").config();

const registerStaff = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      department,
      password
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !phone ||
      !STAFF_DEPARTMENTS.includes(department) ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required"
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
      (first_name, last_name, email, phone, department, password)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        phone,
        department,
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

    const emailError = getEmailError(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const [staffList] = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        department,
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
        role: "Staff"
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

const getStaffDashboard = async (req, res) => {
  try {
    if (req.user.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const staffId = req.user.id;
    const [staffRows] = await pool.query(
      `SELECT id, first_name, last_name, department
       FROM staff
       WHERE id = ?`,
      [staffId]
    );
    if (staffRows.length === 0) {
      return res.status(404).json({ message: "Staff account not found" });
    }

    const [[counts]] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM complaints
          WHERE assigned_staff_id = ?) AS complaints_total,
         (SELECT COUNT(*) FROM complaints
          WHERE assigned_staff_id = ?
            AND status NOT IN ('Resolved', 'Completed')) AS complaints_open,
         (SELECT COUNT(*) FROM service_requests
          WHERE assigned_to = ?) AS service_requests_total,
         (SELECT COUNT(*) FROM service_requests
          WHERE assigned_to = ?
            AND status NOT IN ('Completed', 'Resolved', 'Cancelled')) AS service_requests_open,
         (SELECT COUNT(*) FROM tasks
          WHERE assigned_to = ? AND status = 'Pending') AS tasks_pending,
         (SELECT COUNT(*) FROM tasks
          WHERE assigned_to = ? AND status = 'In Progress') AS tasks_in_progress,
         (SELECT COUNT(*) FROM tasks
          WHERE assigned_to = ? AND status = 'Completed') AS tasks_completed`,
      [staffId, staffId, staffId, staffId, staffId, staffId, staffId]
    );

    const [recentActivity] = await pool.query(
      `SELECT activity_type, title, details, activity_date, status
       FROM (
         SELECT
           'Complaint' AS activity_type,
           complaint_title AS title,
           category AS details,
           updated_at AS activity_date,
           status
         FROM complaints
         WHERE assigned_staff_id = ?
         UNION ALL
         SELECT
           'Service Request' AS activity_type,
           service_type AS title,
           request_description AS details,
           COALESCE(completed_date, request_date) AS activity_date,
           status
         FROM service_requests
         WHERE assigned_to = ?
         UNION ALL
         SELECT
           'Task' AS activity_type,
           task_name AS title,
           description AS details,
           COALESCE(completed_date, created_at) AS activity_date,
           status
         FROM tasks
         WHERE assigned_to = ?
       ) AS staff_activity
       ORDER BY activity_date DESC
       LIMIT 5`,
      [staffId, staffId, staffId]
    );

    res.status(200).json({
      staff: staffRows[0],
      counts,
      recentActivity,
    });
  } catch (error) {
    console.error("Get Staff Dashboard Error:", error);
    res.status(500).json({ message: "Unable to fetch staff dashboard data" });
  }
};

const getAllStaff = async (req, res) => {
  try {
    if (req.user?.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const [staffList] = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        department,
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

const updateStaffDepartment = async (req, res) => {
  try {
    if (req.user.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const { department } = req.body;
    if (!STAFF_DEPARTMENTS.includes(department)) {
      return res.status(400).json({ message: "Select a valid staff department" });
    }

    const [staffRows] = await pool.query("SELECT id FROM staff WHERE id = ?", [req.user.id]);
    if (staffRows.length === 0) {
      return res.status(404).json({ message: "Staff account not found" });
    }

    await pool.query(
      "UPDATE staff SET department = ? WHERE id = ?",
      [department, req.user.id]
    );

    res.status(200).json({ message: "Staff department updated", department });
  } catch (error) {
    console.error("Update Staff Department Error:", error);
    res.status(500).json({ message: "Unable to update staff department" });
  }
};

// ==========================================
// GET TASKS ASSIGNED TO LOGGED-IN STAFF
// ==========================================

const getStaffTasks = async (req, res) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const staffId = req.user.id;

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
    started_at,
    created_at
  FROM tasks
  WHERE assigned_to = ?
  ORDER BY created_at DESC`,
  [staffId]
);

    res.status(200).json({
      tasks
    });

  } catch (error) {
    console.error(
      "Get Staff Tasks Error:",
      error
    );

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
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const staffId = req.user.id;
    const { taskId } = req.params;
    const { status, priority } = req.body;

    const allowedStatuses = ["Pending", "In Progress", "Completed"];
    const allowedPriorities = ["Low", "Medium", "Normal", "High", "Urgent"];

    if (status === undefined && priority === undefined) {
      return res.status(400).json({ message: "Status or priority is required" });
    }

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status"
      });
    }

    if (priority !== undefined && !allowedPriorities.includes(priority)) {
      return res.status(400).json({ message: "Invalid task priority" });
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

    const updates = [];
    const values = [];
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
      updates.push("started_at = CASE WHEN ? = 'In Progress' THEN COALESCE(started_at, CURRENT_TIMESTAMP) ELSE started_at END");
      values.push(status);
      updates.push("completed_date = CASE WHEN ? = 'Completed' THEN COALESCE(completed_date, CURRENT_TIMESTAMP) ELSE NULL END");
      values.push(status);
    }
    if (priority !== undefined) {
      updates.push("priority = ?");
      values.push(priority);
    }

    values.push(taskId, staffId);
    await pool.query(
      `UPDATE tasks SET ${updates.join(", ")} WHERE task_id = ? AND assigned_to = ?`,
      values
    );
    res.status(200).json({
      message: "Task updated successfully"
    });

  } catch (error) {
    console.error(
      "Update Staff Task Status Error:",
      error
    );

    res.status(500).json({
      message: "Unable to update task status"
    });
  }
};

const getStaffAssets = async (req, res) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const [assets] = await pool.query(
      `SELECT asset_id, asset_name, category, quantity, assigned,
              GREATEST(quantity - assigned, 0) AS available,
              condition_status, location, status, updated_at
       FROM assets ORDER BY asset_name ASC`
    );
    res.status(200).json({ assets });
  } catch (error) {
    console.error("Get Staff Assets Error:", error);
    res.status(500).json({ message: "Unable to fetch inventory. Check that the assets table exists." });
  }
};

const updateStaffAssetStatus = async (req, res) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const { assetId } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Available", "In Use", "Maintenance"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid asset status" });
    }

    const [result] = await pool.query(
      `UPDATE assets SET
         status = ?,
         assigned = CASE
           WHEN ? = 'In Use' THEN quantity
           WHEN ? = 'Available' THEN LEAST(assigned, GREATEST(quantity - 1, 0))
           ELSE assigned
         END,
         updated_at = CURRENT_TIMESTAMP
       WHERE asset_id = ?`,
      [status, status, status, assetId]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Asset not found" });
    res.status(200).json({ message: "Asset status updated successfully" });
  } catch (error) {
    console.error("Update Staff Asset Error:", error);
    res.status(500).json({ message: "Unable to update asset status" });
  }
};

const getStaffWorkHistory = async (req, res) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const [works] = await pool.query(
      `SELECT task_id, task_name, description, priority, status,
              COALESCE(completed_date, created_at) AS completed_at,
              CASE
                WHEN started_at IS NOT NULL AND completed_date IS NOT NULL
                  THEN GREATEST(TIMESTAMPDIFF(SECOND, started_at, completed_date), 0) / 3600
                ELSE NULL
              END AS duration_hours
       FROM tasks WHERE assigned_to = ? AND status = 'Completed'
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.status(200).json({ works });
  } catch (error) {
    console.error("Get Staff Work History Error:", error);
    res.status(500).json({ message: "Unable to fetch work history" });
  }
};



module.exports = {
  registerStaff,
  loginStaff,
  getStaffDashboard,
  updateStaffDepartment,
  getAllStaff,
  getStaffTasks,
  updateStaffTaskStatus,
  getStaffAssets,
  updateStaffAssetStatus,
  getStaffWorkHistory
};
