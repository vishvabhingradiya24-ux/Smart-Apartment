const { pool } = require("../config/db");

// ==========================================
// GET TASKS FOR LOGGED-IN STAFF
// ==========================================

const getStaffTasks = async (req, res) => {
  try {
    const staffId = req.user.id;

    const [tasks] = await pool.query(
      `SELECT
        task_id,
        task_name,
        description,
        assigned_to,
        priority,
        status,
        due_date,
        complate_date,
        created_at
      FROM tasks
      WHERE assigned_to = ?
      ORDER BY created_at DESC`,
      [staffId]
    );

    res.status(200).json({
      tasks,
    });

  } catch (error) {
    console.error("Get Staff Tasks Error:", error);

    res.status(500).json({
      message: "Unable to fetch staff tasks",
    });
  }
};


// ==========================================
// GET SINGLE TASK
// ==========================================

const getTaskById = async (req, res) => {
  try {
    const staffId = req.user.id;
    const taskId = req.params.id;

    const [tasks] = await pool.query(
      `SELECT
        task_id,
        task_name,
        description,
        assigned_to,
        priority,
        status,
        due_date,
        complate_date,
        created_at
      FROM tasks
      WHERE task_id = ?
      AND assigned_to = ?
      LIMIT 1`,
      [taskId, staffId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      task: tasks[0],
    });

  } catch (error) {
    console.error("Get Task By ID Error:", error);

    res.status(500).json({
      message: "Unable to fetch task",
    });
  }
};


// ==========================================
// UPDATE TASK STATUS
// ==========================================

const updateTaskStatus = async (req, res) => {
  try {
    const staffId = req.user.id;
    const taskId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Completed",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    // Check whether task belongs to logged-in staff
    const [existingTask] = await pool.query(
      `SELECT task_id
       FROM tasks
       WHERE task_id = ?
       AND assigned_to = ?
       LIMIT 1`,
      [taskId, staffId]
    );

    if (existingTask.length === 0) {
      return res.status(404).json({
        message: "Task not found or not assigned to you",
      });
    }

    let completedDate = null;

    if (status === "Completed") {
      completedDate = new Date();
    }

    await pool.query(
      `UPDATE tasks
       SET
         status = ?,
         complate_date = ?
       WHERE task_id = ?
       AND assigned_to = ?`,
      [
        status,
        completedDate,
        taskId,
        staffId,
      ]
    );

    res.status(200).json({
      message: "Task status updated successfully",
      status,
    });

  } catch (error) {
    console.error("Update Task Status Error:", error);

    res.status(500).json({
      message: "Unable to update task status",
    });
  }
};


module.exports = {
  getStaffTasks,
  getTaskById,
  updateTaskStatus,
};