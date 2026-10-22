const { pool } = require("../config/db");
const { getPhoneError } = require("../utils/validation");
const { notifySecurity } = require("../utils/staffNotifications");

const formatPersonName = (value) =>
  value.trim().toLocaleLowerCase("en-IN").replace(
    /(^|[\s'-])(\p{L})/gu,
    (_, separator, initial) => `${separator}${initial.toLocaleUpperCase("en-IN")}`
  );

// GET ALL VISITORS OF LOGGED-IN RESIDENT
const getMyVisitors = async (req, res) => {
  try {
    const residentId = req.user.id;

    const [visitors] = await pool.query(
      `SELECT
        visitor_id,
        resident_id,
        visitor_name,
        contact_number,
        visitor_type,
        purpose,
        visit_date,
        expected_time,
        status,
        registered_by_staff_id,
        entry_time,
        exit_time,
        created_at
      FROM visitors
      WHERE resident_id = ?
      ORDER BY visit_date DESC, expected_time DESC`,
      [residentId]
    );

    res.status(200).json({
      visitors,
    });
  } catch (error) {
    console.error("Get My Visitors Error:", error);

    res.status(500).json({
      message: "Unable to fetch visitors",
    });
  }
};


// CREATE VISITOR
const createVisitor = async (req, res) => {
  try {
    if (req.user.user_type !== "Resident") {
      return res.status(403).json({ message: "Only residents can register their visitors" });
    }

    const residentId = req.user.id;

    const {
      visitor_name,
      contact_number,
      visitor_type,
      purpose,
      visit_date,
      expected_time,
    } = req.body;

    const name = String(visitor_name || "").trim();
    const contact = String(contact_number || "").trim();
    const visitorType = String(visitor_type || "Guest").trim();
    const visitPurpose = String(purpose || "").trim();
    const visitDate = String(visit_date || "");
    const expectedTime = String(expected_time || "");

    if (!name || name.length > 100 || !visitPurpose || visitPurpose.length > 255) {
      return res.status(400).json({
        message: "Enter a visitor name (up to 100 characters) and purpose (up to 255 characters)",
      });
    }

    const phoneError = getPhoneError(contact);
    if (phoneError) {
      return res.status(400).json({ message: phoneError });
    }

    if (!["Guest", "Delivery", "Service", "Cab", "Other"].includes(visitorType)) {
      return res.status(400).json({ message: "Select a valid visitor type" });
    }

    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(visitDate);
    const timeMatch = /^([01]\d|2[0-3]):[0-5]\d$/.exec(expectedTime);
    if (!dateMatch || !timeMatch) {
      return res.status(400).json({ message: "Enter a valid visit date and time" });
    }
    const parsedDate = new Date(Date.UTC(
      Number(dateMatch[1]),
      Number(dateMatch[2]) - 1,
      Number(dateMatch[3])
    ));
    if (
      parsedDate.getUTCFullYear() !== Number(dateMatch[1]) ||
      parsedDate.getUTCMonth() !== Number(dateMatch[2]) - 1 ||
      parsedDate.getUTCDate() !== Number(dateMatch[3])
    ) {
      return res.status(400).json({ message: "Enter a valid visit date" });
    }
    const [[dateCheck]] = await pool.query(
      "SELECT ? < CURDATE() AS is_past",
      [visitDate]
    );
    if (dateCheck.is_past) {
      return res.status(400).json({ message: "Visit date cannot be in the past" });
    }

    const [result] = await pool.query(
      `INSERT INTO visitors
      (
        resident_id,
        visitor_name,
        contact_number,
        visitor_type,
        purpose,
        visit_date,
        expected_time,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Approved')`,
      [
        residentId,
        name,
        contact,
        visitorType,
        visitPurpose,
        visitDate,
        expectedTime,
      ]
    );

    const [[resident]] = await pool.query(
      `SELECT first_name, last_name, block_wing, flat_number
       FROM residents
       WHERE id = ?`,
      [residentId]
    );
    const residentName = [resident?.first_name, resident?.last_name].filter(Boolean).join(" ");
    const flat = [resident?.block_wing, resident?.flat_number].filter(Boolean).join("-");
    const displayVisitorName = formatPersonName(name);
    const displayResidentName = residentName ? formatPersonName(residentName) : "";
    const visitorDetails = [
      `${displayVisitorName} (${visitorType})`,
      `Purpose: ${visitPurpose.slice(0, 120)}`,
      `Contact: ${contact}`,
      displayResidentName && `Resident: ${displayResidentName}`,
      flat && `Flat: ${flat}`,
      `Visit: ${visitDate} at ${expectedTime}`,
    ].filter(Boolean).join(" | ");
    await notifySecurity({
      type: "visitor",
      title: "Resident pre-registered a visitor",
      message: visitorDetails,
      link: `/staff/visitors?scope=expected&visitorId=${result.insertId}`,
    });

    const [visitor] = await pool.query(
      `SELECT
        visitor_id,
        resident_id,
        visitor_name,
        contact_number,
        visitor_type,
        purpose,
        visit_date,
        expected_time,
        status,
        registered_by_staff_id,
        entry_time,
        exit_time,
        created_at
      FROM visitors
      WHERE visitor_id = ?
      AND resident_id = ?`,
      [result.insertId, residentId]
    );

    res.status(201).json({
      message: "Visitor pre-registered successfully",
      visitor: visitor[0],
    });
  } catch (error) {
    console.error("Create Visitor Error:", error);

    res.status(500).json({
      message: "Unable to create visitor request",
    });
  }
};


// GET SINGLE VISITOR
const getVisitorById = async (req, res) => {
  try {
    const residentId = req.user.id;
    const visitorId = req.params.id;

    const [visitor] = await pool.query(
      `SELECT
        visitor_id,
        resident_id,
        visitor_name,
        contact_number,
        purpose,
        visit_date,
        expected_time,
        status,
        entry_time,
        exit_time,
        created_at
      FROM visitors
      WHERE visitor_id = ?
      AND resident_id = ?
      LIMIT 1`,
      [visitorId, residentId]
    );

    if (visitor.length === 0) {
      return res.status(404).json({
        message: "Visitor not found",
      });
    }

    res.status(200).json({
      visitor: visitor[0],
    });
  } catch (error) {
    console.error("Get Visitor Error:", error);

    res.status(500).json({
      message: "Unable to fetch visitor",
    });
  }
};

const updateMyVisitorStatus = async (req, res) => {
  try {
    if (req.user.user_type !== "Resident") {
      return res.status(403).json({ message: "Only residents can decide on visitor requests" });
    }

    const residentId = req.user.id;
    const visitorId = req.params.id;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be Approved or Rejected" });
    }

    const [result] = await pool.query(
      `UPDATE visitors
       SET status = ?
       WHERE visitor_id = ? AND resident_id = ? AND status = 'Pending'`,
      [status, visitorId, residentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pending visitor request not found" });
    }

    const [visitors] = await pool.query(
      `SELECT visitor_id, resident_id, visitor_name, contact_number, purpose,
              visit_date, expected_time, status, entry_time, exit_time, created_at
       FROM visitors WHERE visitor_id = ? AND resident_id = ? LIMIT 1`,
      [visitorId, residentId]
    );

    res.status(200).json({ message: `Visitor request ${status.toLowerCase()}`, visitor: visitors[0] });
  } catch (error) {
    console.error("Update Visitor Status Error:", error);
    res.status(500).json({ message: "Unable to update visitor status" });
  }
};


module.exports = {
  getMyVisitors,
  createVisitor,
  getVisitorById,
  updateMyVisitorStatus,
};
