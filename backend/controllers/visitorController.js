const { pool } = require("../config/db");

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
        purpose,
        visit_date,
        expected_time,
        status,
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
    const residentId = req.user.id;

    const {
      visitor_name,
      contact_number,
      purpose,
      visit_date,
      expected_time,
    } = req.body;

    if (
      !visitor_name ||
      !contact_number ||
      !purpose ||
      !visit_date ||
      !expected_time
    ) {
      return res.status(400).json({
        message: "All visitor details are required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO visitors
      (
        resident_id,
        visitor_name,
        contact_number,
        purpose,
        visit_date,
        expected_time,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        residentId,
        visitor_name,
        contact_number,
        purpose,
        visit_date,
        expected_time,
      ]
    );

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
      AND resident_id = ?`,
      [result.insertId, residentId]
    );

    res.status(201).json({
      message: "Visitor request submitted successfully",
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


module.exports = {
  getMyVisitors,
  createVisitor,
  getVisitorById,
};
