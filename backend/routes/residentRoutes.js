const express = require("express");

const router = express.Router();

const {
  registerResident,
  loginResident,
  getResidents,
  forgotPassword,
  verifyOTP,
  resetPassword
} = require("../controllers/residentController");

router.post("/register", registerResident);

router.post("/login", loginResident);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOTP);

router.post("/reset-password", resetPassword);

router.get("/", getResidents);

module.exports = router;