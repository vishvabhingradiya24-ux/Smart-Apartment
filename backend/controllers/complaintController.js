const { pool } = require("../config/db");

// CREATE COMPLAINT
const createComplaint = async (req, res) => {
  try {
    const {
      complaint_title,
      complaint_description,
      category
    } = req.body;

    const resident_id = req.user.id;

    if (
      !complaint_title ||
      !complaint_description ||
      !category
    ) {
      return res.status(400).json({
        message: "Please fill all complaint fields"
      });
    }

    const [residents] = await pool.query(
      `SELECT id, first_name, last_name, flat_number
       FROM residents
       WHERE id = ?`,
      [resident_id]
    );

    if (residents.length === 0) {
      return res.status(404).json({
        message: "Resident not found"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO complaints
      (
        resident_id,
        complaint_title,
        complaint_description,
        category,
        status,
        complaint_date
      )
      VALUES (?, ?, ?, ?, 'Pending', NOW())`,
      [
        resident_id,
        complaint_title,
        complaint_description,
        category
      ]
    );

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaintId: result.insertId
    });

  } catch (error) {
    console.error("Create Complaint Error:", error);

    res.status(500).json({
      message: "Unable to submit complaint"
    });
  }
};


// GET MY COMPLAINTS
const getMyComplaints = async (req, res) => {
  try {
    const resident_id = req.user.id;

    const [complaints] = await pool.query(
      `SELECT
        c.complaint_id,
        c.resident_id,
        r.first_name,
        r.last_name,
        r.flat_number,
        c.complaint_title,
        c.complaint_description,
        c.category,
        c.status,
        c.user_id,
        c.complaint_date
      FROM complaints c
      INNER JOIN residents r
        ON c.resident_id = r.id
      WHERE c.resident_id = ?
      ORDER BY c.complaint_date DESC`,
      [resident_id]
    );

    res.status(200).json(complaints);

  } catch (error) {
    console.error("Get Complaints Error:", error);

    res.status(500).json({
      message: "Unable to fetch complaints"
    });
  }
};


// GET SINGLE COMPLAINT
const getComplaintById = async (req, res) => {
  try {
    const resident_id = req.user.id;
    const complaint_id = req.params.id;

    const [complaints] = await pool.query(
      `SELECT
        c.complaint_id,
        c.resident_id,
        r.first_name,
        r.last_name,
        r.flat_number,
        c.complaint_title,
        c.complaint_description,
        c.category,
        c.status,
        c.user_id,
        c.complaint_date
      FROM complaints c
      INNER JOIN residents r
        ON c.resident_id = r.id
      WHERE c.complaint_id = ?
      AND c.resident_id = ?`,
      [
        complaint_id,
        resident_id
      ]
    );

    if (complaints.length === 0) {
      return res.status(404).json({
        message: "Complaint not found"
      });
    }

    res.status(200).json(complaints[0]);

  } catch (error) {
    console.error("Get Complaint Error:", error);

    res.status(500).json({
      message: "Unable to fetch complaint"
    });
  }
};


module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById
};