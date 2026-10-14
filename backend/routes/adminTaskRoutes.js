const express = require("express");

const router = express.Router();

const {
  createTask,
  getAllTasks,
  getStaffForTask,
} = require("../controllers/adminTaskController");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

router.use(authMiddleware, requireAdmin);

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