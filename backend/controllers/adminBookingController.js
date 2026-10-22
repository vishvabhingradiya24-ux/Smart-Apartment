const { pool } = require("../config/db");
const { PAYMENT_WINDOW_DAYS, expireUnpaidBookings } = require("../utils/facilityBookings");

const getFacilityBookings = async (req, res) => {
  try {
    await expireUnpaidBookings();
    const [bookings] = await pool.query(
      `SELECT fb.booking_id, fb.facility_id, f.facility_name, fb.booking_date, fb.start_time, fb.end_time,
              fb.purpose, fb.number_of_people, fb.additional_requirements,
              fb.facility_charge, fb.additional_charge, fb.total_amount, fb.status,
              fb.created_at, fb.payment_due_at, fb.admin_remarks,
              p.status AS payment_status,
              r.first_name, r.last_name, r.block_wing, r.flat_number
       FROM facility_bookings fb
       INNER JOIN facilities f ON f.facility_id = fb.facility_id
       LEFT JOIN residents r ON r.id = fb.resident_id
       LEFT JOIN payments p ON p.id = fb.payment_id
       ORDER BY (fb.status = 'Pending') DESC, fb.created_at DESC`
    );
    for (const booking of bookings) {
      const [addons] = await pool.query(
        `SELECT fa.addon_name, ba.quantity, ba.total_price
         FROM booking_addons ba INNER JOIN facility_addons fa ON fa.addon_id = ba.addon_id
         WHERE ba.booking_id = ?`,
        [booking.booking_id]
      );
      booking.addons = addons;
    }
    res.status(200).json({ bookings, paymentWindowDays: PAYMENT_WINDOW_DAYS });
  } catch (error) {
    console.error("Get Facility Bookings Error:", error);
    res.status(500).json({ message: "Unable to fetch facility bookings" });
  }
};

const approveFacilityBooking = async (req, res) => {
  let connection;
  try {
    await expireUnpaidBookings();
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT * FROM facility_bookings WHERE booking_id = ? FOR UPDATE",
      [req.params.id]
    );
    const booking = rows[0];
    if (!booking) {
      await connection.rollback();
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status !== "Pending") {
      await connection.rollback();
      return res.status(409).json({ message: "Only pending bookings can be approved" });
    }

    const [clash] = await connection.query(
      `SELECT booking_id FROM facility_bookings
       WHERE facility_id = ? AND booking_date = ? AND status = 'Approved'
         AND booking_id <> ? AND start_time < ? AND end_time > ? LIMIT 1`,
      [booking.facility_id, booking.booking_date, booking.booking_id, booking.end_time, booking.start_time]
    );
    if (clash.length) {
      await connection.rollback();
      return res.status(409).json({ message: "This slot is already approved for another booking" });
    }

    const amount = Number(booking.total_amount || 0);
    let paymentId = null;
    let dueAt = null;
    if (amount > 0) {
      dueAt = new Date(Date.now() + PAYMENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
      const [payment] = await connection.query(
        `INSERT INTO payments (resident_id, amount, billing_month, due_date, status)
         VALUES (?, ?, ?, ?, 'Pending')`,
        [booking.resident_id, amount, `Facility Booking #${booking.booking_id}`, dueAt]
      );
      paymentId = payment.insertId;
    }

    await connection.query(
      `UPDATE facility_bookings
       SET status = 'Approved', payment_id = ?, payment_due_at = ?, admin_remarks = NULL, reviewed_at = NOW()
       WHERE booking_id = ?`,
      [paymentId, dueAt, booking.booking_id]
    );
    await connection.commit();
    res.status(200).json({
      message: amount > 0
        ? `Booking approved. Resident must pay within ${PAYMENT_WINDOW_DAYS} days.`
        : "Booking approved",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Approve Facility Booking Error:", error);
    res.status(500).json({ message: "Unable to approve booking" });
  } finally {
    if (connection) connection.release();
  }
};

const rejectFacilityBooking = async (req, res) => {
  try {
    const remarks = String(req.body?.remarks || "").trim().slice(0, 255) || null;
    const [result] = await pool.query(
      `UPDATE facility_bookings
       SET status = 'Rejected', admin_remarks = ?, reviewed_at = NOW()
       WHERE booking_id = ? AND status = 'Pending'`,
      [remarks, req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(409).json({ message: "Only pending bookings can be rejected" });
    }
    res.status(200).json({ message: "Booking rejected" });
  } catch (error) {
    console.error("Reject Facility Booking Error:", error);
    res.status(500).json({ message: "Unable to reject booking" });
  }
};

module.exports = { getFacilityBookings, approveFacilityBooking, rejectFacilityBooking };
