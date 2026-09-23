const express = require("express");

const {
  getMyVisitors,
  createVisitor,
  getVisitorById,
} = require("../controllers/visitorController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getMyVisitors);

router.post("/", authMiddleware, createVisitor);

router.get("/:id", authMiddleware, getVisitorById);

module.exports = router;