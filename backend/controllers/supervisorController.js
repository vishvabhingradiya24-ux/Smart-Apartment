const { pool } = require("../config/db");
const { notifyStaff } = require("../utils/staffNotifications");

// Facility Supervisor tools: staff overview, task management, complaint
// monitoring, work verification, reports.
// The routes are limited to the "Facility Supervisor" staff type.

const TASK_PRIORITIES = ["Low", "Medium", "Normal", "High", "Urgent"];

const toNumber = (value) => Number(value) || 0;

const cleanText = (value, max) => String(value || "").trim().slice(0, max);

const isValidDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());

// ------------------------------------------------------------------
// STAFF OVERVIEW
// ------------------------------------------------------------------
const getStaffOverview = async (req, res) => {
  try {
    const [staff] = await pool.query(
      `SELECT
         s.id, s.first_name, s.last_name, s.email, s.phone, s.department, s.created_at,
         (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = s.id AND t.status = 'Pending') AS tasks_pending,
         (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = s.id AND t.status = 'In Progress') AS tasks_in_progress,
         (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = s.id AND t.status = 'Completed') AS tasks_completed,
         (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = s.id AND t.status <> 'Completed'
            AND t.due_date IS NOT NULL AND t.due_date < CURDATE()) AS tasks_overdue,
         (SELECT COUNT(*) FROM complaints c WHERE c.assigned_staff_id = s.id
            AND c.status NOT IN ('Resolved', 'Completed')) AS complaints_open
       FROM staff s
       ORDER BY s.department ASC, s.first_name ASC, s.last_name ASC`
    );

    res.status(200).json({
      staff: staff.map((person) => {
        const row = Object.fromEntries(
          Object.entries(person).map(([key, value]) =>
            key.startsWith("tasks_") || key.endsWith("_open") ? [key, toNumber(value)] : [key, value]
          )
        );

        const openWork =
          row.tasks_pending + row.tasks_in_progress + row.complaints_open;

        return {
          ...row,
          open_work: openWork,
          work_status: row.tasks_in_progress > 0 || openWork >= 3 ? "Busy" : "Available"
        };
      })
    });
  } catch (error) {
    console.error("Supervisor staff overview error:", error);
    res.status(500).json({ message: "Unable to load the staff overview" });
  }
};

// ------------------------------------------------------------------
// TASK MANAGEMENT
// ------------------------------------------------------------------
const getTasks = async (req, res) => {
  try {
    const filters = [];
    const params = [];

    if (["Pending", "In Progress", "Completed"].includes(req.query.status)) {
      filters.push("t.status = ?");
      params.push(req.query.status);
    }

    if (req.query.overdue === "1") {
      filters.push("t.status <> 'Completed' AND t.due_date IS NOT NULL AND t.due_date < CURDATE()");
    }

    const staffId = Number(req.query.staff_id);

    if (Number.isInteger(staffId) && staffId > 0) {
      filters.push("t.assigned_to = ?");
      params.push(staffId);
    }

    const [tasks] = await pool.query(
      `SELECT
         t.task_id, t.task_name, t.description, t.priority, t.status, t.location,
         t.due_date, t.created_at, t.accepted_at, t.started_at, t.completed_date,
         t.work_notes, t.verified_at, t.verification_note,
         t.assigned_to, s.first_name AS staff_first_name, s.last_name AS staff_last_name,
         s.department AS staff_department,
         (t.status <> 'Completed' AND t.due_date IS NOT NULL AND t.due_date < CURDATE()) AS is_overdue
       FROM tasks t
       LEFT JOIN staff s ON s.id = t.assigned_to
       ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
       ORDER BY (t.status = 'Completed') ASC, t.due_date IS NULL, t.due_date ASC, t.task_id DESC
       LIMIT 300`,
      params
    );

    res.status(200).json({
      tasks: tasks.map((task) => ({ ...task, is_overdue: Boolean(task.is_overdue) }))
    });
  } catch (error) {
    console.error("Supervisor get tasks error:", error);
    res.status(500).json({ message: "Unable to load tasks" });
  }
};

const createTask = async (req, res) => {
  try {
    const taskName = cleanText(req.body.task_name, 150);
    const description = cleanText(req.body.description, 1000) || null;
    const location = cleanText(req.body.location, 150) || null;
    const priority = TASK_PRIORITIES.includes(req.body.priority) ? req.body.priority : "Medium";
    const dueDate = String(req.body.due_date || "").trim();
    const assignedTo = Number(req.body.assigned_to);

    if (!taskName) {
      return res.status(400).json({ message: "Enter the task name" });
    }

    if (!Number.isInteger(assignedTo) || assignedTo < 1) {
      return res.status(400).json({ message: "Select the staff member for this task" });
    }

    if (!isValidDate(dueDate)) {
      return res.status(400).json({ message: "Select a valid deadline" });
    }

    const [staff] = await pool.query("SELECT id FROM staff WHERE id = ?", [assignedTo]);

    if (staff.length === 0) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks
        (task_name, description, assigned_to, priority, status, due_date, location, created_by_staff_id)
       VALUES (?, ?, ?, ?, 'Pending', ?, ?, ?)`,
      [taskName, description, assignedTo, priority, dueDate, location, req.staff.id]
    );

    await notifyStaff(assignedTo, {
      type: "assignment",
      title: "New task assigned",
      message: `"${taskName}" was assigned to you by the supervisor.`,
      link: "/staff/tasks"
    });

    res.status(201).json({ message: "Task created and assigned", task_id: result.insertId });
  } catch (error) {
    console.error("Supervisor create task error:", error);
    res.status(500).json({ message: "Unable to create the task" });
  }
};

const reassignTask = async (req, res) => {
  try {
    const newStaffId = Number(req.body.assigned_to);

    if (!Number.isInteger(newStaffId) || newStaffId < 1) {
      return res.status(400).json({ message: "Select the staff member for this task" });
    }

    const [tasks] = await pool.query(
      "SELECT task_id, task_name, status, assigned_to FROM tasks WHERE task_id = ?",
      [req.params.id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = tasks[0];

    if (task.status === "Completed") {
      return res.status(400).json({ message: "A completed task cannot be reassigned. Reopen it from Work Verification first." });
    }

    if (task.assigned_to === newStaffId) {
      return res.status(400).json({ message: "This task is already assigned to that staff member" });
    }

    const [staff] = await pool.query("SELECT id FROM staff WHERE id = ?", [newStaffId]);

    if (staff.length === 0) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // The new person starts fresh: they have to accept and start the work.
    await pool.query(
      `UPDATE tasks
       SET assigned_to = ?, status = 'Pending', accepted_at = NULL, started_at = NULL
       WHERE task_id = ?`,
      [newStaffId, task.task_id]
    );

    await notifyStaff(newStaffId, {
      type: "assignment",
      title: "Task reassigned to you",
      message: `"${task.task_name}" was reassigned to you by the supervisor.`,
      link: "/staff/tasks"
    });

    await notifyStaff(task.assigned_to, {
      type: "assignment",
      title: "Task reassigned",
      message: `"${task.task_name}" was moved to another staff member.`,
      link: "/staff/tasks"
    });

    res.status(200).json({ message: "Task reassigned" });
  } catch (error) {
    console.error("Supervisor reassign task error:", error);
    res.status(500).json({ message: "Unable to reassign the task" });
  }
};

// ------------------------------------------------------------------
// COMPLAINT MONITORING
// ------------------------------------------------------------------
const getComplaints = async (req, res) => {
  try {
    const filters = [];
    const params = [];

    if (req.query.status) {
      filters.push("c.status = ?");
      params.push(String(req.query.status).slice(0, 30));
    }

    if (req.query.category) {
      filters.push("c.category = ?");
      params.push(String(req.query.category).slice(0, 40));
    }

    const [complaints] = await pool.query(
      `SELECT
         c.complaint_id, c.complaint_title, c.category, c.status, c.priority,
         c.complaint_date, c.assigned_at, c.accepted_at,
         r.first_name AS resident_first_name, r.last_name AS resident_last_name,
         r.block_wing, r.flat_number,
         c.assigned_staff_id, s.first_name AS staff_first_name,
         s.last_name AS staff_last_name, s.department AS staff_department
       FROM complaints c
       LEFT JOIN residents r ON r.id = c.resident_id
       LEFT JOIN staff s ON s.id = c.assigned_staff_id
       ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
       ORDER BY (c.status = 'Resolved') ASC, c.complaint_date DESC
       LIMIT 300`,
      params
    );

    res.status(200).json({ complaints });
  } catch (error) {
    console.error("Supervisor complaints error:", error);
    res.status(500).json({ message: "Unable to load complaints" });
  }
};

// ------------------------------------------------------------------
// WORK VERIFICATION
// ------------------------------------------------------------------
const getVerificationQueue = async (req, res) => {
  try {
    const columns = `
      t.task_id, t.task_name, t.description, t.location, t.priority, t.due_date,
      t.completed_date, t.work_notes, t.verified_at, t.verification_note,
      t.assigned_to, s.first_name AS staff_first_name, s.last_name AS staff_last_name,
      s.department AS staff_department`;

    const [awaiting] = await pool.query(
      `SELECT ${columns}
       FROM tasks t LEFT JOIN staff s ON s.id = t.assigned_to
       WHERE t.status = 'Completed' AND t.verified_at IS NULL
       ORDER BY t.completed_date ASC`
    );

    const [verified] = await pool.query(
      `SELECT ${columns}
       FROM tasks t LEFT JOIN staff s ON s.id = t.assigned_to
       WHERE t.status = 'Completed' AND t.verified_at IS NOT NULL
       ORDER BY t.verified_at DESC
       LIMIT 20`
    );

    res.status(200).json({ awaiting, verified });
  } catch (error) {
    console.error("Supervisor verification queue error:", error);
    res.status(500).json({ message: "Unable to load work waiting for verification" });
  }
};

const verifyTask = async (req, res) => {
  try {
    const action = req.body.action;
    const note = cleanText(req.body.note, 500);

    if (!["approve", "reopen"].includes(action)) {
      return res.status(400).json({ message: "Choose approve or reopen" });
    }

    if (action === "reopen" && !note) {
      return res.status(400).json({ message: "Tell the staff member what is still incomplete" });
    }

    const [tasks] = await pool.query(
      "SELECT task_id, task_name, status, assigned_to, verified_at FROM tasks WHERE task_id = ?",
      [req.params.id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = tasks[0];

    if (task.status !== "Completed" || task.verified_at) {
      return res.status(400).json({ message: "This task is not waiting for verification" });
    }

    if (task.assigned_to === req.staff.id) {
      return res.status(400).json({ message: "You cannot verify your own work. Ask another supervisor or the admin." });
    }

    if (action === "approve") {
      await pool.query(
        `UPDATE tasks
         SET verified_at = CURRENT_TIMESTAMP, verified_by_staff_id = ?, verification_note = ?
         WHERE task_id = ?`,
        [req.staff.id, note || null, task.task_id]
      );

      await notifyStaff(task.assigned_to, {
        type: "approved",
        title: "Work approved",
        message: `"${task.task_name}" was verified by the supervisor.`,
        link: "/staff/tasks"
      });
    } else {
      await pool.query(
        `UPDATE tasks
         SET status = 'In Progress', completed_date = NULL, verified_at = NULL,
             verified_by_staff_id = ?, verification_note = ?
         WHERE task_id = ?`,
        [req.staff.id, note, task.task_id]
      );

      await notifyStaff(task.assigned_to, {
        type: "reopened",
        title: "Work reopened",
        message: `"${task.task_name}" was reopened: ${note}`,
        link: "/staff/tasks"
      });
    }

    res.status(200).json({
      message: action === "approve" ? "Work approved" : "Work reopened for the staff member"
    });
  } catch (error) {
    console.error("Supervisor verify task error:", error);
    res.status(500).json({ message: "Unable to update the verification" });
  }
};

// ------------------------------------------------------------------
// REPORTS
// ------------------------------------------------------------------
const RANGES = {
  today: "DATE(t.completed_date) = CURDATE()",
  week: "t.completed_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)",
  month: "t.completed_date >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)"
};

const getReports = async (req, res) => {
  try {
    const range = RANGES[req.query.range] ? req.query.range : "today";

    const [[summary]] = await pool.query(
      `SELECT
         COUNT(*) AS tasks_total,
         COALESCE(SUM(status = 'Pending'), 0) AS tasks_pending,
         COALESCE(SUM(status = 'In Progress'), 0) AS tasks_in_progress,
         COALESCE(SUM(status = 'Completed'), 0) AS tasks_completed,
         COALESCE(SUM(status <> 'Completed' AND due_date IS NOT NULL AND due_date < CURDATE()), 0) AS tasks_overdue,
         COALESCE(SUM(status = 'Completed' AND verified_at IS NULL), 0) AS awaiting_verification
       FROM tasks`
    );

    const [completed] = await pool.query(
      `SELECT t.task_id, t.task_name, t.location, t.priority, t.completed_date,
              t.work_notes, t.verified_at,
              s.first_name AS staff_first_name, s.last_name AS staff_last_name,
              s.department AS staff_department
       FROM tasks t LEFT JOIN staff s ON s.id = t.assigned_to
       WHERE t.status = 'Completed' AND ${RANGES[range]}
       ORDER BY t.completed_date DESC
       LIMIT 300`
    );

    const [staffWise] = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, s.department,
              COUNT(t.task_id) AS assigned,
              COALESCE(SUM(t.status = 'Pending'), 0) AS pending,
              COALESCE(SUM(t.status = 'In Progress'), 0) AS in_progress,
              COALESCE(SUM(t.status = 'Completed'), 0) AS completed,
              COALESCE(SUM(t.status <> 'Completed' AND t.due_date IS NOT NULL AND t.due_date < CURDATE()), 0) AS overdue
       FROM staff s
       LEFT JOIN tasks t ON t.assigned_to = s.id
       GROUP BY s.id, s.first_name, s.last_name, s.department
       ORDER BY s.department ASC, s.first_name ASC`
    );

    res.status(200).json({
      range,
      generated_at: new Date().toISOString(),
      summary: Object.fromEntries(
        Object.entries(summary).map(([key, value]) => [key, toNumber(value)])
      ),
      completed,
      staffWise: staffWise.map((row) => ({
        ...row,
        assigned: toNumber(row.assigned),
        pending: toNumber(row.pending),
        in_progress: toNumber(row.in_progress),
        completed: toNumber(row.completed),
        overdue: toNumber(row.overdue)
      }))
    });
  } catch (error) {
    console.error("Supervisor reports error:", error);
    res.status(500).json({ message: "Unable to build the report" });
  }
};

module.exports = {
  getStaffOverview,
  getTasks,
  createTask,
  reassignTask,
  getComplaints,
  getVerificationQueue,
  verifyTask,
  getReports
};
