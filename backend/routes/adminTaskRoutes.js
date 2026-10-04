const express = require("express");

const router = express.Router();

const {
  createTask,
  getAllTasks,
  getStaffForTask,
} = require("../controllers/adminTaskController");

// ==========================================
// CREATE NEW TASK
// ==========================================
router.post("/", createTask);

// ==========================================
// GET ALL TASKS
// ==========================================
router.get("/", getAllTasks);

// ==========================================
// GET STAFF LIST
// ==========================================
router.get("/staff", getStaffForTask);

module.exports = router;