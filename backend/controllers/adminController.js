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

const isValidDateOnly = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const isValidTime = (value) =>
  typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);

const isValidMoney = (value, allowZero = false) => {
  const amount = String(value ?? "");
  return /^\d{1,8}(?:\.\d{1,2})?$/.test(amount) &&
    (allowZero ? Number(amount) >= 0 : Number(amount) > 0);
};

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
      `SELECT id, first_name, last_name, email, phone, block_wing, flat_number, ownership_type, created_at
       FROM residents
       ORDER BY block_wing ASC, CAST(flat_number AS UNSIGNED) ASC, flat_number ASC`
    );
    res.status(200).json({ residents });
  } catch (error) {
    console.error("Get Admin Residents Error:", error);
    res.status(500).json({ message: "Unable to fetch residents" });
  }
};

const updateResidentOwnership = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { ownership_type } = req.body;
    if (!["Owner", "Rent"].includes(ownership_type)) {
      return res.status(400).json({ message: "Ownership type must be Owner or Rent" });
    }

    const [result] = await pool.query(
      "UPDATE residents SET ownership_type = ? WHERE id = ?",
      [ownership_type, req.params.id]
    );
    if (result.affectedRows === 0) {
      const [residents] = await pool.query("SELECT id FROM residents WHERE id = ?", [req.params.id]);
      if (!residents.length) return res.status(404).json({ message: "Resident not found" });
    }
    res.status(200).json({ message: "Resident ownership updated", ownership_type });
  } catch (error) {
    console.error("Update Resident Ownership Error:", error);
    res.status(500).json({ message: "Unable to update resident ownership" });
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

const createAdminStaff = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { first_name, last_name, email, phone, staff_type, password } = req.body;
    const allowedStaffTypes = [
      "Security Staff",
      "Maintenance Staff",
      "Housekeeping Staff",
      "Reception Staff",
      "Other",
    ];

    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !staff_type ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!allowedStaffTypes.includes(staff_type)) {
      return res.status(400).json({ message: "Invalid staff type" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [existingStaff] = await pool.query(
      "SELECT id FROM staff WHERE email = ?",
      [normalizedEmail]
    );
    if (existingStaff.length > 0) {
      return res.status(409).json({ message: "Staff email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO staff (first_name, last_name, email, phone, staff_type, password)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        first_name.trim(),
        last_name.trim(),
        normalizedEmail,
        phone.trim(),
        staff_type,
        hashedPassword,
      ]
    );

    res.status(201).json({
      message: "Staff member added successfully",
      staffId: result.insertId,
    });
  } catch (error) {
    console.error("Create Admin Staff Error:", error);
    res.status(500).json({ message: "Unable to add staff member" });
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

const getAdminSettings = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [admins] = await pool.query(
      `SELECT a.id, a.name, a.email, a.phone, a.society_id,
              s.society_name AS society_name, s.address AS society_address,
              s.contact_email AS society_email, s.contact_phone AS society_phone,
              s.total_blocks, s.total_flats, s.status AS society_status
       FROM admins a
       LEFT JOIN societies s ON s.society_id = a.society_id
       WHERE a.id = ?
       LIMIT 1`,
      [req.user.id]
    );
    if (admins.length === 0) {
      return res.status(404).json({ message: "Admin account not found" });
    }
    if (!admins[0].society_id) {
      return res.status(404).json({ message: "No society is assigned to this admin" });
    }

    const [preferences] = await pool.query(
      `SELECT notification_preferences, security_preferences
       FROM admin_preferences WHERE admin_id = ? LIMIT 1`,
      [req.user.id]
    );
    await pool.query("SELECT 1");
    const admin = admins[0];
    res.status(200).json({
      society: {
        id: admin.society_id,
        name: admin.society_name,
        address: admin.society_address,
        email: admin.society_email,
        phone: admin.society_phone,
        totalBlocks: String(admin.total_blocks),
        totalFlats: String(admin.total_flats),
        status: admin.society_status,
      },
      admin: { id: admin.id, name: admin.name, email: admin.email, phone: admin.phone || "" },
      notifications: preferences[0]?.notification_preferences || {
        complaints: true,
        payments: true,
        bookings: true,
        notices: true,
        security: true,
        events: false,
      },
      security: preferences[0]?.security_preferences || {
        twoFactor: false,
        sessionTimeout: "30",
        loginAlerts: true,
      },
      database: { status: "Connected" },
    });
  } catch (error) {
    console.error("Get Admin Settings Error:", error);
    res.status(500).json({ message: "Unable to fetch admin settings" });
  }
};

const updateAdminSocietySettings = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { name, address, email, phone, totalBlocks, totalFlats } = req.body;
    const blocks = Number(totalBlocks);
    const flats = Number(totalFlats);
    if (!name?.trim() || !email?.trim() || !Number.isInteger(blocks) || blocks < 0 ||
        !Number.isInteger(flats) || flats < 0) {
      return res.status(400).json({ message: "Enter valid society details and non-negative block/flat counts" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Enter a valid society email address" });
    }

    const [societies] = await pool.query(
      `SELECT s.society_id FROM societies s
       INNER JOIN admins a ON a.society_id = s.society_id
       WHERE a.id = ? LIMIT 1`,
      [req.user.id]
    );
    if (!societies.length) return res.status(404).json({ message: "Society not found for this admin" });

    await pool.query(
      `UPDATE societies s
       INNER JOIN admins a ON a.society_id = s.society_id
       SET s.society_name = ?, s.address = ?, s.contact_email = ?, s.contact_phone = ?,
           s.total_blocks = ?, s.total_flats = ?
       WHERE a.id = ?`,
       [name.trim(), address?.trim() || "", email.trim().toLowerCase(), phone?.trim() || "", blocks, flats, req.user.id]
    );
    res.status(200).json({ message: "Society settings saved" });
  } catch (error) {
    console.error("Update Admin Society Settings Error:", error);
    res.status(500).json({ message: "Unable to save society settings" });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { name, email, phone } = req.body;
    if (!name?.trim() || !email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Enter a valid name and email address" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [duplicates] = await pool.query(
      "SELECT id FROM admins WHERE email = ? AND id <> ? LIMIT 1",
      [normalizedEmail, req.user.id]
    );
    if (duplicates.length) {
      return res.status(409).json({ message: "This email is already used by another admin" });
    }
    await pool.query(
      "UPDATE admins SET name = ?, email = ?, phone = ? WHERE id = ?",
      [name.trim(), normalizedEmail, phone?.trim() || null, req.user.id]
    );
    res.status(200).json({ message: "Admin profile updated" });
  } catch (error) {
    console.error("Update Admin Profile Error:", error);
    res.status(500).json({ message: "Unable to update admin profile" });
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ message: "Current password and a new password of at least 6 characters are required" });
    }
    const [admins] = await pool.query("SELECT password FROM admins WHERE id = ? LIMIT 1", [req.user.id]);
    if (!admins.length) return res.status(404).json({ message: "Admin account not found" });
    const passwordMatches = await bcrypt.compare(currentPassword, admins[0].password);
    if (!passwordMatches) return res.status(400).json({ message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE admins SET password = ? WHERE id = ?", [hashedPassword, req.user.id]);
    res.status(200).json({ message: "Admin password updated" });
  } catch (error) {
    console.error("Change Admin Password Error:", error);
    res.status(500).json({ message: "Unable to update admin password" });
  }
};

const saveAdminPreference = async (req, res, column, value) => {
  if (!requireAdmin(req, res)) return;
  await pool.query(
    `INSERT INTO admin_preferences (admin_id, ${column})
     VALUES (?, CAST(? AS JSON))
     ON DUPLICATE KEY UPDATE ${column} = VALUES(${column})`,
    [req.user.id, JSON.stringify(value)]
  );
  res.status(200).json({ message: "Preferences saved" });
};

const updateAdminNotifications = async (req, res) => {
  try {
    const { complaints, payments, bookings, notices, security, events } = req.body;
    const preferences = { complaints, payments, bookings, notices, security, events };
    if (Object.values(preferences).some((value) => typeof value !== "boolean")) {
      return res.status(400).json({ message: "All notification preferences must be true or false" });
    }
    await saveAdminPreference(req, res, "notification_preferences", preferences);
  } catch (error) {
    console.error("Update Admin Notification Preferences Error:", error);
    res.status(500).json({ message: "Unable to save notification preferences" });
  }
};

const updateAdminSecurityPreferences = async (req, res) => {
  try {
    const { twoFactor, sessionTimeout, loginAlerts } = req.body;
    if (typeof twoFactor !== "boolean" || typeof loginAlerts !== "boolean" ||
        !["15", "30", "60", "120"].includes(String(sessionTimeout))) {
      return res.status(400).json({ message: "Invalid security preferences" });
    }
    await saveAdminPreference(req, res, "security_preferences", {
      twoFactor,
      sessionTimeout: String(sessionTimeout),
      loginAlerts,
    });
  } catch (error) {
    console.error("Update Admin Security Preferences Error:", error);
    res.status(500).json({ message: "Unable to save security preferences" });
  }
};

const getAdminPaymentResidents = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [residents] = await pool.query(
      `SELECT id, first_name, last_name, block_wing, flat_number
       FROM residents WHERE user_type = 'Resident'
       ORDER BY block_wing, CAST(flat_number AS UNSIGNED), flat_number`
    );
    res.status(200).json({ residents });
  } catch (error) {
    console.error("Get Admin Payment Residents Error:", error);
    res.status(500).json({ message: "Unable to fetch residents for payments" });
  }
};

const createAdminPayment = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { resident_id, amount, billing_month, due_date } = req.body;
    const residentId = Number(resident_id);
    const paymentAmount = Number(amount);
    if (!Number.isInteger(residentId) || residentId <= 0 || !Number.isFinite(paymentAmount) ||
        !isValidMoney(amount) || !billing_month?.trim() || !isValidDateOnly(due_date)) {
      return res.status(400).json({ message: "Resident, positive amount, billing month and due date are required" });
    }
    const [residents] = await pool.query(
      "SELECT id FROM residents WHERE id = ? AND user_type = 'Resident'",
      [residentId]
    );
    if (!residents.length) return res.status(404).json({ message: "Resident not found" });

    const [result] = await pool.query(
      `INSERT INTO payments (resident_id, amount, billing_month, due_date, status)
       VALUES (?, ?, ?, ?, 'Pending')`,
      [residentId, paymentAmount.toFixed(2), billing_month.trim(), due_date]
    );
    res.status(201).json({ message: "Payment due added", paymentId: result.insertId });
  } catch (error) {
    console.error("Create Admin Payment Error:", error);
    res.status(500).json({ message: "Unable to create payment record" });
  }
};

const updateAdminPayment = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { amount, billing_month, due_date } = req.body;
    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || !isValidMoney(amount) || !billing_month?.trim() || !isValidDateOnly(due_date)) {
      return res.status(400).json({ message: "Positive amount, billing month and due date are required" });
    }
    const [payments] = await pool.query("SELECT status FROM payments WHERE id = ? LIMIT 1", [req.params.id]);
    if (!payments.length) return res.status(404).json({ message: "Payment record not found" });
    if (payments[0].status !== "Pending") {
      return res.status(409).json({ message: "Only pending payments can be edited" });
    }
    await pool.query(
      `UPDATE payments
       SET amount = ?, billing_month = ?, due_date = ?
       WHERE id = ? AND status = 'Pending'`,
      [paymentAmount.toFixed(2), billing_month.trim(), due_date, req.params.id]
    );
    res.status(200).json({ message: "Pending payment updated" });
  } catch (error) {
    console.error("Update Admin Payment Error:", error);
    res.status(500).json({ message: "Unable to update payment record" });
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
    const [addons] = await pool.query(
      `SELECT addon_id, addon_name, description, charge_type, price, status
       FROM facility_addons ORDER BY addon_name ASC`
    );
    res.status(200).json({ amenities, addons });
  } catch (error) {
    console.error("Get Admin Amenities Error:", error);
    res.status(500).json({ message: "Unable to fetch amenities" });
  }
};

const validateFacility = (body) => {
  const baseCharge = Number(body.base_charge);
  if (!body.facility_name?.trim() || !Number.isFinite(baseCharge) || !isValidMoney(body.base_charge, true) ||
      !["Available", "Unavailable", "Maintenance"].includes(body.availability_status) ||
      !["Per Booking", "Free"].includes(body.charge_period)) return null;
  return {
    name: body.facility_name.trim(),
    description: body.description?.trim() || null,
    location: body.location?.trim() || null,
    status: body.availability_status,
    charge: body.charge_period === "Free" ? 0 : baseCharge,
    period: body.charge_period,
  };
};

const createAdminAmenity = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const facility = validateFacility(req.body);
    if (!facility) return res.status(400).json({ message: "Enter valid facility details" });
    const [result] = await pool.query(
      `INSERT INTO facilities (facility_name, description, location, availability_status, base_charge, charge_period)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [facility.name, facility.description, facility.location, facility.status, facility.charge, facility.period]
    );
    res.status(201).json({ message: "Amenity created", facilityId: result.insertId });
  } catch (error) {
    console.error("Create Admin Amenity Error:", error);
    res.status(500).json({ message: "Unable to create amenity" });
  }
};

const updateAdminAmenity = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const facility = validateFacility(req.body);
    if (!facility) return res.status(400).json({ message: "Enter valid facility details" });
    const [amenities] = await pool.query("SELECT facility_id FROM facilities WHERE facility_id = ? LIMIT 1", [req.params.id]);
    if (!amenities.length) return res.status(404).json({ message: "Amenity not found" });
    await pool.query(
      `UPDATE facilities
       SET facility_name = ?, description = ?, location = ?, availability_status = ?,
           base_charge = ?, charge_period = ?
       WHERE facility_id = ?`,
      [facility.name, facility.description, facility.location, facility.status, facility.charge, facility.period, req.params.id]
    );
    res.status(200).json({ message: "Amenity updated" });
  } catch (error) {
    console.error("Update Admin Amenity Error:", error);
    res.status(500).json({ message: "Unable to update amenity" });
  }
};

const validateAddon = (body) => {
  const price = Number(body.price);
  if (!body.addon_name?.trim() || !Number.isFinite(price) || !isValidMoney(body.price, true) ||
      !["Fixed", "Per Item", "Per Person"].includes(body.charge_type) ||
      !["Available", "Unavailable"].includes(body.status)) return null;
  return {
    name: body.addon_name.trim(),
    description: body.description?.trim() || null,
    type: body.charge_type,
    price,
    status: body.status,
  };
};

const createAdminAmenityAddon = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const addon = validateAddon(req.body);
    if (!addon) return res.status(400).json({ message: "Enter valid add-on details" });
    const [result] = await pool.query(
      `INSERT INTO facility_addons (addon_name, description, charge_type, price, status)
       VALUES (?, ?, ?, ?, ?)`,
      [addon.name, addon.description, addon.type, addon.price, addon.status]
    );
    res.status(201).json({ message: "Amenity add-on created", addonId: result.insertId });
  } catch (error) {
    console.error("Create Admin Amenity Add-on Error:", error);
    res.status(500).json({ message: "Unable to create amenity add-on" });
  }
};

const updateAdminAmenityAddon = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const addon = validateAddon(req.body);
    if (!addon) return res.status(400).json({ message: "Enter valid add-on details" });
    const [addons] = await pool.query("SELECT addon_id FROM facility_addons WHERE addon_id = ? LIMIT 1", [req.params.id]);
    if (!addons.length) return res.status(404).json({ message: "Amenity add-on not found" });
    await pool.query(
      `UPDATE facility_addons
       SET addon_name = ?, description = ?, charge_type = ?, price = ?, status = ?
       WHERE addon_id = ?`,
      [addon.name, addon.description, addon.type, addon.price, addon.status, req.params.id]
    );
    res.status(200).json({ message: "Amenity add-on updated" });
  } catch (error) {
    console.error("Update Admin Amenity Add-on Error:", error);
    res.status(500).json({ message: "Unable to update amenity add-on" });
  }
};

const getAdminVisitorResidents = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [residents] = await pool.query(
      `SELECT id, first_name, last_name, block_wing, flat_number
       FROM residents WHERE user_type = 'Resident'
       ORDER BY block_wing, CAST(flat_number AS UNSIGNED), flat_number`
    );
    res.status(200).json({ residents });
  } catch (error) {
    console.error("Get Admin Visitor Residents Error:", error);
    res.status(500).json({ message: "Unable to fetch residents for visitors" });
  }
};

const validateVisitor = (body) => {
  const residentId = Number(body.resident_id);
  if (!Number.isInteger(residentId) || residentId <= 0 || !body.visitor_name?.trim() ||
      !body.contact_number?.trim() || !body.purpose?.trim() || !isValidDateOnly(body.visit_date) ||
      !isValidTime(body.expected_time)) return null;
  return {
    residentId,
    visitorName: body.visitor_name.trim(),
    contactNumber: body.contact_number.trim(),
    purpose: body.purpose.trim(),
    visitDate: body.visit_date,
    expectedTime: body.expected_time,
  };
};

const createAdminVisitor = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const visitor = validateVisitor(req.body);
    if (!visitor) return res.status(400).json({ message: "Enter all visitor details" });
    const [residents] = await pool.query(
      "SELECT id FROM residents WHERE id = ? AND user_type = 'Resident'",
      [visitor.residentId]
    );
    if (!residents.length) return res.status(404).json({ message: "Resident not found" });
    const [result] = await pool.query(
      `INSERT INTO visitors (resident_id, visitor_name, contact_number, purpose, visit_date, expected_time, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [visitor.residentId, visitor.visitorName, visitor.contactNumber, visitor.purpose, visitor.visitDate, visitor.expectedTime]
    );
    res.status(201).json({ message: "Visitor record created", visitorId: result.insertId });
  } catch (error) {
    console.error("Create Admin Visitor Error:", error);
    res.status(500).json({ message: "Unable to create visitor record" });
  }
};

const updateAdminVisitor = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const visitor = validateVisitor(req.body);
    if (!visitor) return res.status(400).json({ message: "Enter all visitor details" });
    const [residents] = await pool.query(
      "SELECT id FROM residents WHERE id = ? AND user_type = 'Resident'",
      [visitor.residentId]
    );
    if (!residents.length) return res.status(404).json({ message: "Resident not found" });
    const [existingVisitors] = await pool.query(
      `SELECT visitor_id FROM visitors
       WHERE visitor_id = ? AND status = 'Pending' AND entry_time IS NULL`,
      [req.params.id]
    );
    if (!existingVisitors.length) {
      const [rows] = await pool.query("SELECT visitor_id FROM visitors WHERE visitor_id = ?", [req.params.id]);
      if (!rows.length) return res.status(404).json({ message: "Visitor record not found" });
      return res.status(409).json({ message: "Only pending visitors without a gate entry can be edited" });
    }
    await pool.query(
      `UPDATE visitors
       SET resident_id = ?, visitor_name = ?, contact_number = ?, purpose = ?, visit_date = ?, expected_time = ?
       WHERE visitor_id = ? AND status = 'Pending' AND entry_time IS NULL`,
      [visitor.residentId, visitor.visitorName, visitor.contactNumber, visitor.purpose, visitor.visitDate, visitor.expectedTime, req.params.id]
    );
    res.status(200).json({ message: "Visitor record updated" });
  } catch (error) {
    console.error("Update Admin Visitor Error:", error);
    res.status(500).json({ message: "Unable to update visitor record" });
  }
};

const updateAdminVisitorStatus = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Visitor status must be Approved or Rejected" });
    }
    const [result] = await pool.query(
      "UPDATE visitors SET status = ? WHERE visitor_id = ? AND status = 'Pending'",
      [status, req.params.id]
    );
    if (!result.affectedRows) {
      const [rows] = await pool.query("SELECT visitor_id FROM visitors WHERE visitor_id = ?", [req.params.id]);
      if (!rows.length) return res.status(404).json({ message: "Visitor record not found" });
      return res.status(409).json({ message: "Only pending visitors can be approved or rejected" });
    }
    res.status(200).json({ message: `Visitor ${status.toLowerCase()}` });
  } catch (error) {
    console.error("Update Admin Visitor Status Error:", error);
    res.status(500).json({ message: "Unable to update visitor status" });
  }
};

const updateAdminVisitorGate = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { action } = req.body;
    let result;
    if (action === "entry") {
      [result] = await pool.query(
        `UPDATE visitors SET entry_time = NOW()
         WHERE visitor_id = ? AND status = 'Approved' AND entry_time IS NULL AND exit_time IS NULL`,
        [req.params.id]
      );
    } else if (action === "exit") {
      [result] = await pool.query(
        `UPDATE visitors SET exit_time = NOW(), status = 'Completed'
         WHERE visitor_id = ? AND status = 'Approved' AND entry_time IS NOT NULL AND exit_time IS NULL`,
        [req.params.id]
      );
    } else {
      return res.status(400).json({ message: "Gate action must be entry or exit" });
    }
    if (!result.affectedRows) {
      const [rows] = await pool.query("SELECT visitor_id FROM visitors WHERE visitor_id = ?", [req.params.id]);
      if (!rows.length) return res.status(404).json({ message: "Visitor record not found" });
      return res.status(409).json({ message: "Visitor status does not allow this gate action" });
    }
    res.status(200).json({ message: `Visitor ${action} recorded` });
  } catch (error) {
    console.error("Update Admin Visitor Gate Error:", error);
    res.status(500).json({ message: "Unable to update visitor gate record" });
  }
};

module.exports = {
  loginAdmin,
  getAdminDashboard,
  getAdminResidents,
  getAdminStaff,
  createAdminStaff,
  getAdminSecurity,
  getAdminPayments,
  getAdminVisitors,
  getAdminAmenities,
  getAdminNotifications,
  updateResidentOwnership,
  getAdminSettings,
  updateAdminSocietySettings,
  updateAdminProfile,
  changeAdminPassword,
  updateAdminNotifications,
  updateAdminSecurityPreferences,
  getAdminPaymentResidents,
  createAdminPayment,
  updateAdminPayment,
  getAdminAmenities,
  createAdminAmenity,
  updateAdminAmenity,
  createAdminAmenityAddon,
  updateAdminAmenityAddon,
  getAdminVisitorResidents,
  createAdminVisitor,
  updateAdminVisitor,
  updateAdminVisitorStatus,
  updateAdminVisitorGate
};
