const express = require("express");
const router = express.Router();

const {
  registerStaff,
  loginStaff,
  getAllStaff
} = require("../controllers/staffController");

router.post("/register", registerStaff);
router.post("/login", loginStaff);
router.get("/all", getAllStaff);

module.exports = router;