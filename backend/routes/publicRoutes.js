const express = require("express");

const { getOverview } = require("../controllers/publicController");

const router = express.Router();

// No auth on purpose: the Home page is shown to visitors who have not
// logged in. The controller only returns aggregate, non-personal data.
router.get("/overview", getOverview);

module.exports = router;
