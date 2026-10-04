const express = require("express");

const {
  getStaffTasks,
  getTaskById,
  updateTaskStatus,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GET ALL TASKS FOR LOGGED-IN STAFF
// ==========================================

router.get(
  "/",
  authMiddleware,
  getStaffTasks
);

// ==========================================
// UPDATE TASK STATUS
// ==========================================

router.put(
  "/:id/status",
  authMiddleware,
  updateTaskStatus
);

// ==========================================
// GET SINGLE TASK
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  getTaskById
);

module.exports = router;