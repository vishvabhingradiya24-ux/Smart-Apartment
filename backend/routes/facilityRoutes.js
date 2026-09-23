const express = require("express");

const {
  getFacilities,
  getMyBookings,
  createBooking,
} = require("../controllers/facilityController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Get all facilities
router.get(
  "/",
  authMiddleware,
  getFacilities
);


// Get logged-in resident bookings
router.get(
  "/bookings",
  authMiddleware,
  getMyBookings
);


// Create booking request
router.post(
  "/bookings",
  authMiddleware,
  createBooking
);


module.exports = router;
