const express = require("express");
const router = express.Router();

const {
  registerStaff,
  loginStaff
} = require("../controllers/staffController");

router.post("/register", registerStaff);
router.post("/login", loginStaff);

module.exports = router;