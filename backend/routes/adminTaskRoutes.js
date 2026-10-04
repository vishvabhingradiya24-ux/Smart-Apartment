const express = require("express");

const router = express.Router();

const {
  createTask,
  getAllTasks,
  getAllStaffForTask,
  updateTaskStatus,
} = require("../controllers/adminTaskController");

// ===============================
// CREATE NEW TASK
// ===============================

router.post("/", createTask);

// ===============================
// GET ALL TASKS
// ===============================

router.get("/", getAllTasks);

// ===============================
// GET STAFF LIST
// ===============================

router.get("/staff", getAllStaffForTask);

// ===============================
// UPDATE TASK STATUS
// ===============================

router.put("/:taskId/status", updateTaskStatus);

module.exports = router;