const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  getAdminDashboard,
  getAdminResidents,
  getAdminStaff,
  createAdminStaff,
  getAdminSecurity,
  getAdminPayments,
  getAdminVisitors,
  getAdminAmenities,
  getAdminNotifications,
  updateResidentOwnership,
  getAdminSettings,
  updateAdminSocietySettings,
  updateAdminProfile,
  changeAdminPassword,
  updateAdminNotifications,
  updateAdminSecurityPreferences,
  getAdminPaymentResidents,
  createAdminPayment,
  updateAdminPayment,
  createAdminAmenity,
  updateAdminAmenity,
  createAdminAmenityAddon,
  updateAdminAmenityAddon,
  getAdminVisitorResidents,
  createAdminVisitor,
  updateAdminVisitor,
  updateAdminVisitorStatus,
  updateAdminVisitorGate,
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/login", loginAdmin);
router.use(authMiddleware, requireAdmin);
router.get("/dashboard", getAdminDashboard);
router.get("/residents", getAdminResidents);
router.put("/residents/:id/ownership", updateResidentOwnership);
router.get("/staff", getAdminStaff);
router.post("/staff", createAdminStaff);
router.get("/security", getAdminSecurity);
router.get("/payments", getAdminPayments);
router.get("/payments/residents", getAdminPaymentResidents);
router.post("/payments", createAdminPayment);
router.put("/payments/:id", updateAdminPayment);
router.get("/visitors", getAdminVisitors);
router.get("/visitors/residents", getAdminVisitorResidents);
router.post("/visitors", createAdminVisitor);
router.put("/visitors/:id", updateAdminVisitor);
router.patch("/visitors/:id/status", updateAdminVisitorStatus);
router.patch("/visitors/:id/gate", updateAdminVisitorGate);
router.get("/amenities", getAdminAmenities);
router.post("/amenities", createAdminAmenity);
router.put("/amenities/:id", updateAdminAmenity);
router.post("/amenities/addons", createAdminAmenityAddon);
router.put("/amenities/addons/:id", updateAdminAmenityAddon);
router.get("/notifications", getAdminNotifications);
router.get("/settings", getAdminSettings);
router.put("/settings/society", updateAdminSocietySettings);
router.put("/settings/profile", updateAdminProfile);
router.put("/settings/password", changeAdminPassword);
router.put("/settings/notifications", updateAdminNotifications);
router.put("/settings/security", updateAdminSecurityPreferences);

router.get("/test", (req, res) => {
  res.json({
    message: "Admin routes working"
  });
});

module.exports = router;
