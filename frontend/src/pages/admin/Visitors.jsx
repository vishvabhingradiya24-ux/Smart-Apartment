import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Clock3, DoorOpen, Search, UsersRound } from "lucide-react";
import "../../css/visitors.css";

const formatDateTime = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
const dateValue = (value) => value ? (value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10)) : "";
const timeValue = (value) => value ? String(value).slice(0, 5) : "";

const Visitors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = sessionStorage.getItem("token");

  const request = useCallback((url) => fetch(`http://localhost:5000${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  const loadData = useCallback(async () => {
    try {
      const response = await request("/api/admin/visitors");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Visitors could not be loaded");
      setVisitors(data.visitors || []);
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
      <div><p className="visitors-overline">SECURITY & VISITOR MANAGEMENT</p><h1>Visitors Management</h1><p className="visitors-subtitle">View visitor records and gate entry/exit history.</p></div>
    </div>

    <div className="visitor-stats-grid">
      <div className="visitor-stat-card"><div className="visitor-stat-icon blue"><UsersRound size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><p>Total Visitors</p><h2>{visitors.length}</h2><span>Database records</span></div></div>
      <div className="visitor-stat-card"><div className="visitor-stat-icon green"><Check size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><p>Approved</p><h2>{approved}</h2><span>Approved visitors</span></div></div>
      <div className="visitor-stat-card"><div className="visitor-stat-icon orange"><Clock3 size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><p>Pending Verification</p><h2>{pending}</h2><span>Awaiting approval</span></div></div>
      <div className="visitor-stat-card"><div className="visitor-stat-icon purple"><DoorOpen size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><p>Currently Inside</p><h2>{inside}</h2><span>Entry recorded, exit pending</span></div></div>
    </div>

    <section className="visitors-section">
      <div className="visitors-section-header"><div><h2>Visitor Records</h2><p>Visitor details, resident, purpose and gate timestamps.</p></div><span className="record-count">{filteredVisitors.length} Records</span></div>
      <div className="visitors-toolbar">
        <div className="visitor-search"><Search size={16} aria-hidden="true" /><input placeholder="Search visitor, resident, flat or purpose..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div>
        <select className="visitor-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Completed</option></select>
      </div>
      {error && <p className="page-error" role="alert">{error}</p>}
      <div className="visitors-table-wrapper"><table className="visitors-table">
        <thead><tr><th>Visitor</th><th>Contact</th><th>Resident / Flat</th><th>Purpose</th><th>Expected</th><th>Entry</th><th>Exit</th><th>Status</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan="8">Loading visitors…</td></tr> : filteredVisitors.length ? filteredVisitors.map((visitor) => {
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
          </tr>;
        }) : <tr><td colSpan="8" className="no-visitor-data">{error ? "Visitor records could not be loaded." : "No visitors found."}</td></tr>}</tbody>
      </table></div>
    </section>
  </div>;
};

export default Visitors;
