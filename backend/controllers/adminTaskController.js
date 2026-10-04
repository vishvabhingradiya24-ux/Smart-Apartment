const { pool } = require("../config/db");

// ==========================================
// CREATE TASK
// ==========================================

const createTask = async (req, res) => {
  try {
    const {
      task_name,
      description,
      assigned_to,
      priority,
      status,
      due_date,
    } = req.body;

    if (!task_name || !assigned_to || !due_date) {
      return res.status(400).json({
        message: "Task name, assigned staff and due date are required",
      });
    }

    // Check whether selected staff exists
    const [staff] = await pool.query(
      `SELECT id, first_name, last_name, staff_type
       FROM staff
       WHERE id = ?`,
      [assigned_to]
    );

    if (staff.length === 0) {
      return res.status(404).json({
        message: "Selected staff member not found",
      });
    }

    const taskPriority = priority || "Normal";
    const taskStatus = status || "Pending";

    const [result] = await pool.query(
      `INSERT INTO tasks
      (
        task_name,
        description,
        assigned_to,
        priority,
        status,
        due_date
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        task_name,
        description || null,
        assigned_to,
        taskPriority,
        taskStatus,
        due_date,
      ]
    );

    res.status(201).json({
      message: "Task created successfully",
      taskId: result.insertId,
    });
  } catch (error) {
    console.error("Create Task Error:", error);

    res.status(500).json({
      message: "Unable to create task",
    });
  }
};


// ==========================================
// GET ALL TASKS
// ==========================================

const getAllTasks = async (req, res) => {
  try {
    const [tasks] = await pool.query(
      `SELECT
        t.task_id,
        t.task_name,
        t.description,
        t.assigned_to,
        t.priority,
        t.status,
        t.due_date,
        t.complate_date,
        t.created_at,

        s.first_name,
        s.last_name,
        s.staff_type

      FROM tasks t

      LEFT JOIN staff s
        ON t.assigned_to = s.id

      ORDER BY t.created_at DESC`
    );

    res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error("Get All Tasks Error:", error);

    res.status(500).json({
      message: "Unable to fetch tasks",
    });
  }
};


// ==========================================
// GET ALL STAFF
// ==========================================

const getAllStaffForTask = async (req, res) => {
  try {
    const [staff] = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        staff_type
      FROM staff
      ORDER BY first_name ASC, last_name ASC`
    );

    res.status(200).json({
      staff,
    });
  } catch (error) {
    console.error("Get Staff For Task Error:", error);

    res.status(500).json({
      message: "Unable to fetch staff",
    });
  }
};


// ==========================================
// UPDATE TASK STATUS
// ==========================================

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Completed",
    ];

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    const [existingTask] = await pool.query(
      `SELECT task_id
       FROM tasks
       WHERE task_id = ?`,
      [taskId]
    );

    if (existingTask.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (status === "Completed") {
      await pool.query(
        `UPDATE tasks
         SET status = ?,
             complate_date = NOW()
         WHERE task_id = ?`,
        [status, taskId]
      );
    } else {
      await pool.query(
        `UPDATE tasks
         SET status = ?,
             complate_date = NULL
         WHERE task_id = ?`,
        [status, taskId]
      );
    }

    res.status(200).json({
      message: "Task status updated successfully",
    });
  } catch (error) {
    console.error("Update Task Status Error:", error);

    res.status(500).json({
      message: "Unable to update task status",
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createTask,
  getAllTasks,
  getAllStaffForTask,
  updateTaskStatus,
};