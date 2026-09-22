const express = require("express");
const router = express.Router();

const { loginAdmin } = require("../controllers/adminController");

router.post("/login", loginAdmin);

router.get("/test", (req, res) => {
  res.json({
    message: "Admin routes working"
  });
});

module.exports = router;