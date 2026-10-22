const { pool } = require("../config/db");

const PAYMENT_WINDOW_DAYS = 2;
let schemaReady = false;

const addColumnIfMissing = async (table, column, definition) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ? LIMIT 1`,
    [table, column]
  );
  if (!rows.length) await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
};

// Adds approval/payment tracking columns to facility_bookings.
const ensureBookingSchema = async () => {
  if (schemaReady) return;
  await addColumnIfMissing("facility_bookings", "payment_id", "INT NULL");
  await addColumnIfMissing("facility_bookings", "payment_due_at", "DATETIME NULL");
  await addColumnIfMissing("facility_bookings", "admin_remarks", "VARCHAR(255) NULL");
  await addColumnIfMissing("facility_bookings", "reviewed_at", "DATETIME NULL");
  schemaReady = true;
};

// Approved bookings whose payment was not made within the window are cancelled
// and the slot is released.
const expireUnpaidBookings = async () => {
  await ensureBookingSchema();
  await pool.query(
    `UPDATE payments p
     INNER JOIN facility_bookings fb ON fb.payment_id = p.id
     SET p.status = 'Cancelled'
     WHERE fb.status = 'Approved' AND p.status = 'Pending'
       AND fb.payment_due_at IS NOT NULL AND fb.payment_due_at < NOW()`
  );
  await pool.query(
    `UPDATE facility_bookings fb
     INNER JOIN payments p ON p.id = fb.payment_id
     SET fb.status = 'Cancelled',
         fb.admin_remarks = 'Payment not made within 2 days of approval'
     WHERE fb.status = 'Approved' AND p.status = 'Cancelled'
       AND fb.payment_due_at IS NOT NULL AND fb.payment_due_at < NOW()`
  );
};

module.exports = { PAYMENT_WINDOW_DAYS, ensureBookingSchema, expireUnpaidBookings };
