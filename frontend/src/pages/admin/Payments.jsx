import { useEffect, useMemo, useState } from "react";
import "../../css/payments.css";

const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/payments", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Payments load થઈ શક્યા નહીં");
        setPayments((data.payments || []).map((row) => ({
          paymentId: `PAY${row.payment_id}`,
          residentId: `RES${row.resident_id}`,
          residentName: [row.first_name, row.last_name].filter(Boolean).join(" ") || "Resident",
          flatNumber: [row.block_wing, row.flat_number].filter(Boolean).join("-") || "—",
          amount: Number(row.amount || 0),
          paymentDate: formatDate(row.paid_date || row.created_at),
          transactionId: row.transaction_id || "—",
          status: row.status === "Paid" ? "Success" : row.status || "Pending",
        })));
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => payments.filter((payment) => {
    const search = searchTerm.toLowerCase();
    const matches = [payment.paymentId, payment.residentId, payment.residentName, payment.flatNumber, payment.transactionId].some((value) => value.toLowerCase().includes(search));
    return matches && (statusFilter === "All" || payment.status === statusFilter);
  }), [payments, searchTerm, statusFilter]);
  const successful = payments.filter((payment) => payment.status === "Success");
  const pending = payments.filter((payment) => payment.status === "Pending");
  const totalCollected = successful.reduce((total, payment) => total + payment.amount, 0);
  const pendingAmount = pending.reduce((total, payment) => total + payment.amount, 0);

  return <div className="payments-page">
    <div className="payments-header"><div><p className="payments-overline">FINANCIAL MANAGEMENT</p><h1>Payments Management</h1><p className="payments-subtitle">MySQL માંથી resident payments અને transaction records.</p></div></div>
    <div className="payment-stats-grid">
      <div className="payment-stat-card"><div className="payment-stat-icon blue">💳</div><div><p>Total Payments</p><h2>{payments.length}</h2><span>Database records</span></div></div>
      <div className="payment-stat-card"><div className="payment-stat-icon green">✓</div><div><p>Successful</p><h2>{successful.length}</h2><span>Paid payments</span></div></div>
      <div className="payment-stat-card"><div className="payment-stat-icon orange">⏳</div><div><p>Pending</p><h2>{pending.length}</h2><span>Awaiting payment</span></div></div>
      <div className="payment-stat-card"><div className="payment-stat-icon purple">₹</div><div><p>Total Collected</p><h2>₹{totalCollected.toLocaleString("en-IN")}</h2><span>Successful payments</span></div></div>
    </div>
    <div className="payment-overview"><div className="payment-overview-card"><div className="overview-icon">💰</div><div><p>Collected Amount</p><h3>₹{totalCollected.toLocaleString("en-IN")}</h3></div></div><div className="payment-overview-card"><div className="overview-icon pending-icon">⏰</div><div><p>Pending Amount</p><h3>₹{pendingAmount.toLocaleString("en-IN")}</h3></div></div><div className="payment-overview-card"><div className="overview-icon receipt-icon">🧾</div><div><p>Transactions</p><h3>{successful.length}</h3></div></div></div>
    <section className="payments-section"><div className="payments-section-header"><div><h2>Payment Records</h2><p>Payment status, amounts, residents અને transaction IDs.</p></div><span className="record-count">{filteredPayments.length} Records</span></div>
      <div className="payments-toolbar"><div className="payment-search"><span>🔍</span><input placeholder="Search payment, resident, flat or transaction..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><div className="payment-filter"><label>Status</label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All</option><option>Success</option><option>Pending</option></select></div></div>
      {error && <p className="page-error" role="alert">{error}</p>}
      <div className="payments-table-wrapper"><table className="payments-table"><thead><tr><th>Payment ID</th><th>Resident</th><th>Flat</th><th>Amount</th><th>Payment Date</th><th>Transaction ID</th><th>Status</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="7">Loading payments…</td></tr> : filteredPayments.length ? filteredPayments.map((payment) => <tr key={payment.paymentId}><td><strong className="payment-id">{payment.paymentId}</strong></td><td><div className="resident-payment-info"><div className="resident-payment-avatar">{payment.residentName.charAt(0)}</div><div><strong>{payment.residentName}</strong><small>{payment.residentId}</small></div></div></td><td><span className="flat-badge">{payment.flatNumber}</span></td><td><strong className="payment-amount">₹{payment.amount.toLocaleString("en-IN")}</strong></td><td>{payment.paymentDate}</td><td><span className="transaction-id">{payment.transactionId}</span></td><td><span className={`payment-status ${payment.status === "Success" ? "status-success" : "status-pending"}`}>{payment.status === "Success" ? "✓" : "⏳"} {payment.status}</span></td></tr>) : <tr><td colSpan="7" className="no-payment-data">No payments found.</td></tr>}
      </tbody></table></div></section>
      <section className="payment-info-card"><div className="payment-info-icon">ℹ️</div><div><h3>Payment Management</h3><p>આ યાદી payments table અને સંબંધિત resident recordsમાંથી આવે છે.</p></div></section>
  </div>;
};

export default Payments;
