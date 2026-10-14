import { useCallback, useEffect, useMemo, useState } from "react";
import "../../css/visitors.css";

const blankForm = { resident_id: "", visitor_name: "", contact_number: "", purpose: "", visit_date: "", expected_time: "" };
const formatDateTime = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
const dateValue = (value) => value ? (value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10)) : "";
const timeValue = (value) => value ? String(value).slice(0, 5) : "";

const Visitors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visitors, setVisitors] = useState([]);
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState(blankForm);
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
      const [visitorResponse, residentResponse] = await Promise.all([
        request("/api/admin/visitors"),
        request("/api/admin/visitors/residents"),
      ]);
      const [visitorData, residentData] = await Promise.all([visitorResponse.json(), residentResponse.json()]);
      if (!visitorResponse.ok) throw new Error(visitorData.message || "Visitors could not be loaded");
      if (!residentResponse.ok) throw new Error(residentData.message || "Residents could not be loaded");
      setVisitors(visitorData.visitors || []);
      setResidents(residentData.residents || []);
      setError("");
    } catch (err) {
      setError(err.message || "Visitors could not be loaded");
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
    setForm({ ...blankForm });
    setShowForm(true);
    setError("");
  };

  const openEdit = (visitor) => {
    setEditingId(visitor.visitor_id);
    setForm({
      resident_id: String(visitor.resident_id),
      visitor_name: visitor.visitor_name || "",
      contact_number: visitor.contact_number || "",
      purpose: visitor.purpose || "",
      visit_date: dateValue(visitor.visit_date),
      expected_time: timeValue(visitor.expected_time),
    });
    setShowForm(true);
    setError("");
  };

  const saveVisitor = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await request(
        editingId ? `/api/admin/visitors/${editingId}` : "/api/admin/visitors",
        { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Visitor record could not be saved");
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Visitor record could not be saved");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (visitor, status) => {
    setError("");
    try {
      const response = await request(`/api/admin/visitors/${visitor.visitor_id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Visitor status could not be updated");
      await loadData();
    } catch (err) {
      setError(err.message || "Visitor status could not be updated");
    }
  };

  const updateGate = async (visitor, action) => {
    setError("");
    try {
      const response = await request(`/api/admin/visitors/${visitor.visitor_id}/gate`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Visitor gate record could not be updated");
      await loadData();
    } catch (err) {
      setError(err.message || "Visitor gate record could not be updated");
    }
  };

  const filteredVisitors = useMemo(() => visitors.filter((visitor) => {
    const search = searchTerm.toLowerCase();
    const residentName = [visitor.resident_first_name, visitor.resident_last_name].filter(Boolean).join(" ");
    const flat = [visitor.block_wing, visitor.flat_number].filter(Boolean).join("-");
    const matches = [
      visitor.visitor_id,
      visitor.visitor_name,
      visitor.contact_number,
      flat,
      residentName,
      visitor.purpose,
    ].some((value) => String(value || "").toLowerCase().includes(search));
    return matches && (statusFilter === "All" || visitor.status === statusFilter);
  }), [visitors, searchTerm, statusFilter]);

  const approved = visitors.filter((visitor) => visitor.status === "Approved").length;
  const pending = visitors.filter((visitor) => visitor.status === "Pending").length;
  const inside = visitors.filter((visitor) => visitor.entry_time && !visitor.exit_time).length;

  return <div className="visitors-page">
    <div className="visitors-header">
      <div><p className="visitors-overline">SECURITY & VISITOR MANAGEMENT</p><h1>Visitors Management</h1><p className="visitors-subtitle">Create visitor records, review requests and update gate entry/exit.</p></div>
      <button className="visitor-add-btn" type="button" onClick={openCreate}>＋ Add Visitor</button>
    </div>

    <div className="visitor-stats-grid">
      <div className="visitor-stat-card"><div className="visitor-stat-icon blue">👥</div><div><p>Total Visitors</p><h2>{visitors.length}</h2><span>Database records</span></div></div>
      <div className="visitor-stat-card"><div className="visitor-stat-icon green">✓</div><div><p>Approved</p><h2>{approved}</h2><span>Approved visitors</span></div></div>
      <div className="visitor-stat-card"><div className="visitor-stat-icon orange">⏳</div><div><p>Pending Verification</p><h2>{pending}</h2><span>Awaiting approval</span></div></div>
      <div className="visitor-stat-card"><div className="visitor-stat-icon purple">🚪</div><div><p>Currently Inside</p><h2>{inside}</h2><span>Entry recorded, exit pending</span></div></div>
    </div>

    {showForm && <form className="admin-data-form" onSubmit={saveVisitor}>
      <h2>{editingId ? "Edit Pending Visitor" : "Add Visitor"}</h2>
      <div className="admin-data-form-grid">
        <label>Resident
          <select required value={form.resident_id} onChange={(event) => setForm({ ...form, resident_id: event.target.value })}>
            <option value="">Select resident</option>
            {residents.map((resident) => <option key={resident.id} value={resident.id}>
              {resident.first_name} {resident.last_name} · {[resident.block_wing, resident.flat_number].filter(Boolean).join("-") || "Flat not assigned"}
            </option>)}
          </select>
        </label>
        <label>Visitor name<input required maxLength="150" value={form.visitor_name} onChange={(event) => setForm({ ...form, visitor_name: event.target.value })} /></label>
        <label>Contact number<input required maxLength="30" value={form.contact_number} onChange={(event) => setForm({ ...form, contact_number: event.target.value })} /></label>
        <label>Purpose<input required maxLength="255" value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} /></label>
        <label>Visit date<input required type="date" value={form.visit_date} onChange={(event) => setForm({ ...form, visit_date: event.target.value })} /></label>
        <label>Expected time<input required type="time" value={form.expected_time} onChange={(event) => setForm({ ...form, expected_time: event.target.value })} /></label>
      </div>
      <div className="admin-data-form-actions">
        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
        <button type="submit" disabled={saving || residents.length === 0}>{saving ? "Saving…" : "Save Visitor"}</button>
      </div>
    </form>}

    <section className="visitors-section">
      <div className="visitors-section-header"><div><h2>Visitor Records</h2><p>Review visitor contact, resident, purpose and gate timestamps.</p></div><span className="record-count">{filteredVisitors.length} Records</span></div>
      <div className="visitors-toolbar">
        <div className="visitor-search"><span>🔍</span><input placeholder="Search visitor, resident, flat or purpose..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div>
        <select className="visitor-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Completed</option></select>
      </div>
      {error && <p className="page-error" role="alert">{error}</p>}
      <div className="visitors-table-wrapper"><table className="visitors-table">
        <thead><tr><th>Visitor</th><th>Contact</th><th>Resident / Flat</th><th>Purpose</th><th>Expected</th><th>Entry</th><th>Exit</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan="9">Loading visitors…</td></tr> : filteredVisitors.length ? filteredVisitors.map((visitor) => {
          const residentName = [visitor.resident_first_name, visitor.resident_last_name].filter(Boolean).join(" ") || "Resident";
          return <tr key={visitor.visitor_id}>
            <td><strong>{visitor.visitor_name || "Visitor"}</strong><small>VIS{visitor.visitor_id}</small></td>
            <td>{visitor.contact_number || "—"}</td>
            <td><div className="resident-flat"><strong>{residentName}</strong><span>{[visitor.block_wing, visitor.flat_number].filter(Boolean).join("-") || "—"}</span></div></td>
            <td>{visitor.purpose || "—"}</td>
            <td>{formatDateTime(visitor.visit_date && visitor.expected_time ? `${dateValue(visitor.visit_date)}T${timeValue(visitor.expected_time)}` : null)}</td>
            <td>{formatDateTime(visitor.entry_time)}</td>
            <td>{formatDateTime(visitor.exit_time)}</td>
            <td><span className={`approval-status approval-${String(visitor.status || "").toLowerCase()}`}>{visitor.status}</span></td>
            <td><div className="visitor-row-actions">
              {visitor.status === "Pending" && !visitor.entry_time && <>
                <button type="button" onClick={() => openEdit(visitor)}>Edit</button>
                <button type="button" onClick={() => updateStatus(visitor, "Approved")}>Approve</button>
                <button type="button" onClick={() => updateStatus(visitor, "Rejected")}>Reject</button>
              </>}
              {visitor.status === "Approved" && !visitor.entry_time && <button type="button" onClick={() => updateGate(visitor, "entry")}>Check in</button>}
              {visitor.status === "Approved" && visitor.entry_time && !visitor.exit_time && <button type="button" onClick={() => updateGate(visitor, "exit")}>Check out</button>}
            </div></td>
          </tr>;
        }) : <tr><td colSpan="9" className="no-visitor-data">{error ? "Visitor records could not be loaded." : "No visitors found."}</td></tr>}</tbody>
      </table></div>
    </section>
  </div>;
};

export default Visitors;
