const { pool } = require("../config/db");

// ==========================================
// GET MY SERVICE REQUESTS
// ==========================================

const getMyServiceRequests = async (req, res) => {
  try {
    const residentId = req.user.id;

    const [requests] = await pool.query(
      `SELECT
        service_request_id,
        resident_id,
        service_type,
        request_description,
        status,
        assigned_to,
        request_date,
        completed_date
      FROM service_requests
      WHERE resident_id = ?
      ORDER BY request_date DESC`,
      [residentId]
    );

    res.status(200).json({
      requests,
    });

  } catch (error) {
    console.error("Get My Service Requests Error:", error);

    res.status(500).json({
      message: "Unable to fetch service requests",
    });
  }
};


// ==========================================
// CREATE SERVICE REQUEST
// ==========================================

const createServiceRequest = async (req, res) => {
  try {
    const residentId = req.user.id;

    const {
      service_type,
      request_description,
    } = req.body;

    // --------------------------------------
    // Validate required fields
    // --------------------------------------

    if (!service_type || !request_description) {
      return res.status(400).json({
        message:
          "Service type and request description are required",
      });
    }

    // --------------------------------------
    // Insert request
    // --------------------------------------

    const [result] = await pool.query(
      `INSERT INTO service_requests
      (
        resident_id,
        service_type,
        request_description,
        status
      )
      VALUES (?, ?, ?, 'Pending')`,
      [
        residentId,
        service_type,
        request_description,
      ]
    );

    // --------------------------------------
    // Get created request
    // --------------------------------------

    const [requests] = await pool.query(
      `SELECT
        service_request_id,
        resident_id,
        service_type,
        request_description,
        status,
        assigned_to,
        request_date,
        completed_date
      FROM service_requests
      WHERE service_request_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Service request submitted successfully",
      request: requests[0],
    });

  } catch (error) {
    console.error(
      "Create Service Request Error:",
      error
    );

    res.status(500).json({
      message: "Unable to create service request",
    });
  }
};


// ==========================================
// GET SINGLE SERVICE REQUEST
// ==========================================

const getServiceRequestById = async (req, res) => {
  try {
    const residentId = req.user.id;
    const requestId = req.params.id;

    const [requests] = await pool.query(
      `SELECT
        service_request_id,
        resident_id,
        service_type,
        request_description,
        status,
        assigned_to,
        request_date,
        completed_date
      FROM service_requests
      WHERE service_request_id = ?
      AND resident_id = ?
      LIMIT 1`,
      [
        requestId,
        residentId,
      ]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: "Service request not found",
      });
    }

    res.status(200).json({
      request: requests[0],
    });

  } catch (error) {
    console.error(
      "Get Service Request Error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch service request",
    });
  }
};

// GET ALL SERVICE REQUESTS FOR STAFF
const getStaffServiceRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(`
      SELECT
        sr.service_request_id,
        sr.resident_id,
        r.first_name,
        r.last_name,
        r.flat_number,
        sr.service_type,
        sr.request_description,
        sr.status,
        sr.assigned_to,
        sr.request_date,
        sr.completed_date
      FROM service_requests sr
      INNER JOIN residents r
        ON sr.resident_id = r.id
      ORDER BY sr.request_date DESC
    `);

    res.status(200).json({
      requests
    });

  } catch (error) {
    console.error("Get Staff Service Requests Error:", error);

    res.status(500).json({
      message: "Unable to fetch staff service requests"
    });
  }
};

// ==========================================
// UPDATE SERVICE REQUEST STATUS - STAFF
// ==========================================

const updateServiceRequestStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    // Allowed statuses
    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid service request status",
      });
    }

    // Update status
    if (status === "Completed") {
      await pool.query(
        `UPDATE service_requests
         SET status = ?, completed_date = NOW()
         WHERE service_request_id = ?`,
        [status, requestId]
      );
    } else {
      await pool.query(
        `UPDATE service_requests
         SET status = ?
         WHERE service_request_id = ?`,
        [status, requestId]
      );
    }

    // Check updated request
    const [requests] = await pool.query(
      `SELECT
        service_request_id,
        resident_id,
        service_type,
        request_description,
        status,
        assigned_to,
        request_date,
        completed_date
       FROM service_requests
       WHERE service_request_id = ?`,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: "Service request not found",
      });
    }

    res.status(200).json({
      message: "Service request status updated successfully",
      request: requests[0],
    });

  } catch (error) {
    console.error(
      "Update Service Request Status Error:",
      error
    );

    res.status(500).json({
      message: "Unable to update service request status",
    });
  }
};



module.exports = {
  getMyServiceRequests,
  createServiceRequest,
  getServiceRequestById,
  getStaffServiceRequests,
  updateServiceRequestStatus
};