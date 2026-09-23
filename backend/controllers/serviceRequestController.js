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


module.exports = {
  getMyServiceRequests,
  createServiceRequest,
  getServiceRequestById,
};