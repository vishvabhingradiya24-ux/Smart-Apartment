const express = require("express");

const {
  getMyVisitors,
  createVisitor,
  getVisitorById,
  updateMyVisitorStatus,
} = require("../controllers/visitorController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getMyVisitors);

router.post("/", authMiddleware, createVisitor);

router.get("/:id", authMiddleware, getVisitorById);

router.patch("/:id/status", authMiddleware, updateMyVisitorStatus);

module.exports = router;