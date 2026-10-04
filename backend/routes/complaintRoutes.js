const express = require("express");

const router = express.Router();

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,

  getStaffComplaints,
  updateComplaintStatus,

  getAdminComplaints,
  assignComplaintToStaff

} = require("../controllers/complaintController");

const authMiddleware = require("../middleware/authMiddleware");


// ======================================================
// RESIDENT
// ======================================================

// Create complaint
router.post(
  "/",
  authMiddleware,
  createComplaint
);


// Get logged-in resident complaints
router.get(
  "/my",
  authMiddleware,
  getMyComplaints
);


// Get single resident complaint
router.get(
  "/:id",
  authMiddleware,
  getComplaintById
);


// ======================================================
// STAFF
// ======================================================

// Get complaints assigned to logged-in staff
router.get(
  "/staff/assigned",
  authMiddleware,
  getStaffComplaints
);


// Staff update complaint status
router.put(
  "/staff/:id/status",
  authMiddleware,
  updateComplaintStatus
);


// ======================================================
// ADMIN
// ======================================================

// Get all complaints
router.get(
  "/admin/all",
  authMiddleware,
  getAdminComplaints
);


// Assign complaint to staff
router.put(
  "/admin/:id/assign",
  authMiddleware,
  assignComplaintToStaff
);


module.exports = router;