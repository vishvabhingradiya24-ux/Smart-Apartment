const express = require("express");
const router = express.Router();

const {
  registerResident,
  loginResident,
  getResidents
} = require("../controllers/residentController");

router.post("/register", registerResident);
router.post("/login", loginResident);
router.get("/", getResidents);

module.exports = router;