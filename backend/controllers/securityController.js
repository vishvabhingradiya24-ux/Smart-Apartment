const { pool } = require("../config/db");
const { getPhoneError } = require("../utils/validation");

// Visitor handling for Security staff.
//
// Flow: Security registers a visitor for a flat -> the resident approves or
// rejects it (existing resident page) -> Security records entry, then exit.
// "Inside now" means an entry time exists and no exit time yet.

const VISITOR_TYPES = ["Guest", "Delivery", "Service", "Cab", "Other"];

const VISITOR_COLUMNS = `
  v.visitor_id,
  v.visitor_name,
  v.contact_number,
  v.visitor_type,
  v.purpose,
  v.visit_date,
  v.expected_time,
  v.status,
  v.entry_time,
  v.exit_time,
  r.block_wing,
  r.flat_number,
  r.first_name AS resident_first_name,
  r.last_name AS resident_last_name`;

const SCOPES = {
  today: "DATE(v.visit_date) = CURDATE()",
  expected:
    "DATE(v.visit_date) >= CURDATE() AND v.entry_time IS NULL AND v.status IN ('Pending', 'Approved')",
  inside: "v.entry_time IS NOT NULL AND v.exit_time IS NULL",
  history: "1 = 1"
};

const getVisitors = async (req, res) => {
  try {
    const scope = SCOPES[req.query.scope] ? req.query.scope : "today";
    const search = String(req.query.search || "").trim().slice(0, 60);

    const params = [];
    let searchSql = "";

    if (search) {
      searchSql = `AND (v.visitor_name LIKE ? OR v.contact_number LIKE ?
        OR CONCAT_WS('-', r.block_wing, r.flat_number) LIKE ?)`;
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const [visitors] = await pool.query(
      `SELECT ${VISITOR_COLUMNS}
       FROM visitors v
       LEFT JOIN residents r ON r.id = v.resident_id
       WHERE ${SCOPES[scope]} ${searchSql}
       ORDER BY v.visit_date DESC, v.expected_time DESC, v.visitor_id DESC
       LIMIT 200`,
      params
    );

    const [[counts]] = await pool.query(
      `SELECT
         COALESCE(SUM(DATE(visit_date) = CURDATE()), 0) AS today,
         COALESCE(SUM(DATE(visit_date) >= CURDATE()
           AND entry_time IS NULL AND status IN ('Pending', 'Approved')), 0) AS expected,
         COALESCE(SUM(entry_time IS NOT NULL AND exit_time IS NULL), 0) AS inside
       FROM visitors`
    );

    res.status(200).json({
      scope,
      visitors,
      counts: {
        today: Number(counts.today) || 0,
        expected: Number(counts.expected) || 0,
        inside: Number(counts.inside) || 0
      }
    });
  } catch (error) {
    console.error("Security get visitors error:", error);
    res.status(500).json({ message: "Unable to load visitors" });
  }
};

// Flats a visitor can be registered for. Only the flat and the resident's
// name are returned (no phone number or email).
const getFlats = async (req, res) => {
  try {
    const [flats] = await pool.query(
      `SELECT id, first_name, last_name, block_wing, flat_number
       FROM residents
       WHERE user_type = 'Resident' AND is_active = 1
         AND block_wing IS NOT NULL AND flat_number IS NOT NULL
       ORDER BY block_wing ASC, flat_number ASC`
    );

    res.status(200).json({ flats });
  } catch (error) {
    console.error("Security get flats error:", error);
    res.status(500).json({ message: "Unable to load flats" });
  }
};

const registerVisitor = async (req, res) => {
  try {
    const visitorName = String(req.body.visitor_name || "").trim();
    const contact = String(req.body.contact_number || "").trim();
    const purpose = String(req.body.purpose || "").trim();
    const visitorType = String(req.body.visitor_type || "Guest").trim();
    const residentId = Number(req.body.resident_id);

    if (!visitorName || visitorName.length > 100) {
      return res.status(400).json({ message: "Enter the visitor name (up to 100 characters)" });
    }

    const phoneError = getPhoneError(contact);

    if (phoneError) {
      return res.status(400).json({ message: phoneError });
    }

    if (!purpose || purpose.length > 150) {
      return res.status(400).json({ message: "Enter the purpose of the visit (up to 150 characters)" });
    }

    if (!VISITOR_TYPES.includes(visitorType)) {
      return res.status(400).json({ message: "Select a valid visitor type" });
    }

    if (!Number.isInteger(residentId) || residentId < 1) {
      return res.status(400).json({ message: "Select the flat to visit" });
    }

    const [residents] = await pool.query(
      "SELECT id FROM residents WHERE id = ? AND user_type = 'Resident' AND is_active = 1",
      [residentId]
    );

    if (residents.length === 0) {
      return res.status(404).json({ message: "Flat not found" });
    }

    const [result] = await pool.query(
      `INSERT INTO visitors
        (resident_id, visitor_name, contact_number, purpose, visit_date,
         expected_time, status, visitor_type, registered_by_staff_id)
       VALUES (?, ?, ?, ?, CURDATE(), CURTIME(), 'Pending', ?, ?)`,
      [residentId, visitorName, contact, purpose, visitorType, req.staff.id]
    );

    res.status(201).json({
      message: "Visitor registered. The resident can now approve or reject the visit.",
      visitor_id: result.insertId
    });
  } catch (error) {
    console.error("Security register visitor error:", error);
    res.status(500).json({ message: "Unable to register visitor" });
  }
};

const findVisitor = async (id) => {
  const [rows] = await pool.query(
    "SELECT visitor_id, status, entry_time, exit_time FROM visitors WHERE visitor_id = ?",
    [id]
  );

  return rows[0] || null;
};

const recordEntry = async (req, res) => {
  try {
    const visitor = await findVisitor(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    if (visitor.entry_time) {
      return res.status(400).json({ message: "Entry was already recorded for this visitor" });
    }

    if (visitor.status === "Rejected") {
      return res.status(400).json({ message: "The resident rejected this visitor. Do not allow entry." });
    }

    if (visitor.status !== "Approved") {
      return res.status(400).json({ message: "Waiting for the resident to approve this visitor" });
    }

    await pool.query(
      "UPDATE visitors SET entry_time = NOW() WHERE visitor_id = ? AND entry_time IS NULL",
      [visitor.visitor_id]
    );

    res.status(200).json({ message: "Entry recorded" });
  } catch (error) {
    console.error("Security record entry error:", error);
    res.status(500).json({ message: "Unable to record entry" });
  }
};

const recordExit = async (req, res) => {
  try {
    const visitor = await findVisitor(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    if (!visitor.entry_time) {
      return res.status(400).json({ message: "Record the entry before the exit" });
    }

    if (visitor.exit_time) {
      return res.status(400).json({ message: "Exit was already recorded for this visitor" });
    }

    await pool.query(
      "UPDATE visitors SET exit_time = NOW(), status = 'Completed' WHERE visitor_id = ? AND exit_time IS NULL",
      [visitor.visitor_id]
    );

    res.status(200).json({ message: "Exit recorded" });
  } catch (error) {
    console.error("Security record exit error:", error);
    res.status(500).json({ message: "Unable to record exit" });
  }
};

module.exports = {
  VISITOR_TYPES,
  getVisitors,
  getFlats,
  registerVisitor,
  recordEntry,
  recordExit
};
