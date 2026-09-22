const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testConnection } = require("./config/db");
const residentRoutes = require("./routes/residentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    message: "Smart Apartment API",
    status: "active"
  });
});

app.use("/api/admin", adminRoutes);
app.get("/api/admin/test", (req, res) => {
  res.json({
    message: "Admin route is working"
  });
});

app.use("/api/resident", residentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await testConnection();
});