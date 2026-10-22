const { pool } = require("../config/db");

const MAINTENANCE_AMOUNT = 2000;
const MAINTENANCE_DUE_DAY = 10;
const LATE_PENALTY = 500;

let schemaReady = false;

const addColumnIfMissing = async (table, column, definition) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ? LIMIT 1`,
    [table, column]
  );
  if (!rows.length) await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
};

const ensureMaintenanceSchema = async () => {
  if (schemaReady) return;
  await addColumnIfMissing("payments", "payment_type", "VARCHAR(30) NOT NULL DEFAULT 'Other'");
  await addColumnIfMissing("payments", "penalty_amount", "DECIMAL(10, 2) NOT NULL DEFAULT 0");
  schemaReady = true;
};

const pad = (value) => String(value).padStart(2, "0");

// Creates this month's maintenance due (payable 1st-10th) for every active
// resident and adds a flat late fee to maintenance dues unpaid after the 10th.
const syncMaintenanceDues = async () => {
  await ensureMaintenanceSchema();

  const now = new Date();
  const billingMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });
  const dueDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(MAINTENANCE_DUE_DAY)}`;

  await pool.query(
    `INSERT INTO payments (resident_id, amount, billing_month, due_date, status, payment_type)
     SELECT r.id, ?, ?, ?, 'Pending', 'Maintenance'
     FROM residents r
     WHERE r.user_type = 'Resident' AND r.is_active = 1
       AND NOT EXISTS (
         SELECT 1 FROM payments p
         WHERE p.resident_id = r.id AND p.payment_type = 'Maintenance' AND p.billing_month = ?
       )`,
    [MAINTENANCE_AMOUNT, billingMonth, dueDate, billingMonth]
  );

  // Any old checkout order is dropped so the next one is created for the new amount.
  await pool.query(
    `UPDATE payments
     SET amount = amount + ?, penalty_amount = ?, razorpay_order_id = NULL
     WHERE payment_type = 'Maintenance' AND status = 'Pending'
       AND penalty_amount = 0 AND due_date < CURDATE()`,
    [LATE_PENALTY, LATE_PENALTY]
  );
};

module.exports = {
  MAINTENANCE_AMOUNT,
  MAINTENANCE_DUE_DAY,
  LATE_PENALTY,
  ensureMaintenanceSchema,
  syncMaintenanceDues,
};
