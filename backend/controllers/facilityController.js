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
        base_charge,
        charge_period
      FROM facilities
      ORDER BY facility_name ASC
    `);

    const [addons] = await pool.query(`
      SELECT
        addon_id,
        addon_name,
        description,
        charge_type,
        price,
        status
      FROM facility_addons
      WHERE status = 'Available'
      ORDER BY addon_name ASC
    `);

    res.status(200).json({
      facilities,
      addons,
    });
  } catch (error) {
    console.error("Get Facilities Error:", error);

    res.status(500).json({
      message: "Unable to fetch facilities",
    });
  }
};

// ==========================================
// GET MY BOOKINGS / BOOKING HISTORY
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
        f.base_charge,
        f.charge_period,
        fb.booking_date,
        fb.start_time,
        fb.end_time,
        fb.purpose,
        fb.number_of_people,
        fb.additional_requirements,
        fb.facility_charge,
        fb.additional_charge,
        fb.total_amount,
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

    for (const booking of bookings) {
      const [addons] = await pool.query(
        `
        SELECT
          ba.booking_addon_id,
          ba.addon_id,
          fa.addon_name,
          fa.charge_type,
          ba.quantity,
          ba.unit_price,
          ba.total_price
        FROM booking_addons ba
        INNER JOIN facility_addons fa
          ON ba.addon_id = fa.addon_id
        WHERE ba.booking_id = ?
        ORDER BY ba.booking_addon_id ASC
        `,
        [booking.booking_id]
      );

      booking.addons = addons;
    }

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
// CHECK FACILITY AVAILABILITY
// ==========================================
const checkAvailability = async (req, res) => {
  try {
    const {
      facility_id,
      booking_date,
      start_time,
      end_time,
    } = req.body;

    if (
      !facility_id ||
      !booking_date ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        message: "Facility, date and time are required",
      });
    }

    if (start_time >= end_time) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    const [facility] = await pool.query(
      `
      SELECT
        facility_id,
        facility_name,
        availability_status,
        base_charge,
        charge_period
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
      return res.status(200).json({
        available: false,
        message: "This facility is currently unavailable",
      });
    }

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
      return res.status(200).json({
        available: false,
        message: "This time slot is already booked",
      });
    }

    const bookingCharge =
      facility[0].charge_period === "Per Booking"
        ? Number(facility[0].base_charge)
        : 0;

    res.status(200).json({
      available: true,
      message: "Facility is available for the selected time",
      facility_charge: bookingCharge,
      base_charge: Number(facility[0].base_charge),
      charge_period: facility[0].charge_period,
    });
  } catch (error) {
    console.error("Check Availability Error:", error);

    res.status(500).json({
      message: "Unable to check facility availability",
    });
  }
};

// ==========================================
// CREATE BOOKING
// ==========================================
const createBooking = async (req, res) => {
  let connection;

  try {
    const residentId = req.user.id;

    const {
      facility_id,
      booking_date,
      start_time,
      end_time,
      purpose,
      number_of_people,
      additional_requirements,
      addons,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================
    if (
      !facility_id ||
      !booking_date ||
      !start_time ||
      !end_time ||
      !purpose ||
      !number_of_people
    ) {
      return res.status(400).json({
        message: "Please fill all required booking details",
      });
    }

    if (Number(number_of_people) <= 0) {
      return res.status(400).json({
        message: "Number of people must be greater than 0",
      });
    }

    if (start_time >= end_time) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    // ==========================================
    // CHECK FACILITY
    // ==========================================
    const [facility] = await pool.query(
      `
      SELECT
        facility_id,
        facility_name,
        availability_status,
        base_charge,
        charge_period
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

    // ==========================================
    // CHECK OVERLAPPING BOOKINGS
    // ==========================================
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

    // ==========================================
    // CALCULATE FACILITY CHARGE
    // ==========================================
    const facilityCharge =
      facility[0].charge_period === "Per Booking"
        ? Number(facility[0].base_charge)
        : 0;

    // ==========================================
    // NORMALIZE ADDONS
    // ==========================================
    let selectedAddons = [];

    if (Array.isArray(addons)) {
      selectedAddons = addons;
    }

    let additionalCharge = 0;
    const addonDetails = [];

    // ==========================================
    // CALCULATE ADDON CHARGES
    // ==========================================
    for (const selectedAddon of selectedAddons) {
      const addonId = Number(
        selectedAddon.addon_id
      );

      const quantity = Number(
        selectedAddon.quantity || 1
      );

      if (!addonId || quantity <= 0) {
        return res.status(400).json({
          message: "Invalid add-on details",
        });
      }

      const [addonRows] = await pool.query(
        `
        SELECT
          addon_id,
          addon_name,
          charge_type,
          price,
          status
        FROM facility_addons
        WHERE addon_id = ?
        LIMIT 1
        `,
        [addonId]
      );

      if (addonRows.length === 0) {
        return res.status(404).json({
          message: `Add-on ${addonId} not found`,
        });
      }

      const addon = addonRows[0];

      if (addon.status !== "Available") {
        return res.status(400).json({
          message: `${addon.addon_name} is currently unavailable`,
        });
      }

      const unitPrice = Number(addon.price);

      let totalPrice = 0;

      if (addon.charge_type === "Fixed") {
        totalPrice = unitPrice;
      }

      if (addon.charge_type === "Per Item") {
        totalPrice = unitPrice * quantity;
      }

      if (addon.charge_type === "Per Person") {
        totalPrice =
          unitPrice * Number(number_of_people);
      }

      additionalCharge += totalPrice;

      addonDetails.push({
        addon_id: addon.addon_id,
        addon_name: addon.addon_name,
        charge_type: addon.charge_type,
        quantity:
          addon.charge_type === "Fixed"
            ? 1
            : addon.charge_type === "Per Person"
            ? Number(number_of_people)
            : quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      });
    }

    // ==========================================
    // CALCULATE TOTAL
    // ==========================================
    const totalAmount =
      facilityCharge + additionalCharge;

    // ==========================================
    // DATABASE CONNECTION
    // ==========================================
    connection = await pool.getConnection();

    await connection.beginTransaction();

    // ==========================================
    // CREATE BOOKING
    // ==========================================
    const [result] = await connection.query(
      `
      INSERT INTO facility_bookings
      (
        facility_id,
        resident_id,
        booking_date,
        start_time,
        end_time,
        purpose,
        number_of_people,
        additional_requirements,
        facility_charge,
        additional_charge,
        total_amount,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
      `,
      [
        facility_id,
        residentId,
        booking_date,
        start_time,
        end_time,
        purpose,
        number_of_people,
        additional_requirements || null,
        facilityCharge,
        additionalCharge,
        totalAmount,
      ]
    );

    const bookingId = result.insertId;

    // ==========================================
    // SAVE SELECTED ADDONS
    // ==========================================
    for (const addon of addonDetails) {
      await connection.query(
        `
        INSERT INTO booking_addons
        (
          booking_id,
          addon_id,
          quantity,
          unit_price,
          total_price
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          bookingId,
          addon.addon_id,
          addon.quantity,
          addon.unit_price,
          addon.total_price,
        ]
      );
    }

    await connection.commit();

    // ==========================================
    // GET CREATED BOOKING
    // ==========================================
    const [booking] = await pool.query(
      `
      SELECT
        fb.booking_id,
        fb.facility_id,
        f.facility_name,
        f.location,
        f.base_charge,
        f.charge_period,
        fb.booking_date,
        fb.start_time,
        fb.end_time,
        fb.purpose,
        fb.number_of_people,
        fb.additional_requirements,
        fb.facility_charge,
        fb.additional_charge,
        fb.total_amount,
        fb.status,
        fb.created_at
      FROM facility_bookings fb
      INNER JOIN facilities f
        ON fb.facility_id = f.facility_id
      WHERE fb.booking_id = ?
      AND fb.resident_id = ?
      `,
      [
        bookingId,
        residentId,
      ]
    );

    res.status(201).json({
      message:
        "Facility booking request submitted successfully",

      booking: {
        ...booking[0],
        addons: addonDetails,
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error(
      "Create Booking Error:",
      error
    );

    res.status(500).json({
      message: "Unable to create facility booking",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  getFacilities,
  getMyBookings,
  checkAvailability,
  createBooking,
};