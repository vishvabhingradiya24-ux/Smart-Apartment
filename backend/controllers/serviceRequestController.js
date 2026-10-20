const { pool } = require("../config/db");
const {
  SERVICE_REQUEST_DEPARTMENTS,
  canTakeWork,
  mismatchMessage
} = require("../constants/workDepartments");

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
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

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
      WHERE sr.assigned_to = ?
      ORDER BY sr.request_date DESC
    `, [req.user.id]);

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

const getAdminServiceRequests = async (req, res) => {
  try {
    if (req.user?.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const [requests] = await pool.query(
      `SELECT
         sr.service_request_id,
         sr.resident_id,
         r.first_name,
         r.last_name,
         r.flat_number,
         sr.service_type,
         sr.request_description,
         sr.status,
         sr.assigned_to,
         s.first_name AS staff_first_name,
         s.last_name AS staff_last_name,
         sr.request_date,
         sr.completed_date
       FROM service_requests sr
       INNER JOIN residents r ON r.id = sr.resident_id
       LEFT JOIN staff s ON s.id = sr.assigned_to
       ORDER BY sr.request_date DESC`
    );

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Get Admin Service Requests Error:", error);
    res.status(500).json({ message: "Unable to fetch service requests" });
  }
};

const assignServiceRequestToStaff = async (req, res) => {
  try {
    if (req.user?.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const requestId = Number(req.params.id);
    const staffId = Number(req.body.staff_id);
    if (!Number.isInteger(requestId) || requestId < 1 ||
        !Number.isInteger(staffId) || staffId < 1) {
      return res.status(400).json({ message: "A valid request and staff member are required" });
    }

    const [requests] = await pool.query(
      "SELECT service_request_id, service_type FROM service_requests WHERE service_request_id = ?",
      [requestId]
    );
    if (requests.length === 0) {
      return res.status(404).json({ message: "Service request not found" });
    }

    const [staff] = await pool.query(
      "SELECT id, department FROM staff WHERE id = ?",
      [staffId]
    );
    if (staff.length === 0) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Only a staff member of the matching type can take this request
    if (
      !canTakeWork(
        SERVICE_REQUEST_DEPARTMENTS,
        requests[0].service_type,
        staff[0].department
      )
    ) {
      return res.status(400).json({
        message: mismatchMessage(
          "service requests",
          requests[0].service_type,
          SERVICE_REQUEST_DEPARTMENTS,
          staff[0].department
        )
      });
    }

    await pool.query(
      "UPDATE service_requests SET assigned_to = ? WHERE service_request_id = ?",
      [staffId, requestId]
    );

    res.status(200).json({
      message: "Service request assigned successfully",
      requestId,
      assigned_to: staffId,
    });
  } catch (error) {
    console.error("Assign Service Request Error:", error);
    res.status(500).json({ message: "Unable to assign service request" });
  }
};

// ==========================================
// UPDATE SERVICE REQUEST STATUS - STAFF
// ==========================================

const updateServiceRequestStatus = async (req, res) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

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

    const [assignedRequests] = await pool.query(
      `SELECT service_request_id
       FROM service_requests
       WHERE service_request_id = ? AND assigned_to = ?`,
      [requestId, req.user.id]
    );
    if (assignedRequests.length === 0) {
      return res.status(404).json({
        message: "Service request not found or not assigned to you",
      });
    }

    if (status === "Completed") {
      await pool.query(
        `UPDATE service_requests
         SET status = ?, completed_date = NOW()
         WHERE service_request_id = ? AND assigned_to = ?`,
        [status, requestId, req.user.id]
      );
    } else {
      await pool.query(
        `UPDATE service_requests
         SET status = ?
         WHERE service_request_id = ? AND assigned_to = ?`,
        [status, requestId, req.user.id]
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
       WHERE service_request_id = ? AND assigned_to = ?`,
      [requestId, req.user.id]
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
  getAdminServiceRequests,
  assignServiceRequestToStaff,
  updateServiceRequestStatus
};