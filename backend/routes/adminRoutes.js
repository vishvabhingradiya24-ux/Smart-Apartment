const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  getAdminDashboard,
  getAdminResidents,
  createAdminResident,
  updateAdminResident,
  archiveAdminResident,
  restoreAdminResident,
  getAdminStaff,
  createAdminStaff,
  updateAdminStaffDepartment,
  getAdminSecurity,
  getAdminPayments,
  getAdminVisitors,
  getAdminAmenities,
  getAdminNotifications,
  updateAdminNotificationReadState,
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
  cancelAdminPayment,
  createAdminAmenity,
  updateAdminAmenity,
  createAdminAmenityAddon,
  updateAdminAmenityAddon,
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");
const { getIncidentReports, updateIncidentReport } = require("../controllers/adminIncidentController");
const {
  getAdminServiceRequests,
  assignServiceRequestToStaff,
} = require("../controllers/serviceRequestController");
const { getAdminAssets, createAdminAsset } = require("../controllers/adminAssetController");

router.post("/login", loginAdmin);
router.use(authMiddleware, requireAdmin);
router.get("/dashboard", getAdminDashboard);
router.get("/residents", getAdminResidents);
router.post("/residents", createAdminResident);
router.put("/residents/:id", updateAdminResident);
router.put("/residents/:id/ownership", updateResidentOwnership);
router.patch("/residents/:id/archive", archiveAdminResident);
router.patch("/residents/:id/restore", restoreAdminResident);
router.get("/staff", getAdminStaff);
router.post("/staff", createAdminStaff);
router.patch("/staff/:id/department", updateAdminStaffDepartment);
router.get("/service-requests", getAdminServiceRequests);
router.put("/service-requests/:id/assign", assignServiceRequestToStaff);
router.get("/assets", getAdminAssets);
router.post("/assets", createAdminAsset);
router.get("/security", getAdminSecurity);
router.get("/payments", getAdminPayments);
router.get("/payments/residents", getAdminPaymentResidents);
router.post("/payments", createAdminPayment);
router.put("/payments/:id", updateAdminPayment);
router.patch("/payments/:id/cancel", cancelAdminPayment);
router.get("/visitors", getAdminVisitors);
router.get("/incident-reports", getIncidentReports);
router.put("/incident-reports/:id", updateIncidentReport);
router.get("/amenities", getAdminAmenities);
router.post("/amenities", createAdminAmenity);
router.put("/amenities/:id", updateAdminAmenity);
router.post("/amenities/addons", createAdminAmenityAddon);
router.put("/amenities/addons/:id", updateAdminAmenityAddon);
router.get("/notifications", getAdminNotifications);
router.patch("/notifications/:id/read", updateAdminNotificationReadState);
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
