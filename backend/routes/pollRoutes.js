const express = require("express");

const {
  getAdminPolls,
  createPoll,
  updatePoll,
  closePoll,
  reopenPoll,
  deletePoll,
  getResidentPolls,
  votePoll
} = require("../controllers/pollController");

const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

// Resident: see the polls the admin published and vote once in each
const residentPollRoutes = express.Router();

residentPollRoutes.use(authMiddleware);
residentPollRoutes.get("/", getResidentPolls);
residentPollRoutes.post("/:id/vote", votePoll);

// Admin: create and edit polls, see the results, close, reopen or delete a poll
const adminPollRoutes = express.Router();

adminPollRoutes.use(authMiddleware, requireAdmin);
adminPollRoutes.get("/", getAdminPolls);
adminPollRoutes.post("/", createPoll);
adminPollRoutes.put("/:id", updatePoll);
adminPollRoutes.put("/:id/close", closePoll);
adminPollRoutes.put("/:id/reopen", reopenPoll);
adminPollRoutes.delete("/:id", deletePoll);

module.exports = { residentPollRoutes, adminPollRoutes };
