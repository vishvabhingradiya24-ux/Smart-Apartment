const { pool } = require("../config/db");


// ======================================================
// CREATE COMPLAINT - RESIDENT
// ======================================================

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

    // Check resident exists
    const [residents] = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        flat_number
       FROM residents
       WHERE id = ?`,
      [resident_id]
    );

    if (residents.length === 0) {
      return res.status(404).json({
        message: "Resident not found"
      });
    }

    // Create complaint
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
        complaint_title.trim(),
        complaint_description.trim(),
        category
      ]
    );

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaintId: result.insertId
    });

  } catch (error) {
    console.error(
      "Create Complaint Error:",
      error
    );

    res.status(500).json({
      message: "Unable to submit complaint"
    });
  }
};


// ======================================================
// GET MY COMPLAINTS - RESIDENT
// ======================================================

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

        c.assigned_staff_id,

        s.first_name AS staff_first_name,
        s.last_name AS staff_last_name,
        s.staff_type,

        c.resolution_details,

        c.complaint_date,
        c.updated_at

      FROM complaints c

      INNER JOIN residents r
        ON c.resident_id = r.id

      LEFT JOIN staff s
        ON c.assigned_staff_id = s.id

      WHERE c.resident_id = ?

      ORDER BY c.complaint_date DESC`,
      [resident_id]
    );

    res.status(200).json(complaints);

  } catch (error) {
    console.error(
      "Get My Complaints Error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch complaints"
    });
  }
};


// ======================================================
// GET SINGLE COMPLAINT - RESIDENT
// ======================================================

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

        c.assigned_staff_id,

        s.first_name AS staff_first_name,
        s.last_name AS staff_last_name,
        s.staff_type,

        c.resolution_details,

        c.complaint_date,
        c.updated_at

      FROM complaints c

      INNER JOIN residents r
        ON c.resident_id = r.id

      LEFT JOIN staff s
        ON c.assigned_staff_id = s.id

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

    res.status(200).json(
      complaints[0]
    );

  } catch (error) {
    console.error(
      "Get Complaint Error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch complaint"
    });
  }
};


// ======================================================
// GET ALL COMPLAINTS - ADMIN
// ======================================================

const getAdminComplaints = async (req, res) => {
  try {

    // Only Admin can access
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

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

        c.assigned_staff_id,

        s.first_name AS staff_first_name,
        s.last_name AS staff_last_name,
        s.staff_type,

        c.resolution_details,

        c.complaint_date,
        c.updated_at

      FROM complaints c

      INNER JOIN residents r
        ON c.resident_id = r.id

      LEFT JOIN staff s
        ON c.assigned_staff_id = s.id

      ORDER BY c.complaint_date DESC`
    );

    res.status(200).json(
      complaints
    );

  } catch (error) {
    console.error(
      "Get Admin Complaints Error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch admin complaints"
    });
  }
};


// ======================================================
// ASSIGN COMPLAINT TO STAFF - ADMIN
// ======================================================

const assignComplaintToStaff = async (req, res) => {
  try {

    // Only Admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const complaint_id = req.params.id;

    const {
      staff_id
    } = req.body;


    if (!staff_id) {
      return res.status(400).json({
        message: "Staff ID is required"
      });
    }


    // Check complaint exists
    const [complaints] = await pool.query(
      `SELECT complaint_id
       FROM complaints
       WHERE complaint_id = ?`,
      [complaint_id]
    );


    if (complaints.length === 0) {
      return res.status(404).json({
        message: "Complaint not found"
      });
    }


    // Check staff exists
    const [staff] = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        staff_type
       FROM staff
       WHERE id = ?`,
      [staff_id]
    );


    if (staff.length === 0) {
      return res.status(404).json({
        message: "Staff member not found"
      });
    }


    // Assign staff
    await pool.query(
      `UPDATE complaints
       SET
         assigned_staff_id = ?,
         status = 'Assigned',
         updated_at = CURRENT_TIMESTAMP
       WHERE complaint_id = ?`,
      [
        staff_id,
        complaint_id
      ]
    );


    res.status(200).json({
      message: "Complaint assigned successfully",

      complaintId: complaint_id,

      assignedStaff: {
        id: staff[0].id,
        name:
          `${staff[0].first_name} ${staff[0].last_name}`,
        staffType: staff[0].staff_type
      }
    });

  } catch (error) {

    console.error(
      "Assign Complaint Error:",
      error
    );

    res.status(500).json({
      message: "Unable to assign complaint"
    });
  }
};


// ======================================================
// GET ASSIGNED COMPLAINTS - STAFF
// ======================================================

const getStaffComplaints = async (req, res) => {
  try {

    // Staff ID comes from JWT
    const staff_id = req.user.id;

    // Make sure logged-in user is Staff
    if (req.user.role !== "Staff") {
      return res.status(403).json({
        message: "Staff access required"
      });
    }


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

        c.assigned_staff_id,

        s.first_name AS staff_first_name,
        s.last_name AS staff_last_name,
        s.staff_type,

        c.resolution_details,

        c.complaint_date,
        c.updated_at

      FROM complaints c

      INNER JOIN residents r
        ON c.resident_id = r.id

      LEFT JOIN staff s
        ON c.assigned_staff_id = s.id

      WHERE c.assigned_staff_id = ?

      ORDER BY c.complaint_date DESC`,
      [staff_id]
    );


    res.status(200).json(
      complaints
    );

  } catch (error) {

    console.error(
      "Get Staff Complaints Error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch assigned complaints"
    });
  }
};


// ======================================================
// UPDATE COMPLAINT STATUS - STAFF
// ======================================================

const updateComplaintStatus = async (req, res) => {
  try {

    // Staff only
    if (req.user.role !== "Staff") {
      return res.status(403).json({
        message: "Staff access required"
      });
    }


    const staff_id = req.user.id;
    const complaint_id = req.params.id;

    const {
      status,
      resolution_details
    } = req.body;


    // Allowed statuses
    const allowedStatuses = [
      "Assigned",
      "In Progress",
      "Resolved"
    ];


    if (!status) {
      return res.status(400).json({
        message: "Status is required"
      });
    }


    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid complaint status"
      });
    }


    // Check complaint belongs to this staff
    const [complaints] = await pool.query(
      `SELECT complaint_id
       FROM complaints
       WHERE complaint_id = ?
       AND assigned_staff_id = ?`,
      [
        complaint_id,
        staff_id
      ]
    );


    if (complaints.length === 0) {
      return res.status(404).json({
        message:
          "Complaint not found or not assigned to you"
      });
    }


    // Update status
    await pool.query(
      `UPDATE complaints
       SET
         status = ?,
         resolution_details = ?,
         updated_at = CURRENT_TIMESTAMP
       WHERE complaint_id = ?
       AND assigned_staff_id = ?`,
      [
        status,
        resolution_details || null,
        complaint_id,
        staff_id
      ]
    );


    res.status(200).json({
      message:
        "Complaint status updated successfully",

      complaintId: complaint_id,

      status,

      resolution_details:
        resolution_details || null
    });

  } catch (error) {

    console.error(
      "Update Complaint Status Error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to update complaint status"
    });
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

  createComplaint,

  getMyComplaints,

  getComplaintById,

  getStaffComplaints,

  getAdminComplaints,

  assignComplaintToStaff,

  updateComplaintStatus

};