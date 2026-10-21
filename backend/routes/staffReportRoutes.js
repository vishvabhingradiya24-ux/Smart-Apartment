const express = require("express");

const { createReport, getMyReports } = require("../controllers/staffReportController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createReport);
router.get("/mine", authMiddleware, getMyReports);

module.exports = router;
