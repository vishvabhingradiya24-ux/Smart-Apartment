const express = require("express");

const router = express.Router();

const {
  registerStaff,
  loginStaff,
  getAllStaff,
  getStaffTasks,
  updateStaffTaskStatus
} = require("../controllers/staffController");

router.post("/register", registerStaff);

router.post("/login", loginStaff);

router.get("/all", getAllStaff);

// STAFF TASKS
router.get("/tasks", getStaffTasks);

router.put(
  "/tasks/:taskId/status",
  updateStaffTaskStatus
);

module.exports = router;