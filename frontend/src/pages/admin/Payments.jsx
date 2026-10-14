import { useCallback, useEffect, useMemo, useState } from "react";
import "../../css/payments.css";

const emptyForm = { resident_id: "", amount: "", billing_month: "", due_date: "" };
const dateInputValue = (value) => value ? (value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10)) : "";
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const request = useCallback((url, options = {}) => fetch(`http://localhost:5000${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  }), [token]);

  const loadData = useCallback(async () => {
    try {
      const [paymentResponse, residentResponse] = await Promise.all([
        request("/api/admin/payments"),
        request("/api/admin/payments/residents"),
      ]);
      const [paymentData, residentData] = await Promise.all([paymentResponse.json(), residentResponse.json()]);
      if (!paymentResponse.ok) throw new Error(paymentData.message || "Payments could not be loaded");
      if (!residentResponse.ok) throw new Error(residentData.message || "Residents could not be loaded");
      setPayments(paymentData.payments || []);
      setResidents(residentData.residents || []);
      setError("");
    } catch (err) {
      setError(err.message || "Payments could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    const load = async () => loadData();
    load();
  }, [loadData]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
    setError("");
  };

  const openEdit = (payment) => {
    setEditingId(payment.payment_id);
    setForm({
      resident_id: String(payment.resident_id),
      amount: String(payment.amount),
      billing_month: payment.billing_month || "",
      due_date: dateInputValue(payment.due_date),
    });
    setShowForm(true);
    setError("");
  };

  const savePayment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await request(
        editingId ? `/api/admin/payments/${editingId}` : "/api/admin/payments",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Payment could not be saved");
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Payment could not be saved");
    } finally {
      setSaving(false);
    }
  };

  const filteredPayments = useMemo(() => payments.filter((payment) => {
    const search = searchTerm.toLowerCase();
    const name = [payment.first_name, payment.last_name].filter(Boolean).join(" ");
    const flat = [payment.block_wing, payment.flat_number].filter(Boolean).join("-");
    const matches = [
      payment.payment_id,
      payment.resident_id,
      name,
      flat,
      payment.transaction_id,
      payment.billing_month,
    ].some((value) => String(value || "").toLowerCase().includes(search));
    const status = payment.status === "Paid" ? "Success" : payment.status || "Pending";
    return matches && (statusFilter === "All" || status === statusFilter);
  }), [payments, searchTerm, statusFilter]);

  const successful = payments.filter((payment) => payment.status === "Paid");
  const pending = payments.filter((payment) => payment.status === "Pending");
  const totalCollected = successful.reduce((total, payment) => total + Number(payment.amount || 0), 0);
  const pendingAmount = pending.reduce((total, payment) => total + Number(payment.amount || 0), 0);

  return <div className="payments-page">
    <div className="payments-header">
      <div>
        <p className="payments-overline">FINANCIAL MANAGEMENT</p>
        <h1>Payments Management</h1>
        <p className="payments-subtitle">Create resident dues and review database payment records.</p>
      </div>
      <button className="payments-report-btn" type="button" onClick={openCreate}>＋ Add Payment Due</button>
    </div>

    <div className="payment-stats-grid">
      <div className="payment-stat-card"><div className="payment-stat-icon blue">💳</div><div><p>Total Payments</p><h2>{payments.length}</h2><span>Database records</span></div></div>
      <div className="payment-stat-card"><div className="payment-stat-icon green">✓</div><div><p>Successful</p><h2>{successful.length}</h2><span>Paid payments</span></div></div>
      <div className="payment-stat-card"><div className="payment-stat-icon orange">⏳</div><div><p>Pending</p><h2>{pending.length}</h2><span>Awaiting payment</span></div></div>
      <div className="payment-stat-card"><div className="payment-stat-icon purple">₹</div><div><p>Total Collected</p><h2>₹{totalCollected.toLocaleString("en-IN")}</h2><span>Successful payments</span></div></div>
    </div>

    <div className="payment-overview">
      <div className="payment-overview-card"><div className="overview-icon">💰</div><div><p>Collected Amount</p><h3>₹{totalCollected.toLocaleString("en-IN")}</h3></div></div>
      <div className="payment-overview-card"><div className="overview-icon pending-icon">⏰</div><div><p>Pending Amount</p><h3>₹{pendingAmount.toLocaleString("en-IN")}</h3></div></div>
      <div className="payment-overview-card"><div className="overview-icon receipt-icon">🧾</div><div><p>Transactions</p><h3>{successful.length}</h3></div></div>
    </div>

    {showForm && <form className="admin-data-form" onSubmit={savePayment}>
      <h2>{editingId ? "Edit Pending Payment" : "Add Resident Payment Due"}</h2>
      <div className="admin-data-form-grid">
        <label>Resident
          <select required value={form.resident_id} disabled={Boolean(editingId)} onChange={(event) => setForm({ ...form, resident_id: event.target.value })}>
            <option value="">Select resident</option>
            {residents.map((resident) => <option key={resident.id} value={resident.id}>
              {resident.first_name} {resident.last_name} · {[resident.block_wing, resident.flat_number].filter(Boolean).join("-") || "Flat not assigned"}
            </option>)}
          </select>
        </label>
        <label>Amount (₹)<input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
        <label>Billing month<input required maxLength="40" placeholder="e.g. July 2026" value={form.billing_month} onChange={(event) => setForm({ ...form, billing_month: event.target.value })} /></label>
        <label>Due date<input required type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} /></label>
      </div>
      <div className="admin-data-form-actions">
        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
        <button type="submit" disabled={saving || (!editingId && residents.length === 0)}>{saving ? "Saving…" : "Save Payment"}</button>
      </div>
    </form>}

    <section className="payments-section">
      <div className="payments-section-header"><div><h2>Payment Records</h2><p>Payment status, amounts, residents and transaction IDs.</p></div><span className="record-count">{filteredPayments.length} Records</span></div>
      <div className="payments-toolbar">
        <div className="payment-search"><span>🔍</span><input placeholder="Search payment, resident, flat or transaction..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div>
        <div className="payment-filter"><label>Status</label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option><option>Success</option><option>Pending</option></select></div>
      </div>
      {error && <p className="page-error" role="alert">{error}</p>}
      <div className="payments-table-wrapper"><table className="payments-table">
        <thead><tr><th>Payment ID</th><th>Resident</th><th>Flat</th><th>Billing Month</th><th>Amount</th><th>Due / Paid</th><th>Transaction ID</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan="9">Loading payments…</td></tr> : filteredPayments.length ? filteredPayments.map((payment) => {
          const residentName = [payment.first_name, payment.last_name].filter(Boolean).join(" ") || "Resident";
          const status = payment.status === "Paid" ? "Success" : payment.status || "Pending";
          return <tr key={payment.payment_id}>
            <td><strong className="payment-id">PAY{payment.payment_id}</strong></td>
            <td><div className="resident-payment-info"><div className="resident-payment-avatar">{residentName.charAt(0)}</div><div><strong>{residentName}</strong><small>RES{payment.resident_id}</small></div></div></td>
            <td><span className="flat-badge">{[payment.block_wing, payment.flat_number].filter(Boolean).join("-") || "—"}</span></td>
            <td>{payment.billing_month || "—"}</td>
            <td><strong className="payment-amount">₹{Number(payment.amount || 0).toLocaleString("en-IN")}</strong></td>
            <td>{formatDate(payment.paid_date || payment.due_date || payment.created_at)}</td>
            <td><span className="transaction-id">{payment.transaction_id || "—"}</span></td>
            <td><span className={`payment-status ${status === "Success" ? "status-success" : "status-pending"}`}>{status === "Success" ? "✓" : "⏳"} {status}</span></td>
            <td>{payment.status === "Pending" && <button className="admin-row-action" type="button" onClick={() => openEdit(payment)}>Edit</button>}</td>
          </tr>;
        }) : <tr><td colSpan="9" className="no-payment-data">{error ? "Payment records could not be loaded." : "No payments found."}</td></tr>}</tbody>
      </table></div>
    </section>
    <section className="payment-info-card"><div className="payment-info-icon">ℹ️</div><div><h3>Payment Management</h3><p>Only pending payment dues can be edited. Paid status and transaction details are set by verified payment processing.</p></div></section>
  </div>;
};

export default Payments;
