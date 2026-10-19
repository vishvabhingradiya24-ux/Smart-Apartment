const express = require("express");

const router = express.Router();

const {
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
} = require("../controllers/staffController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerStaff);

router.post("/login", loginStaff);

router.get("/dashboard", authMiddleware, getStaffDashboard);
router.put("/profile/department", authMiddleware, updateStaffDepartment);

router.get("/all", authMiddleware, getAllStaff);

// STAFF TASKS
router.get("/tasks", authMiddleware, getStaffTasks);

router.put(
  "/tasks/:taskId/status",
  authMiddleware,
  updateStaffTaskStatus
);

router.get("/assets", authMiddleware, getStaffAssets);
router.put("/assets/:assetId/status", authMiddleware, updateStaffAssetStatus);
router.get("/work-history", authMiddleware, getStaffWorkHistory);

module.exports = router;
