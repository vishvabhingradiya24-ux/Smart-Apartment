const { pool } = require("../config/db");
const { notifyStaff } = require("../utils/staffNotifications");

// Admin view of the incident / issue reports sent by staff. The route is
// already protected by the admin middleware in adminRoutes.

const getIncidentReports = async (req, res) => {
  try {
    const [reports] = await pool.query(
      `SELECT i.report_id, i.report_type, i.title, i.description, i.location,
              i.occurred_at, i.severity, i.status, i.created_at,
              s.first_name AS reporter_first_name, s.last_name AS reporter_last_name,
              s.department AS reporter_department
       FROM incident_reports i
       LEFT JOIN staff s ON s.id = i.reporter_staff_id
       ORDER BY (i.status = 'Closed') ASC, i.created_at DESC
       LIMIT 300`
    );

    res.status(200).json({ reports });
  } catch (error) {
    console.error("Admin incident reports error:", error);
    res.status(500).json({ message: "Unable to load incident reports" });
  }
};

const updateIncidentReport = async (req, res) => {
  try {
    const status = req.body.status;

    if (!["Acknowledged", "Closed"].includes(status)) {
      return res.status(400).json({ message: "Choose Acknowledged or Closed" });
    }

    const [reports] = await pool.query(
      "SELECT report_id, title, reporter_staff_id FROM incident_reports WHERE report_id = ?",
      [req.params.id]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    await pool.query("UPDATE incident_reports SET status = ? WHERE report_id = ?", [status, reports[0].report_id]);

    await notifyStaff(reports[0].reporter_staff_id, {
      type: "incident",
      title: `Your report was ${status.toLowerCase()}`,
      message: reports[0].title,
      link: "/staff/report-issue"
    });

    res.status(200).json({ message: `Report marked as ${status.toLowerCase()}` });
  } catch (error) {
    console.error("Admin update incident error:", error);
    res.status(500).json({ message: "Unable to update the report" });
  }
};

module.exports = { getIncidentReports, updateIncidentReport };
