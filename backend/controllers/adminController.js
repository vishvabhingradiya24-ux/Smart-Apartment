const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

require("dotenv").config();

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const [admins] = await pool.query(
      `SELECT
        id,
        name,
        email,
        password,
        created_at
      FROM admins
      WHERE email = ?`,
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const admin = admins[0];

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Fallback secret કી આપી છે જેથી secretOrPrivateKey ની એરર ક્યારેય ન આવે
    const secretKey = process.env.JWT_SECRET || "my_smart_apartment_secret_key_12345";

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "Admin"
      },
      secretKey,
      {
        expiresIn: "1d"
      }
    );

    delete admin.password;

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin
    });

  } catch (error) {
    console.error("Admin Login Error:", error);

    res.status(500).json({
      message: "Admin login failed"
    });
  }
};

const isAdminUser = (user) =>
  String(user?.role || user?.user_type || "").trim().toLowerCase() === "admin";

const getAdminDashboard = async (req, res) => {
  try {
    if (!isAdminUser(req.user)) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const [residentRows] = await pool.query(
      `SELECT COUNT(*) AS total_residents,
              COUNT(DISTINCT CONCAT_WS('-', block_wing, flat_number)) AS total_flats
       FROM residents`
    );
    const [complaintRows] = await pool.query(
      `SELECT COUNT(*) AS total_complaints,
              SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_complaints
       FROM complaints`
    );
    const [paymentRows] = await pool.query(
      `SELECT COUNT(*) AS total_payments,
              COALESCE(SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END), 0) AS paid_total,
              SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_payments
       FROM payments`
    );
    const [visitorRows] = await pool.query(
      `SELECT COUNT(*) AS visitors_today,
              SUM(CASE WHEN entry_time IS NOT NULL AND DATE(entry_time) = CURDATE() THEN 1 ELSE 0 END) AS checked_in_today
       FROM visitors WHERE DATE(visit_date) = CURDATE()`
    );
    const [staffRows] = await pool.query(`SELECT COUNT(*) AS active_staff FROM staff`);
    const [facilityRows] = await pool.query(
      `SELECT COUNT(*) AS active_amenities FROM facilities WHERE availability_status = 'Available'`
    );

    const [complaints] = await pool.query(
      `SELECT c.complaint_title AS title, c.status, c.complaint_date AS activity_date,
              r.block_wing, r.flat_number
       FROM complaints c LEFT JOIN residents r ON r.id = c.resident_id
       ORDER BY c.complaint_date DESC LIMIT 5`
    );
    const [payments] = await pool.query(
      `SELECT p.amount, p.status, p.created_at AS activity_date,
              r.block_wing, r.flat_number
       FROM payments p LEFT JOIN residents r ON r.id = p.resident_id
       ORDER BY p.created_at DESC LIMIT 5`
    );
    const [visitors] = await pool.query(
      `SELECT v.visitor_name, v.status, v.created_at AS activity_date,
              r.block_wing, r.flat_number
       FROM visitors v LEFT JOIN residents r ON r.id = v.resident_id
       ORDER BY v.created_at DESC LIMIT 5`
    );
    const [tasks] = await pool.query(
      `SELECT t.task_name, t.status, t.created_at AS activity_date,
              s.first_name, s.last_name
       FROM tasks t LEFT JOIN staff s ON s.id = t.assigned_to
       ORDER BY t.created_at DESC LIMIT 5`
    );
    const [residents] = await pool.query(
      `SELECT first_name, last_name, block_wing, flat_number, created_at AS activity_date
       FROM residents ORDER BY created_at DESC LIMIT 5`
    );

    const activities = [
      ...complaints.map((row) => ({
        type: "Complaint", description: `${row.title || "Complaint"}${row.flat_number ? ` from Flat ${row.block_wing || ""}-${row.flat_number}` : ""}`,
        time: row.activity_date, status: row.status || "Pending", icon: "📋",
      })),
      ...payments.map((row) => ({
        type: "Payment", description: `₹${Number(row.amount || 0).toLocaleString("en-IN")} payment${row.flat_number ? ` from Flat ${row.block_wing || ""}-${row.flat_number}` : ""}`,
        time: row.activity_date, status: row.status || "Pending", icon: "💳",
      })),
      ...visitors.map((row) => ({
        type: "Visitor", description: `${row.visitor_name || "Visitor"}${row.flat_number ? ` for Flat ${row.block_wing || ""}-${row.flat_number}` : ""}`,
        time: row.activity_date, status: row.status || "Pending", icon: "🚪",
      })),
      ...tasks.map((row) => ({
        type: "Task", description: `${row.task_name || "Task"}${row.first_name ? ` assigned to ${row.first_name} ${row.last_name || ""}` : ""}`,
        time: row.activity_date, status: row.status || "Assigned", icon: "🔧",
      })),
      ...residents.map((row) => ({
        type: "Resident", description: `${row.first_name} ${row.last_name}${row.flat_number ? ` joined Flat ${row.block_wing || ""}-${row.flat_number}` : " joined"}`,
        time: row.activity_date, status: "New", icon: "👤",
      })),
    ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 6);

    res.status(200).json({
      stats: {
        residents: Number(residentRows[0].total_residents || 0),
        complaints: Number(complaintRows[0].total_complaints || 0),
        pendingComplaints: Number(complaintRows[0].pending_complaints || 0),
        paidTotal: Number(paymentRows[0].paid_total || 0),
        pendingPayments: Number(paymentRows[0].pending_payments || 0),
        visitorsToday: Number(visitorRows[0].visitors_today || 0),
        checkedInToday: Number(visitorRows[0].checked_in_today || 0),
      },
      community: {
        residents: Number(residentRows[0].total_residents || 0),
        flats: Number(residentRows[0].total_flats || 0),
        staff: Number(staffRows[0].active_staff || 0),
        amenities: Number(facilityRows[0].active_amenities || 0),
      },
      recentActivities: activities,
    });
  } catch (error) {
    console.error("Get Admin Dashboard Error:", error);
    res.status(500).json({ message: "Unable to load dashboard data" });
  }
};

const requireAdmin = (req, res) => {
  if (!isAdminUser(req.user)) {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }
  return true;
};

const getAdminResidents = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [residents] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, block_wing, flat_number, created_at
       FROM residents ORDER BY id DESC`
    );
    res.status(200).json({ residents });
  } catch (error) {
    console.error("Get Admin Residents Error:", error);
    res.status(500).json({ message: "Unable to fetch residents" });
  }
};

const getAdminStaff = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [staff] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, staff_type, created_at
       FROM staff ORDER BY first_name ASC, last_name ASC`
    );
    res.status(200).json({ staff });
  } catch (error) {
    console.error("Get Admin Staff Error:", error);
    res.status(500).json({ message: "Unable to fetch staff" });
  }
};

const getAdminSecurity = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [guards] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, staff_type, created_at
       FROM staff WHERE LOWER(staff_type) LIKE '%security%'
       ORDER BY first_name ASC, last_name ASC`
    );
    const [visitorStats] = await pool.query(
      `SELECT COUNT(*) AS visitors_today,
              SUM(CASE WHEN entry_time IS NOT NULL AND DATE(entry_time) = CURDATE() THEN 1 ELSE 0 END) AS checked_in_today
       FROM visitors WHERE DATE(visit_date) = CURDATE()`
    );
    res.status(200).json({
      guards,
      visitorsToday: Number(visitorStats[0].visitors_today || 0),
      checkedInToday: Number(visitorStats[0].checked_in_today || 0),
    });
  } catch (error) {
    console.error("Get Admin Security Error:", error);
    res.status(500).json({ message: "Unable to fetch security records" });
  }
};

const getAdminPayments = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [payments] = await pool.query(
      `SELECT p.id AS payment_id, p.resident_id, p.amount, p.billing_month,
              p.due_date, p.paid_date, p.status, p.payment_method,
              p.transaction_id, p.created_at,
              r.first_name, r.last_name, r.block_wing, r.flat_number
       FROM payments p LEFT JOIN residents r ON r.id = p.resident_id
       ORDER BY COALESCE(p.paid_date, p.created_at, p.due_date) DESC, p.id DESC`
    );
    res.status(200).json({ payments });
  } catch (error) {
    console.error("Get Admin Payments Error:", error);
    res.status(500).json({ message: "Unable to fetch payments" });
  }
};

const getAdminVisitors = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [visitors] = await pool.query(
      `SELECT v.visitor_id, v.visitor_name, v.contact_number, v.purpose,
              v.visit_date, v.expected_time, v.status, v.entry_time, v.exit_time, v.created_at,
              r.id AS resident_id, r.first_name AS resident_first_name,
              r.last_name AS resident_last_name, r.block_wing, r.flat_number
       FROM visitors v LEFT JOIN residents r ON r.id = v.resident_id
       ORDER BY v.visit_date DESC, v.expected_time DESC, v.visitor_id DESC`
    );
    res.status(200).json({ visitors });
  } catch (error) {
    console.error("Get Admin Visitors Error:", error);
    res.status(500).json({ message: "Unable to fetch visitor records" });
  }
};

const getAdminAmenities = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [amenities] = await pool.query(
      `SELECT f.facility_id, f.facility_name, f.description, f.location,
              f.availability_status, f.base_charge, f.charge_period,
              COUNT(fb.booking_id) AS total_bookings,
              SUM(CASE WHEN fb.status IN ('Pending', 'Approved') THEN 1 ELSE 0 END) AS open_bookings
       FROM facilities f
       LEFT JOIN facility_bookings fb ON fb.facility_id = f.facility_id
       GROUP BY f.facility_id, f.facility_name, f.description, f.location,
                f.availability_status, f.base_charge, f.charge_period
       ORDER BY f.facility_name ASC`
    );
    res.status(200).json({ amenities });
  } catch (error) {
    console.error("Get Admin Amenities Error:", error);
    res.status(500).json({ message: "Unable to fetch amenities" });
  }
};

const getAdminNotifications = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [notices] = await pool.query(
      `SELECT notice_id, title, description, notice_type, publish_date AS happened_at
       FROM notices ORDER BY publish_date DESC LIMIT 10`
    );
    const [payments] = await pool.query(
      `SELECT p.id, p.amount, p.status, p.created_at AS happened_at,
              r.id AS resident_id, r.first_name, r.last_name
       FROM payments p LEFT JOIN residents r ON r.id = p.resident_id
       ORDER BY p.created_at DESC LIMIT 10`
    );
    const [complaints] = await pool.query(
      `SELECT c.complaint_id, c.complaint_title, c.status, c.complaint_date AS happened_at,
              r.id AS resident_id, r.first_name, r.last_name, r.flat_number
       FROM complaints c LEFT JOIN residents r ON r.id = c.resident_id
       ORDER BY c.complaint_date DESC LIMIT 10`
    );
    const [visitors] = await pool.query(
      `SELECT v.visitor_id, v.visitor_name, v.status, v.purpose, v.created_at AS happened_at,
              r.id AS resident_id, r.first_name, r.last_name, r.flat_number
       FROM visitors v LEFT JOIN residents r ON r.id = v.resident_id
       ORDER BY v.created_at DESC LIMIT 10`
    );
    const [tasks] = await pool.query(
      `SELECT t.task_id, t.task_name, t.status, t.created_at AS happened_at,
              s.first_name, s.last_name
       FROM tasks t LEFT JOIN staff s ON s.id = t.assigned_to
       ORDER BY t.created_at DESC LIMIT 10`
    );
    const [bookings] = await pool.query(
      `SELECT fb.booking_id, fb.status, fb.booking_date AS happened_at,
              f.facility_name, r.id AS resident_id, r.first_name, r.last_name, r.flat_number
       FROM facility_bookings fb
       LEFT JOIN facilities f ON f.facility_id = fb.facility_id
       LEFT JOIN residents r ON r.id = fb.resident_id
       ORDER BY fb.booking_date DESC, fb.booking_id DESC LIMIT 10`
    );

    const notifications = [
      ...notices.map((item) => ({ id: `notice-${item.notice_id}`, title: item.title, message: item.description, type: item.notice_type || "Notice", date: item.happened_at, priority: "Normal" })),
      ...payments.map((item) => ({ id: `payment-${item.id}`, title: `Payment ${item.status || "updated"}`, message: `₹${Number(item.amount || 0).toLocaleString("en-IN")}${item.first_name ? ` from ${item.first_name} ${item.last_name || ""}` : ""}`, type: "Payment", date: item.happened_at, userId: item.resident_id, priority: "Normal" })),
      ...complaints.map((item) => ({ id: `complaint-${item.complaint_id}`, title: item.complaint_title || "Complaint update", message: `${item.status || "Pending"}${item.first_name ? ` · ${item.first_name} ${item.last_name || ""}${item.flat_number ? ` · Flat ${item.flat_number}` : ""}` : ""}`, type: "Complaint", date: item.happened_at, userId: item.resident_id, priority: "Normal" })),
      ...visitors.map((item) => ({ id: `visitor-${item.visitor_id}`, title: `${item.visitor_name || "Visitor"} · ${item.status || "Pending"}`, message: `${item.purpose || "Visitor request"}${item.first_name ? ` for ${item.first_name} ${item.last_name || ""}${item.flat_number ? ` · Flat ${item.flat_number}` : ""}` : ""}`, type: "Visitor", date: item.happened_at, userId: item.resident_id, priority: "Normal" })),
      ...tasks.map((item) => ({ id: `task-${item.task_id}`, title: item.task_name || "Staff task", message: `${item.status || "Pending"}${item.first_name ? ` · Assigned to ${item.first_name} ${item.last_name || ""}` : ""}`, type: "Task", date: item.happened_at, priority: "Normal" })),
      ...bookings.map((item) => ({ id: `booking-${item.booking_id}`, title: `${item.facility_name || "Facility"} booking · ${item.status || "Pending"}`, message: `${item.first_name ? `${item.first_name} ${item.last_name || ""}${item.flat_number ? ` · Flat ${item.flat_number}` : ""}` : "Resident booking request"}`, type: "Booking", date: item.happened_at, userId: item.resident_id, priority: "Normal" })),
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 30);

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Get Admin Notifications Error:", error);
    res.status(500).json({ message: "Unable to fetch recent system activity" });
  }
};

module.exports = {
  loginAdmin,
  getAdminDashboard,
  getAdminResidents,
  getAdminStaff,
  getAdminSecurity,
  getAdminPayments,
  getAdminVisitors,
  getAdminAmenities,
  getAdminNotifications
};
