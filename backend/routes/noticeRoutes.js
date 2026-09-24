const express = require("express");

const {
  createNotice,
  getAllNotices,
  getActiveNotices,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getAllNotices
);

router.get(
  "/active",
  authMiddleware,
  getActiveNotices
);

router.post(
  "/",
  authMiddleware,
  createNotice
);

router.put(
  "/:id",
  authMiddleware,
  updateNotice
);

router.delete(
  "/:id",
  authMiddleware,
  deleteNotice
);

module.exports = router;