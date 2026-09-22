const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getMyComplaints,
  getComplaintById
} = require("../controllers/complaintController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createComplaint);

router.get("/my", authMiddleware, getMyComplaints);

router.get("/:id", authMiddleware, getComplaintById);

module.exports = router;