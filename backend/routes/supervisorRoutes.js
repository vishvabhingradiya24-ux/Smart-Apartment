const express = require("express");

const {
  getStaffOverview,
  getTasks,
  createTask,
  reassignTask,
  getComplaints,
  getVerificationQueue,
  verifyTask,
  getReports
} = require("../controllers/supervisorController");
const authMiddleware = require("../middleware/authMiddleware");
const requireStaffDepartment = require("../middleware/requireStaffDepartment");

const router = express.Router();

// Everything here is for Facility Supervisors only (checked against the database).
router.use(authMiddleware, requireStaffDepartment("Facility Supervisor"));

router.get("/staff", getStaffOverview);

router.get("/tasks", getTasks);
router.post("/tasks", createTask);
router.put("/tasks/:id/reassign", reassignTask);

router.get("/complaints", getComplaints);

router.get("/verification", getVerificationQueue);
router.put("/tasks/:id/verify", verifyTask);

router.get("/reports", getReports);


module.exports = router;
