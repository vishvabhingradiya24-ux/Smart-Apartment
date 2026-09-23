import { useState } from "react";
import "../../css/payments.css";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Temporary demo data
  // Backend + MySQL integration will be added later.
  const payments = [
    {
      paymentId: "PAY1001",
      residentId: "RES201",
      residentName: "Radhe Patel",
      flatNumber: "A-101",
      maintenanceId: "901",
      amount: 2500,
      paymentDate: "20 Sep 2026",
      transactionId: "TXN202609201234",
      status: "Success",
    },
    {
      paymentId: "PAY1002",
      residentId: "RES202",
      residentName: "Neha Shah",
      flatNumber: "A-204",
      maintenanceId: "902",
      amount: 2500,
      paymentDate: "19 Sep 2026",
      transactionId: "TXN202609191456",
      status: "Success",
    },
    {
      paymentId: "PAY1003",
      residentId: "RES203",
      residentName: "Amit Joshi",
      flatNumber: "B-102",
      maintenanceId: "903",
      amount: 3000,
      paymentDate: "-",
      transactionId: "-",
      status: "Pending",
    },
    {
      paymentId: "PAY1004",
      residentId: "RES204",
      residentName: "Pooja Mehta",
      flatNumber: "B-305",
      maintenanceId: "904",
      amount: 2500,
      paymentDate: "18 Sep 2026",
      transactionId: "TXN202609181789",
      status: "Success",
    },
    {
      paymentId: "PAY1005",
      residentId: "RES205",
      residentName: "Karan Desai",
      flatNumber: "C-201",
      maintenanceId: "905",
      amount: 2800,
      paymentDate: "-",
      transactionId: "-",
      status: "Pending",
    },
    {
      paymentId: "PAY1006",
      residentId: "RES206",
      residentName: "Riya Patel",
      flatNumber: "C-402",
      maintenanceId: "906",
      amount: 2500,
      paymentDate: "16 Sep 2026",
      transactionId: "TXN202609161923",
      status: "Success",
    },
  ];

  const filteredPayments = payments.filter((payment) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      payment.paymentId.toLowerCase().includes(search) ||
      payment.residentId.toLowerCase().includes(search) ||
      payment.residentName.toLowerCase().includes(search) ||
      payment.flatNumber.toLowerCase().includes(search) ||
      payment.transactionId.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPayments = payments.length;

  const successfulPayments = payments.filter(
    (payment) => payment.status === "Success"
  );

  const pendingPayments = payments.filter(
    (payment) => payment.status === "Pending"
  );

  const totalCollected = successfulPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const pendingAmount = pendingPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const handleView = (payment) => {
    alert(
      `Payment Details\n\nPayment ID: ${payment.paymentId}\nResident: ${payment.residentName}\nFlat: ${payment.flatNumber}\nAmount: ₹${payment.amount}\nStatus: ${payment.status}\nTransaction ID: ${payment.transactionId}`
    );
  };

  const handleReceipt = (payment) => {
    if (payment.status !== "Success") {
      alert("Receipt is available only for successful payments.");
      return;
    }

    alert(`Receipt generated for ${payment.paymentId}`);
  };

  return (
    <div className="payments-page">
      {/* Header */}
      <div className="payments-header">
        <div>
          <p className="payments-overline">FINANCIAL MANAGEMENT</p>
          <h1>Payments Management</h1>
          <p className="payments-subtitle">
            Monitor resident maintenance payments and transaction records.
          </p>
        </div>

        <button
          className="payments-report-btn"
          onClick={() => alert("Payment report generation will be connected later.")}
        >
          📊 Generate Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="payment-stats-grid">
        <div className="payment-stat-card">
          <div className="payment-stat-icon blue">💳</div>
          <div>
            <p>Total Payments</p>
            <h2>{totalPayments}</h2>
            <span>All payment records</span>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon green">✓</div>
          <div>
            <p>Successful</p>
            <h2>{successfulPayments.length}</h2>
            <span>Completed payments</span>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon orange">⏳</div>
          <div>
            <p>Pending</p>
            <h2>{pendingPayments.length}</h2>
            <span>Awaiting payment</span>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon purple">₹</div>
          <div>
            <p>Total Collected</p>
            <h2>₹{totalCollected.toLocaleString("en-IN")}</h2>
            <span>Successful payments</span>
          </div>
        </div>
      </div>

      {/* Collection Overview */}
      <div className="payment-overview">
        <div className="payment-overview-card">
          <div className="overview-icon">💰</div>
          <div>
            <p>Collected Amount</p>
            <h3>₹{totalCollected.toLocaleString("en-IN")}</h3>
          </div>
        </div>

        <div className="payment-overview-card">
          <div className="overview-icon pending-icon">⏰</div>
          <div>
            <p>Pending Amount</p>
            <h3>₹{pendingAmount.toLocaleString("en-IN")}</h3>
          </div>
        </div>

        <div className="payment-overview-card">
          <div className="overview-icon receipt-icon">🧾</div>
          <div>
            <p>Transactions</p>
            <h3>{successfulPayments.length}</h3>
          </div>
        </div>
      </div>

      {/* Payment Records */}
      <section className="payments-section">
        <div className="payments-section-header">
          <div>
            <h2>Payment Records</h2>
            <p>
              View resident payment information, transaction details and
              payment status.
            </p>
          </div>

          <span className="record-count">
            {filteredPayments.length} Records
          </span>
        </div>

        {/* Search + Filters */}
        <div className="payments-toolbar">
          <div className="payment-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search payment, resident, flat or transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="payment-filter">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Resident</th>
                <th>Flat</th>
                <th>Maintenance ID</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Transaction ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.paymentId}>
                    <td>
                      <strong className="payment-id">
                        {payment.paymentId}
                      </strong>
                    </td>

                    <td>
                      <div className="resident-payment-info">
                        <div className="resident-payment-avatar">
                          {payment.residentName.charAt(0)}
                        </div>

                        <div>
                          <strong>{payment.residentName}</strong>
                          <small>{payment.residentId}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="flat-badge">{payment.flatNumber}</span>
                    </td>

                    <td>{payment.maintenanceId}</td>

                    <td>
                      <strong className="payment-amount">
                        ₹{payment.amount.toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>{payment.paymentDate}</td>

                    <td>
                      <span className="transaction-id">
                        {payment.transactionId}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`payment-status ${
                          payment.status === "Success"
                            ? "status-success"
                            : "status-pending"
                        }`}
                      >
                        {payment.status === "Success" ? "✓" : "⏳"}{" "}
                        {payment.status}
                      </span>
                    </td>

                    <td>
                      <div className="payment-actions">
                        <button
                          className="payment-action view"
                          onClick={() => handleView(payment)}
                          title="View Payment"
                        >
                          👁️
                        </button>

                        <button
                          className="payment-action receipt"
                          onClick={() => handleReceipt(payment)}
                          title="View Receipt"
                        >
                          🧾
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-payment-data">
                    <div>
                      <span>🔎</span>
                      <h3>No payments found</h3>
                      <p>Try changing your search or filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment Information */}
      <section className="payment-info-card">
        <div className="payment-info-icon">ℹ️</div>

        <div>
          <h3>Payment Management</h3>
          <p>
            Admin can monitor resident maintenance payments, review completed
            and pending transactions, and maintain payment-related records.
            Payment information includes resident, flat, amount, date, status
            and transaction details.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Payments;