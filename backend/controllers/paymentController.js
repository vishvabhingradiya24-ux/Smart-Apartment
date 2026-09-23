const crypto = require("crypto");
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
        created_at
      FROM payments
      WHERE resident_id = ?
      ORDER BY due_date DESC`,
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
        created_at
      FROM payments
      WHERE resident_id = ?
      ORDER BY
        CASE
          WHEN status = 'Pending' THEN 0
          ELSE 1
        END,
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

    // --------------------------------------
    // Get pending payment of logged-in resident
    // --------------------------------------

    const [payments] = await pool.query(
      `SELECT
        id,
        amount,
        billing_month,
        due_date,
        status
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

    if (payment.status === "Paid") {
      return res.status(400).json({
        message: "This payment has already been paid",
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

    await pool.query(
      `UPDATE payments
       SET razorpay_order_id = ?
       WHERE id = ?
       AND resident_id = ?`,
      [
        order.id,
        payment.id,
        residentId,
      ]
    );

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
    console.error("Create Payment Order Error:", error);

    res.status(500).json({
      message: "Unable to create payment order",
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
      payment_id,
    } = req.body;

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

    const razorpayPayment =
      await razorpay.payments.fetch(
        razorpay_payment_id
      );

    // --------------------------------------
    // Verify amount
    // --------------------------------------

    const expectedAmount =
      Math.round(Number(payment.amount) * 100);

    if (
      Number(razorpayPayment.amount) !==
      expectedAmount
    ) {
      return res.status(400).json({
        message: "Payment amount verification failed",
      });
    }

    // --------------------------------------
    // Verify payment status
    // --------------------------------------

    if (
      razorpayPayment.status !== "captured" &&
      razorpayPayment.status !== "authorized"
    ) {
      return res.status(400).json({
        message: "Payment was not successfully captured",
      });
    }

    // --------------------------------------
    // Update payment record
    // --------------------------------------

    await pool.query(
      `UPDATE payments
       SET
        status = 'Paid',
        paid_date = NOW(),
        payment_method = ?,
        transaction_id = ?
       WHERE id = ?
       AND resident_id = ?`,
      [
        razorpayPayment.method || "Razorpay",
        razorpay_payment_id,
        payment_id,
        residentId,
      ]
    );

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