const { pool } = require("../config/db");

// ==========================================
// GET ALL FACILITIES
// ==========================================
const getFacilities = async (req, res) => {
  try {
    const [facilities] = await pool.query(`
      SELECT
        facility_id,
        facility_name,
        description,
        location,
        availability_status,
        created_at
      FROM facilities
      ORDER BY facility_name ASC
    `);

    res.status(200).json({
      facilities,
    });
  } catch (error) {
    console.error("Get Facilities Error:", error);

    res.status(500).json({
      message: "Unable to fetch facilities",
    });
  }
};


// ==========================================
// GET MY BOOKINGS
// ==========================================
const getMyBookings = async (req, res) => {
  try {
    const residentId = req.user.id;

    const [bookings] = await pool.query(
      `
      SELECT
        fb.booking_id,
        fb.facility_id,
        f.facility_name,
        f.location,
        fb.booking_date,
        fb.start_time,
        fb.end_time,
        fb.purpose,
        fb.status,
        fb.created_at
      FROM facility_bookings fb
      INNER JOIN facilities f
        ON fb.facility_id = f.facility_id
      WHERE fb.resident_id = ?
      ORDER BY fb.booking_date DESC, fb.start_time DESC
      `,
      [residentId]
    );

    res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error("Get My Bookings Error:", error);

    res.status(500).json({
      message: "Unable to fetch bookings",
    });
  }
};


// ==========================================
// CREATE BOOKING
// ==========================================
const createBooking = async (req, res) => {
  try {
    const residentId = req.user.id;

    const {
      facility_id,
      booking_date,
      start_time,
      end_time,
      purpose,
    } = req.body;

    // Validate fields
    if (
      !facility_id ||
      !booking_date ||
      !start_time ||
      !end_time ||
      !purpose
    ) {
      return res.status(400).json({
        message: "All booking details are required",
      });
    }

    // Check facility
    const [facility] = await pool.query(
      `
      SELECT
        facility_id,
        facility_name,
        availability_status
      FROM facilities
      WHERE facility_id = ?
      LIMIT 1
      `,
      [facility_id]
    );

    if (facility.length === 0) {
      return res.status(404).json({
        message: "Facility not found",
      });
    }

    if (facility[0].availability_status !== "Available") {
      return res.status(400).json({
        message: "This facility is currently unavailable",
      });
    }

    // Check time
    if (start_time >= end_time) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    // Check overlapping bookings
    const [existingBooking] = await pool.query(
      `
      SELECT booking_id
      FROM facility_bookings
      WHERE facility_id = ?
      AND booking_date = ?
      AND status IN ('Pending', 'Approved')
      AND start_time < ?
      AND end_time > ?
      LIMIT 1
      `,
      [
        facility_id,
        booking_date,
        end_time,
        start_time,
      ]
    );

    if (existingBooking.length > 0) {
      return res.status(409).json({
        message: "This time slot is already booked",
      });
    }

    // Create booking
    const [result] = await pool.query(
      `
      INSERT INTO facility_bookings
      (
        facility_id,
        resident_id,
        booking_date,
        start_time,
        end_time,
        purpose,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'Pending')
      `,
      [
        facility_id,
        residentId,
        booking_date,
        start_time,
        end_time,
        purpose,
      ]
    );

    // Get created booking
    const [booking] = await pool.query(
      `
      SELECT
        fb.booking_id,
        fb.facility_id,
        f.facility_name,
        f.location,
        fb.booking_date,
        fb.start_time,
        fb.end_time,
        fb.purpose,
        fb.status,
        fb.created_at
      FROM facility_bookings fb
      INNER JOIN facilities f
        ON fb.facility_id = f.facility_id
      WHERE fb.booking_id = ?
      AND fb.resident_id = ?
      `,
      [
        result.insertId,
        residentId,
      ]
    );

    res.status(201).json({
      message: "Facility booking request submitted successfully",
      booking: booking[0],
    });

  } catch (error) {
    console.error("Create Booking Error:", error);

    res.status(500).json({
      message: "Unable to create facility booking",
    });
  }
};


module.exports = {
  getFacilities,
  getMyBookings,
  createBooking,
};
