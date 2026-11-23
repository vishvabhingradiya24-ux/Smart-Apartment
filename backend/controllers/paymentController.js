const crypto = require("crypto");
const { syncMaintenanceDues } = require("../utils/maintenance");
const Razorpay = require("razorpay");

const { pool } = require("../config/db");


// ==========================================
// RAZORPAY INSTANCE
// ==========================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ==========================================
// GET ALL PAYMENTS OF LOGGED-IN RESIDENT
// ==========================================

const getMyPayments = async (req, res) => {
  try {
    const residentId = req.user.id;
    await syncMaintenanceDues();

    const [payments] = await pool.query(
      `SELECT
        p.id,
        p.amount,
        p.billing_month,
        p.due_date,
        p.paid_date,
        p.status,
        p.payment_method,
        p.transaction_id,
        p.razorpay_order_id,
        p.payment_type,
        p.penalty_amount,
        p.created_at,
        r.first_name,
        r.last_name,
        r.email,
        r.phone,
        r.block_wing,
        r.flat_number,
        fb.booking_id,
        f.facility_name,
        fb.booking_date AS facility_booking_date,
        fb.start_time AS facility_start_time,
        fb.end_time AS facility_end_time,
        fb.purpose AS facility_booking_purpose,
        fb.facility_charge,
        fb.additional_charge,
        (SELECT GROUP_CONCAT(
          CONCAT(fa.addon_name, ' x ', ba.quantity)
          ORDER BY ba.booking_addon_id SEPARATOR ', '
        )
         FROM booking_addons ba
         INNER JOIN facility_addons fa ON fa.addon_id = ba.addon_id
         WHERE ba.booking_id = fb.booking_id) AS facility_addons
      FROM payments p
      LEFT JOIN residents r ON r.id = p.resident_id
      LEFT JOIN facility_bookings fb ON fb.payment_id = p.id
      LEFT JOIN facilities f ON f.facility_id = fb.facility_id
      WHERE p.resident_id = ?
      ORDER BY COALESCE(p.paid_date, p.due_date, p.created_at) DESC`,
      [residentId]
    );

    res.status(200).json({
      payments,
    });

  } catch (error) {
    console.error("Get My Payments Error:", error);

    res.status(500).json({
      message: "Unable to fetch payments",
    });
  }
};


// ==========================================
// GET CURRENT PAYMENT
// ==========================================

const getCurrentPayment = async (req, res) => {
  try {
    const residentId = req.user.id;
    await syncMaintenanceDues();

    const [payments] = await pool.query(
      `SELECT
        id,
        amount,
        billing_month,
        due_date,
        paid_date,
        status,
        payment_method,
        transaction_id,
        razorpay_order_id,
        payment_type,
        penalty_amount,
        created_at
      FROM payments
      WHERE resident_id = ?
      ORDER BY
        CASE
          WHEN status = 'Pending' THEN 0
          ELSE 1
        END,
        CASE WHEN status = 'Pending' THEN due_date END ASC,
        due_date DESC
      LIMIT 1`,
      [residentId]
    );

    if (payments.length === 0) {
      return res.status(200).json({
        payment: null,
      });
    }

    res.status(200).json({
      payment: payments[0],
    });

  } catch (error) {
    console.error("Get Current Payment Error:", error);

    res.status(500).json({
      message: "Unable to fetch current payment",
    });
  }
};


// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

const createPaymentOrder = async (req, res) => {
  try {
    const residentId = req.user.id;
    await syncMaintenanceDues();

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        message: "Online payments are not configured",
      });
    }

    // --------------------------------------
    // Get pending payment of logged-in resident
    // --------------------------------------

    const [payments] = await pool.query(
      `SELECT
        id,
        amount,
        billing_month,
        due_date,
        status,
        razorpay_order_id
      FROM payments
      WHERE id = ?
      AND resident_id = ?
      LIMIT 1`,
      [req.body.paymentId, residentId]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    const payment = payments[0];

    // --------------------------------------
    // Already paid check
    // --------------------------------------

    if (payment.status !== "Pending") {
      return res.status(400).json({
        message: "This payment is no longer available for checkout",
      });
    }

    // --------------------------------------
    // Amount validation
    // --------------------------------------

    const amount = Number(payment.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Invalid payment amount",
      });
    }

    // Razorpay amount is in paise
    const amountInPaise = Math.round(amount * 100);

    if (payment.razorpay_order_id) {
      const existingOrder = await razorpay.orders.fetch(payment.razorpay_order_id);
      if (Number(existingOrder.amount) !== amountInPaise || existingOrder.status === "paid") {
        return res.status(409).json({
          message: "This payment order is no longer available. Please refresh and try again.",
        });
      }

      return res.status(200).json({
        message: "Payment order is ready",
        order: {
          id: existingOrder.id,
          amount: existingOrder.amount,
          currency: existingOrder.currency,
        },
        payment: {
          id: payment.id,
          amount: payment.amount,
          billing_month: payment.billing_month,
        },
        key: process.env.RAZORPAY_KEY_ID,
      });
    }

    // --------------------------------------
    // Create Razorpay order
    // --------------------------------------

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",

      receipt: `payment_${payment.id}_${residentId}`,

      notes: {
        payment_id: String(payment.id),
        resident_id: String(residentId),
        billing_month: payment.billing_month,
      },
    });

    // --------------------------------------
    // Save Razorpay order ID in database
    // --------------------------------------

    const [updateResult] = await pool.query(
      `UPDATE payments
       SET razorpay_order_id = ?
       WHERE id = ?
       AND resident_id = ?
       AND status = 'Pending'
       AND razorpay_order_id IS NULL`,
      [
        order.id,
        payment.id,
        residentId,
      ]
    );

    if (!updateResult.affectedRows) {
      const [currentPayments] = await pool.query(
        `SELECT razorpay_order_id, status
         FROM payments
         WHERE id = ? AND resident_id = ?
         LIMIT 1`,
        [payment.id, residentId]
      );

      if (
        currentPayments[0]?.status === "Pending" &&
        currentPayments[0]?.razorpay_order_id
      ) {
        const existingOrder = await razorpay.orders.fetch(currentPayments[0].razorpay_order_id);
        if (Number(existingOrder.amount) === amountInPaise && existingOrder.status !== "paid") {
          return res.status(200).json({
            message: "Payment order is ready",
            order: {
              id: existingOrder.id,
              amount: existingOrder.amount,
              currency: existingOrder.currency,
            },
            payment: {
              id: payment.id,
              amount: payment.amount,
              billing_month: payment.billing_month,
            },
            key: process.env.RAZORPAY_KEY_ID,
          });
        }
      }

      return res.status(409).json({
        message: "This payment changed and is no longer available for checkout",
      });
    }

    res.status(200).json({
      message: "Payment order created successfully",

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },

      payment: {
        id: payment.id,
        amount: payment.amount,
        billing_month: payment.billing_month,
      },

      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    const razorpayError = error.error || {};
    const authenticationFailed =
      error.statusCode === 401 ||
      razorpayError.description === "Authentication failed";
    const message = authenticationFailed
      ? "Razorpay authentication failed. Check that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env are a matching pair from Razorpay Test Mode, then restart the backend."
      : "Unable to create payment order. Check the backend logs and try again.";

    console.error("Create Payment Order Error:", {
      statusCode: error.statusCode || null,
      code: razorpayError.code || error.code || null,
      description: razorpayError.description || error.message || "Unknown error",
    });

    res.status(authenticationFailed ? 502 : 500).json({
      message,
    });
  }
};


// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

const verifyPayment = async (req, res) => {
  try {
    const residentId = req.user.id;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    const payment_id = req.body.payment_id ?? req.body.paymentId;

    // --------------------------------------
    // Validate request
    // --------------------------------------

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !payment_id
    ) {
      return res.status(400).json({
        message: "Incomplete payment verification data",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        message: "Online payments are not configured",
      });
    }

    // --------------------------------------
    // Find payment
    // --------------------------------------

    const [payments] = await pool.query(
      `SELECT
        id,
        amount,
        billing_month,
        status,
        razorpay_order_id
      FROM payments
      WHERE id = ?
      AND resident_id = ?
      LIMIT 1`,
      [
        payment_id,
        residentId,
      ]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    const payment = payments[0];

    if (payment.status !== "Pending") {
      return res.status(409).json({
        message: "This payment is no longer pending",
      });
    }

    // --------------------------------------
    // Check order ID
    // --------------------------------------

    if (
      !payment.razorpay_order_id ||
      payment.razorpay_order_id !== razorpay_order_id
    ) {
      return res.status(400).json({
        message: "Invalid Razorpay order",
      });
    }

    // --------------------------------------
    // Generate signature
    // --------------------------------------

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    // --------------------------------------
    // Compare signature
    // --------------------------------------

    if (
      generatedSignature !== razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment signature verification failed",
      });
    }

    // --------------------------------------
    // Fetch Razorpay payment details
    // --------------------------------------

    let razorpayPayment =
      await razorpay.payments.fetch(
        razorpay_payment_id
      );

    if (razorpayPayment.order_id !== razorpay_order_id) {
      return res.status(400).json({
        message: "Payment does not belong to this order",
      });
    }

    // --------------------------------------
    // Verify amount
    // --------------------------------------

    const expectedAmount =
      Math.round(Number(payment.amount) * 100);

    if (
      Number(razorpayPayment.amount) !== expectedAmount ||
      razorpayPayment.currency !== "INR"
    ) {
      return res.status(400).json({
        message: "Payment amount verification failed",
      });
    }

    // --------------------------------------
    // Verify payment status
    // --------------------------------------

    if (razorpayPayment.status === "authorized") {
      razorpayPayment = await razorpay.payments.capture(
        razorpay_payment_id,
        expectedAmount,
        "INR"
      );
    }

    if (razorpayPayment.status !== "captured") {
      return res.status(400).json({
        message: "Payment was not successfully captured",
      });
    }

    // --------------------------------------
    // Update payment record
    // --------------------------------------

    const [updateResult] = await pool.query(
      `UPDATE payments
       SET
        status = 'Paid',
        paid_date = NOW(),
        payment_method = ?,
        transaction_id = ?
       WHERE id = ?
       AND resident_id = ?
       AND status = 'Pending'
       AND razorpay_order_id = ?`,
      [
        razorpayPayment.method || "Razorpay",
        razorpay_payment_id,
        payment_id,
        residentId,
        razorpay_order_id,
      ]
    );

    if (!updateResult.affectedRows) {
      return res.status(409).json({
        message: "Payment status changed before verification completed",
      });
    }

    // --------------------------------------
    // Success response
    // --------------------------------------

    res.status(200).json({
      message: "Payment successful",

      payment: {
        id: payment.id,
        amount: payment.amount,
        billing_month: payment.billing_month,
        status: "Paid",
        paid_date: new Date(),
        payment_method:
          razorpayPayment.method || "Razorpay",
        transaction_id:
          razorpay_payment_id,
      },
    });

  } catch (error) {
    console.error("Verify Payment Error:", error);

    res.status(500).json({
      message: "Payment verification failed",
    });
  }
};


module.exports = {
  getMyPayments,
  getCurrentPayment,
  createPaymentOrder,
  verifyPayment,
};