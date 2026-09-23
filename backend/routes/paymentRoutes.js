const express = require("express");

const {
  getMyPayments,
  getCurrentPayment,
  createPaymentOrder,
  verifyPayment
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GET ALL PAYMENTS OF LOGGED-IN RESIDENT
// ==========================================

router.get(
  "/",
  authMiddleware,
  getMyPayments
);


// ==========================================
// GET CURRENT / LATEST PAYMENT
// ==========================================

router.get(
  "/current",
  authMiddleware,
  getCurrentPayment
);


// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

router.post(
  "/create-order",
  authMiddleware,
  createPaymentOrder
);


// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

router.post(
  "/verify",
  authMiddleware,
  verifyPayment
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;