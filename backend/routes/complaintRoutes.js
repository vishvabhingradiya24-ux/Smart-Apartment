const express = require("express");

const router = express.Router();

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getStaffComplaints,
  getAdminComplaints
} = require("../controllers/complaintController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createComplaint);

router.get("/my", authMiddleware, getMyComplaints);

router.get("/staff/assigned", authMiddleware, getStaffComplaints);

router.get("/admin/all", authMiddleware, getAdminComplaints);

router.get("/:id", authMiddleware, getComplaintById);

module.exports = router;