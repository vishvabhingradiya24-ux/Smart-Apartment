const { pool } = require("../config/db");

// Notifications are a convenience, so a failure here must never break the
// action that triggered them (assigning work, completing a task, ...).

const notifyStaff = async (staffId, { type, title, message = null, link = null }) => {
  if (!staffId) return;

  try {
    await pool.query(
      `INSERT INTO staff_notifications (staff_id, type, title, message, link)
       VALUES (?, ?, ?, ?, ?)`,
      [staffId, type, title, message, link]
    );
  } catch (error) {
    console.error("Staff notification error:", error.message);
  }
};

// Tells every Facility Supervisor (for example when work needs verification).
const notifySupervisors = async (payload, exceptStaffId = null) => {
  try {
    const [supervisors] = await pool.query(
      "SELECT id FROM staff WHERE department = 'Facility Supervisor'"
    );

    await Promise.all(
      supervisors
        .filter((supervisor) => supervisor.id !== exceptStaffId)
        .map((supervisor) => notifyStaff(supervisor.id, payload))
    );
  } catch (error) {
    console.error("Supervisor notification error:", error.message);
  }
};

module.exports = { notifyStaff, notifySupervisors };
