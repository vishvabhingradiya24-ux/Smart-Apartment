import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/payment.css";

function Payment() {
  const [payments, setPayments] = useState([]);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const [allResponse, currentResponse] = await Promise.all([
        fetch("http://localhost:5000/api/resident/payments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("http://localhost:5000/api/resident/payments/current", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (allResponse.status === 401 || currentResponse.status === 401) {
        throw new Error("SESSION_EXPIRED");
      }

      if (!allResponse.ok || !currentResponse.ok) {
        throw new Error("Unable to load payment information");
      }

      const allData = await allResponse.json();
      const currentData = await currentResponse.json();

      setPayments(allData.payments || []);
      setCurrentPayment(currentData.payment || null);
    } catch (err) {
      console.error(err);

      if (err.message === "SESSION_EXPIRED") {
        setError("Your session has expired. Please login again.");
      } else {
        setError("Unable to load payment information.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Your session has expired. Please login again.");
      setLoading(false);
      return;
    }

    loadPayments();
  }, []);

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!currentPayment) return;

    try {
      setPaying(true);
      setError("");

      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error("Unable to load payment gateway");
      }

      const orderResponse = await fetch(
        "http://localhost:5000/api/resident/payments/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentId: currentPayment.id,
          }),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Unable to create payment");
      }

      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Smart Apartment",
        description: `Maintenance - ${currentPayment.billing_month}`,
        order_id: orderData.order.id,

        theme: {
          color: "#2563eb",
        },

        handler: async function (response) {
          try {
            const verifyResponse = await fetch(
              "http://localhost:5000/api/resident/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  paymentId: currentPayment.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed"
              );
            }

            await loadPayments();
          } catch (err) {
            console.error(err);
            setError(err.message);
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error(response.error);
        setError(
          response.error?.description || "Payment failed. Please try again."
        );
        setPaying(false);
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      setError(err.message || "Payment could not be started.");
      setPaying(false);
    }
  };

  const totalPaid = payments
    .filter((item) => item.status === "Paid")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const paidCount = payments.filter(
    (item) => item.status === "Paid"
  ).length;

  const pendingCount = payments.filter(
    (item) => item.status === "Pending"
  ).length;

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-loading">
          <div className="payment-spinner"></div>
          <h3>Loading payments...</h3>
          <p>Please wait while we fetch your payment information.</p>
        </div>
      </div>
    );
  }

  if (error && error.includes("session")) {
    return (
      <div className="payment-page">
        <div className="payment-error-card">
          <div className="error-icon">!</div>

          <h2>Session Expired</h2>

          <p>{error}</p>

          <Link to="/login" className="login-again-btn">
            Login Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">

      {/* TOP HEADER */}
      <header className="payment-header">

        <div>
          <span className="payment-overline">
            RESIDENT SPACE
          </span>

          <h1>Payments & Maintenance</h1>

          <p>
            Manage your maintenance dues and payment history
            from one place.
          </p>
        </div>

        <Link to="/resident" className="back-dashboard">
          ← Dashboard
        </Link>

      </header>


      {/* ERROR */}
      {error && (
        <div className="payment-alert">
          <span>!</span>
          {error}
        </div>
      )}


      {/* SUMMARY */}
      <section className="payment-summary">

        <div className="summary-card">

          <div className="summary-icon blue">
            ₹
          </div>

          <div>
            <span>Total Paid</span>
            <strong>{formatAmount(totalPaid)}</strong>
          </div>

        </div>


        <div className="summary-card">

          <div className="summary-icon green">
            ✓
          </div>

          <div>
            <span>Paid Bills</span>
            <strong>{paidCount}</strong>
          </div>

        </div>


        <div className="summary-card">

          <div className="summary-icon orange">
            !
          </div>

          <div>
            <span>Pending Bills</span>
            <strong>{pendingCount}</strong>
          </div>

        </div>

      </section>


      {/* CURRENT BILL */}
      <section className="current-payment-section">

        <div className="section-title">

          <div>
            <span>MAINTENANCE</span>
            <h2>Current Payment</h2>
          </div>

          <div className="secure-label">
            🔒 Secure Payment
          </div>

        </div>


        {currentPayment ? (

          <div className="current-payment-card">

            <div className="bill-left">

              <div className="bill-icon">
                ₹
              </div>

              <div>

                <span className="bill-label">
                  MAINTENANCE BILL
                </span>

                <h3>
                  {currentPayment.billing_month}
                </h3>

                <p>
                  Apartment maintenance charge
                </p>

              </div>

            </div>


            <div className="bill-middle">

              <div>
                <span>AMOUNT</span>
                <strong>
                  {formatAmount(currentPayment.amount)}
                </strong>
              </div>

              <div>
                <span>DUE DATE</span>
                <strong>
                  {formatDate(currentPayment.due_date)}
                </strong>
              </div>

            </div>


            <div className="bill-right">

              <span
                className={
                  currentPayment.status === "Paid"
                    ? "status paid"
                    : "status pending"
                }
              >
                {currentPayment.status}
              </span>

              {currentPayment.status === "Pending" ? (
                <button
                  className="pay-now-btn"
                  onClick={handlePayment}
                  disabled={paying}
                >
                  {paying ? "Processing..." : "Pay Now →"}
                </button>
              ) : (
                <div className="paid-message">
                  ✓ Payment Completed
                </div>
              )}

            </div>

          </div>

        ) : (

          <div className="no-current-payment">

            <div className="empty-payment-icon">
              ₹
            </div>

            <h3>No Current Payment</h3>

            <p>
              You don't have any maintenance payment due right now.
            </p>

          </div>

        )}

      </section>


      {/* PAYMENT HISTORY */}
      <section className="history-section">

        <div className="section-title">

          <div>
            <span>TRANSACTIONS</span>
            <h2>Payment History</h2>
          </div>

          <span className="history-count">
            {payments.length} Records
          </span>

        </div>


        {payments.length > 0 ? (

          <div className="history-card">

            <div className="history-header">
              <span>Billing Month</span>
              <span>Amount</span>
              <span>Due Date</span>
              <span>Paid Date</span>
              <span>Method</span>
              <span>Status</span>
            </div>


            {payments.map((payment) => (

              <div
                className="history-row"
                key={payment.id}
              >

                <div className="month-cell">
                  <div className="month-icon">
                    ₹
                  </div>

                  <strong>
                    {payment.billing_month}
                  </strong>
                </div>


                <div className="amount-cell">
                  {formatAmount(payment.amount)}
                </div>


                <div>
                  {formatDate(payment.due_date)}
                </div>


                <div>
                  {formatDate(payment.paid_date)}
                </div>


                <div className="method-cell">
                  {payment.payment_method || "—"}
                </div>


                <div>
                  <span
                    className={
                      payment.status === "Paid"
                        ? "status paid"
                        : "status pending"
                    }
                  >
                    {payment.status}
                  </span>
                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="history-empty">

            <div className="history-empty-icon">
              ▣
            </div>

            <h3>No Payment History</h3>

            <p>
              Your payment transactions will appear here once
              a maintenance bill is created.
            </p>

          </div>

        )}

      </section>


      {/* SECURITY */}
      <section className="payment-security">

        <div className="security-icon">
          🔒
        </div>

        <div>
          <strong>Secure & Protected Payments</strong>

          <p>
            Payments are securely processed through Razorpay.
            Your card, UPI and banking information is handled
            by the payment gateway.
          </p>
        </div>

      </section>

    </div>
  );
}

export default Payment;