const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { STAFF_DEPARTMENTS } = require("../constants/staffDepartments");
const { getEmailError, getPhoneError } = require("../utils/validation");
const { notifySupervisors } = require("../utils/staffNotifications");

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
      !department ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!STAFF_DEPARTMENTS.includes(department)) {
      return res.status(400).json({
        message: "Please select a valid staff type"
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
          WHERE assigned_to = ? AND status = 'Completed') AS tasks_completed,
         (SELECT COUNT(*) FROM tasks
          WHERE assigned_to = ?) AS tasks_total,
         (SELECT COUNT(*) FROM tasks
          WHERE assigned_to = ? AND status <> 'Completed'
            AND due_date IS NOT NULL AND due_date < CURDATE()) AS tasks_overdue`,
      [staffId, staffId, staffId, staffId, staffId, staffId, staffId, staffId, staffId]
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

    // Extra numbers for the Security and Facility Supervisor dashboards.
    const department = staffRows[0].department;
    let security = null;
    let supervisor = null;

    if (department === "Security") {
      const [[visitors]] = await pool.query(
        `SELECT
           COALESCE(SUM(DATE(visit_date) = CURDATE()), 0) AS visitors_today,
           COALESCE(SUM(DATE(visit_date) = CURDATE()
             AND entry_time IS NULL
             AND status IN ('Pending', 'Approved')), 0) AS expected_today,
           COALESCE(SUM(entry_time IS NOT NULL AND exit_time IS NULL), 0) AS inside_now
         FROM visitors`
      );

      security = {
        visitors_today: Number(visitors.visitors_today) || 0,
        expected_today: Number(visitors.expected_today) || 0,
        inside_now: Number(visitors.inside_now) || 0,
      };
    }

    if (department === "Facility Supervisor") {
      const [[work]] = await pool.query(
        `SELECT
           (SELECT COUNT(*) FROM staff) AS total_staff,
           COUNT(*) AS tasks_total,
           COALESCE(SUM(status = 'Pending'), 0) AS tasks_pending,
           COALESCE(SUM(status = 'In Progress'), 0) AS tasks_in_progress,
           COALESCE(SUM(status = 'Completed'), 0) AS tasks_completed,
           COALESCE(SUM(status <> 'Completed' AND due_date IS NOT NULL AND due_date < CURDATE()), 0) AS tasks_overdue,
           COALESCE(SUM(status = 'Completed' AND verified_at IS NULL), 0) AS awaiting_verification
         FROM tasks`
      );

      supervisor = Object.fromEntries(
        Object.entries(work).map(([key, value]) => [key, Number(value) || 0])
      );
    }

    res.status(200).json({
      staff: staffRows[0],
      counts,
      recentActivity,
      security,
      supervisor,
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

    const [staffRows] = await pool.query("SELECT id, department FROM staff WHERE id = ?", [req.user.id]);
    if (staffRows.length === 0) {
      return res.status(404).json({ message: "Staff account not found" });
    }

    // A staff member can pick a type only if none was set yet (older
    // accounts). After that, only the admin can change it.
    if (staffRows[0].department) {
      return res.status(403).json({ message: "Only the admin can change your staff type" });
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
    completed_date,
    location,
    work_notes,
    accepted_at,
    verified_at,
    verification_note,
    created_at
  FROM tasks
  WHERE assigned_to = ?
  ORDER BY created_at DESC`,
  [staffId]
);

    // Verification only makes sense when there is a supervisor to do it.
    const [[supervisors]] = await pool.query(
      "SELECT COUNT(*) AS total FROM staff WHERE department = 'Facility Supervisor'"
    );

    res.status(200).json({
      tasks,
      verification_enabled: Number(supervisors.total) > 0
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
    const hasNotes = typeof req.body.work_notes === "string";
    const workNotes = hasNotes
      ? req.body.work_notes.trim().slice(0, 1000) || null
      : undefined;

    const allowedStatuses = ["Pending", "In Progress", "Completed"];
    const allowedPriorities = ["Low", "Medium", "Normal", "High", "Urgent"];

    if (status === undefined && priority === undefined && !hasNotes) {
      return res.status(400).json({ message: "Status, priority or work notes are required" });
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
      `SELECT task_id, task_name
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
      updates.push("accepted_at = COALESCE(accepted_at, CURRENT_TIMESTAMP)");
      updates.push("started_at = CASE WHEN ? = 'In Progress' THEN COALESCE(started_at, CURRENT_TIMESTAMP) ELSE started_at END");
      values.push(status);
      updates.push("completed_date = CASE WHEN ? = 'Completed' THEN COALESCE(completed_date, CURRENT_TIMESTAMP) ELSE NULL END");
      values.push(status);
      // Any change away from Completed removes an earlier verification.
      updates.push("verified_at = CASE WHEN ? = 'Completed' THEN verified_at ELSE NULL END");
      values.push(status);
    }

    if (priority !== undefined) {
      updates.push("priority = ?");
      values.push(priority);
    }

    if (hasNotes) {
      updates.push("work_notes = ?");
      values.push(workNotes);
    }

    values.push(taskId, staffId);
    await pool.query(
      `UPDATE tasks SET ${updates.join(", ")} WHERE task_id = ? AND assigned_to = ?`,
      values
    );

    if (status === "Completed") {
      const [[person]] = await pool.query(
        "SELECT first_name, last_name FROM staff WHERE id = ?",
        [staffId]
      );

      await notifySupervisors(
        {
          type: "verification",
          title: "Work ready for verification",
          message: `${person?.first_name || "A staff member"} completed "${existingTask[0].task_name}".`,
          link: "/staff/supervisor/verification"
        },
        staffId
      );
    }

    res.status(200).json({
      message: "Task updated successfully"
    });

  } catch (error) {
    console.error("Update Staff Task Status Error:", error);

    res.status(500).json({
      message: "Unable to update task"
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
      `SELECT *
       FROM (
         SELECT
           CONCAT('T', task_id) AS work_id,
           task_name AS title,
           description,
           'Task' AS work_type,
           NULL AS work_category,
           priority,
           status,
           COALESCE(completed_date, created_at) AS completed_at,
           CASE
             WHEN started_at IS NOT NULL AND completed_date IS NOT NULL
               THEN GREATEST(TIMESTAMPDIFF(SECOND, started_at, completed_date), 0) / 3600
             ELSE NULL
           END AS duration_hours
         FROM tasks
         WHERE assigned_to = ? AND status = 'Completed'

         UNION ALL

         SELECT
           CONCAT('C', complaint_id) AS work_id,
           complaint_title AS title,
           COALESCE(NULLIF(resolution_details, ''), complaint_description) AS description,
           'Complaint' AS work_type,
           category AS work_category,
           priority,
           'Completed' AS status,
           COALESCE(updated_at, complaint_date) AS completed_at,
           NULL AS duration_hours
         FROM complaints
         WHERE assigned_staff_id = ? AND status IN ('Resolved', 'Completed')
       ) AS completed_work
       ORDER BY completed_at DESC`,
      [req.user.id, req.user.id]
    );
    res.status(200).json({ works });
  } catch (error) {
    console.error("Get Staff Work History Error:", error);
    res.status(500).json({ message: "Unable to fetch work history" });
  }
};



// ==========================================
// ACCEPT A TASK
// ==========================================

const acceptStaffTask = async (req, res) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const [result] = await pool.query(
      `UPDATE tasks
       SET accepted_at = COALESCE(accepted_at, CURRENT_TIMESTAMP)
       WHERE task_id = ? AND assigned_to = ?`,
      [req.params.taskId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found or not assigned to you" });
    }

    res.status(200).json({ message: "Task accepted" });
  } catch (error) {
    console.error("Accept Task Error:", error);
    res.status(500).json({ message: "Unable to accept task" });
  }
};

// ==========================================
// NOTIFICATIONS (own only)
// ==========================================

const getStaffNotifications = async (req, res) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const [notifications] = await pool.query(
      `SELECT id, type, title, message, link, is_read, created_at
       FROM staff_notifications
       WHERE staff_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 50`,
      [req.user.id]
    );

    const [[unread]] = await pool.query(
      "SELECT COUNT(*) AS total FROM staff_notifications WHERE staff_id = ? AND is_read = 0",
      [req.user.id]
    );

    res.status(200).json({ notifications, unread: Number(unread.total) || 0 });
  } catch (error) {
    console.error("Get Staff Notifications Error:", error);
    res.status(500).json({ message: "Unable to load notifications" });
  }
};

const markStaffNotificationRead = async (req, res) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    await pool.query(
      "UPDATE staff_notifications SET is_read = 1 WHERE id = ? AND staff_id = ?",
      [req.params.id, req.user.id]
    );

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    res.status(500).json({ message: "Unable to update notification" });
  }
};

const markAllStaffNotificationsRead = async (req, res) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    await pool.query(
      "UPDATE staff_notifications SET is_read = 1 WHERE staff_id = ? AND is_read = 0",
      [req.user.id]
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark All Notifications Read Error:", error);
    res.status(500).json({ message: "Unable to update notifications" });
  }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

const changeStaffPassword = async (req, res) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (Buffer.byteLength(new_password, "utf8") > 72) {
      return res.status(400).json({ message: "New password is too long" });
    }

    if (new_password === current_password) {
      return res.status(400).json({ message: "New password must be different from the current one" });
    }

    const [rows] = await pool.query("SELECT password FROM staff WHERE id = ?", [req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Staff account not found" });
    }

    const matches = await bcrypt.compare(current_password, rows[0].password);

    if (!matches) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(new_password, 10);

    await pool.query("UPDATE staff SET password = ? WHERE id = ?", [hashed, req.user.id]);

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Staff Password Error:", error);
    res.status(500).json({ message: "Unable to change password" });
  }
};

module.exports = {
  acceptStaffTask,
  getStaffNotifications,
  markStaffNotificationRead,
  markAllStaffNotificationsRead,
  changeStaffPassword,
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
