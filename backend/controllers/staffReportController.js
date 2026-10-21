const { pool } = require("../config/db");
const { notifySupervisors } = require("../utils/staffNotifications");

// Incident reports (Security) and issue reports (technical staff).
// Both go to the Facility Supervisor, who can follow them up.

const SEVERITIES = ["Low", "Medium", "High", "Critical"];

const cleanText = (value, max) => String(value || "").trim().slice(0, max);

const parseOccurredAt = (value) => {
  if (!value) return new Date();

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const createReport = async (req, res) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const [staffRows] = await pool.query(
      "SELECT id, first_name, last_name, department FROM staff WHERE id = ?",
      [req.user.id]
    );

    if (staffRows.length === 0) {
      return res.status(401).json({ message: "Staff account not found" });
    }

    const staff = staffRows[0];

    const title = cleanText(req.body.title, 150);
    const description = cleanText(req.body.description, 2000);
    const location = cleanText(req.body.location, 150) || null;
    const severity = SEVERITIES.includes(req.body.severity) ? req.body.severity : "Medium";
    const occurredAt = parseOccurredAt(req.body.occurred_at);

    if (!title) {
      return res.status(400).json({ message: "Enter a short title" });
    }

    if (!description) {
      return res.status(400).json({ message: "Describe what happened" });
    }

    if (!occurredAt) {
      return res.status(400).json({ message: "Enter a valid date and time" });
    }

    if (occurredAt.getTime() > Date.now() + 5 * 60 * 1000) {
      return res.status(400).json({ message: "The date and time cannot be in the future" });
    }

    // Security reports incidents; every other type reports issues.
    const reportType = staff.department === "Security" ? "Incident" : "Issue";

    const [result] = await pool.query(
      `INSERT INTO incident_reports
        (reporter_staff_id, report_type, title, description, location,
         occurred_at, severity, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Open')`,
      [staff.id, reportType, title, description, location, occurredAt, severity]
    );

    await notifySupervisors(
      {
        type: "incident",
        title: `New ${reportType.toLowerCase()} report (${severity})`,
        message: `${staff.first_name} ${staff.last_name}: ${title}`,
        link: "/staff/supervisor/incidents"
      },
      staff.id
    );

    res.status(201).json({
      message: "Report sent to the supervisor and admin",
      report_id: result.insertId
    });
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({ message: "Unable to send the report" });
  }
};

const getMyReports = async (req, res) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const [reports] = await pool.query(
      `SELECT report_id, report_type, title, description, location,
              occurred_at, severity, status, created_at
       FROM incident_reports
       WHERE reporter_staff_id = ?
       ORDER BY created_at DESC, report_id DESC
       LIMIT 100`,
      [req.user.id]
    );

    res.status(200).json({ reports });
  } catch (error) {
    console.error("Get my reports error:", error);
    res.status(500).json({ message: "Unable to load your reports" });
  }
};

module.exports = { SEVERITIES, createReport, getMyReports };
