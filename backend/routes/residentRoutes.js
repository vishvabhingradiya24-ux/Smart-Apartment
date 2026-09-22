const express = require("express");

const router = express.Router();

const residentController = require("../controllers/residentController");

router.post(
  "/register",
  residentController.registerResident
);

router.post(
  "/login",
  residentController.loginResident
);

router.post(
  "/forgot-password",
  residentController.forgotPassword
);

router.post(
  "/verify-otp",
  residentController.verifyOTP
);

router.post(
  "/reset-password",
  residentController.resetPassword
);

router.get(
  "/",
  residentController.getResidents
);

module.exports = router;