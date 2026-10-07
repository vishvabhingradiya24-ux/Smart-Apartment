const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  getAdminDashboard,
  getAdminResidents,
  getAdminStaff,
  getAdminSecurity,
  getAdminPayments,
  getAdminVisitors,
  getAdminAmenities,
  getAdminNotifications,
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/login", loginAdmin);
router.get("/dashboard", authMiddleware, getAdminDashboard);
router.get("/residents", authMiddleware, getAdminResidents);
router.get("/staff", authMiddleware, getAdminStaff);
router.get("/security", authMiddleware, getAdminSecurity);
router.get("/payments", authMiddleware, getAdminPayments);
router.get("/visitors", authMiddleware, getAdminVisitors);
router.get("/amenities", authMiddleware, getAdminAmenities);
router.get("/notifications", authMiddleware, getAdminNotifications);

router.get("/test", (req, res) => {
  res.json({
    message: "Admin routes working"
  });
});

module.exports = router;
