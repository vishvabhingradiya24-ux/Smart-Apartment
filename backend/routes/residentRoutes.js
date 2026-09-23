const express = require("express");

const router = express.Router();

const residentController = require("../controllers/residentController");
const authMiddleware = require("../middleware/authMiddleware");

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

router.get(
  "/profile",
  authMiddleware,
  residentController.getMyProfile
);
module.exports = router;