const express = require("express");

const {
  getMyVisitors,
  getVisitorById,
  updateMyVisitorStatus,
} = require("../controllers/visitorController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getMyVisitors);

router.get("/:id", authMiddleware, getVisitorById);

router.patch("/:id/status", authMiddleware, updateMyVisitorStatus);

module.exports = router;