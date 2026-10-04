const express = require("express");

const {
  getMyServiceRequests,
  createServiceRequest,
  getServiceRequestById,
  getStaffServiceRequests,
  updateServiceRequestStatus
} = require("../controllers/serviceRequestController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all service requests of logged-in resident
router.get(
  "/",
  authMiddleware,
  getMyServiceRequests
);

// Create new service request
router.post(
  "/",
  authMiddleware,
  createServiceRequest
);

router.get(
  "/staff",
  authMiddleware,
  getStaffServiceRequests
);

// Update service request status - Staff

router.put(
  "/staff/:id/status",
  authMiddleware,
  updateServiceRequestStatus
);

// Get single service request
router.get(
  "/:id",
  authMiddleware,
  getServiceRequestById
);

module.exports = router;