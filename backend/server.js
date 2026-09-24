const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());


// ==========================================
// ROUTES
// ==========================================

const adminRoutes = require("./routes/adminRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const residentRoutes = require("./routes/residentRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const staffRoutes = require("./routes/staffRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const noticeRoutes = require("./routes/noticeRoutes");


// ==========================================
// API ROUTES
// ==========================================

// Resident
app.use("/api/resident", residentRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Staff
app.use("/api/staff", staffRoutes);

// Complaints
app.use(
  "/api/resident/complaints",
  complaintRoutes
);

// Payments
app.use(
  "/api/resident/payments",
  paymentRoutes
);

// Service Requests
app.use(
  "/api/resident/requests",
  serviceRequestRoutes
);

// Visitors
app.use(
  "/api/resident/visitors",
  visitorRoutes
);

// Facilities / Facility Booking
app.use(
  "/api/resident/facilities",
  facilityRoutes
);

// Notices
app.use(
  "/api/notices",
  noticeRoutes
);


// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Smart Apartment API is running",
  });
});


// ==========================================
// 404 ROUTE
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});


// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    message: "Internal server error",
  });
});


// ==========================================
// SERVERs
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});