const express = require("express");

const {
  getVisitors,
  getFlats,
  registerVisitor,
  recordEntry,
  recordExit
} = require("../controllers/securityController");
const authMiddleware = require("../middleware/authMiddleware");
const requireStaffDepartment = require("../middleware/requireStaffDepartment");

const router = express.Router();

// Everything here is for Security staff only (checked against the database).
router.use(authMiddleware, requireStaffDepartment("Security"));

router.get("/visitors", getVisitors);
router.get("/flats", getFlats);
router.post("/visitors", registerVisitor);
router.patch("/visitors/:id/entry", recordEntry);
router.patch("/visitors/:id/exit", recordExit);

module.exports = router;
