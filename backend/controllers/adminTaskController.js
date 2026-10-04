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
      due_date,
    } = req.body;

    if (!task_name || !assigned_to) {
      return res.status(400).json({
        message: "Task name and staff assignment are required",
      });
    }

    // Check staff exists
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
      VALUES (?, ?, ?, ?, 'Pending', ?)`,
      [
        task_name,
        description || null,
        assigned_to,
        priority || "Normal",
        due_date || null,
      ]
    );

    res.status(201).json({
      message: "Task created and assigned successfully",
      task_id: result.insertId,
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
        t.completed_date,
        t.created_at,
        CONCAT(s.first_name, ' ', s.last_name) AS staff_name,
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
const getStaffForTask = async (req, res) => {
  try {
    const [staff] = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
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

module.exports = {
  createTask,
  getAllTasks,
  getStaffForTask,
};