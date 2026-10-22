const express = require("express");

const router = express.Router();

const {
  registerStaff,
  loginStaff,
  getStaffDashboard,
  updateStaffDepartment,
  getStaffProfile,
  updateStaffProfile,
  getAllStaff,
  getStaffTasks,
  updateStaffTaskStatus,
  getStaffAssets,
  updateStaffAssetStatus,
  getStaffWorkHistory,
  acceptStaffTask,
  getStaffNotifications,
  markStaffNotificationRead,
  markAllStaffNotificationsRead,
  changeStaffPassword
} = require("../controllers/staffController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerStaff);

router.post("/login", loginStaff);

router.get("/dashboard", authMiddleware, getStaffDashboard);
router.get("/profile", authMiddleware, getStaffProfile);
router.put("/profile", authMiddleware, updateStaffProfile);
router.put("/profile/department", authMiddleware, updateStaffDepartment);

router.get("/all", authMiddleware, getAllStaff);

// STAFF TASKS
router.get("/tasks", authMiddleware, getStaffTasks);

router.put(
  "/tasks/:taskId/status",
  authMiddleware,
  updateStaffTaskStatus
);

router.put("/tasks/:taskId/accept", authMiddleware, acceptStaffTask);

// NOTIFICATIONS
router.get("/notifications", authMiddleware, getStaffNotifications);
router.put("/notifications/read-all", authMiddleware, markAllStaffNotificationsRead);
router.put("/notifications/:id/read", authMiddleware, markStaffNotificationRead);

router.put("/change-password", authMiddleware, changeStaffPassword);

router.get("/assets", authMiddleware, getStaffAssets);
router.put("/assets/:assetId/status", authMiddleware, updateStaffAssetStatus);
router.get("/work-history", authMiddleware, getStaffWorkHistory);

module.exports = router;
