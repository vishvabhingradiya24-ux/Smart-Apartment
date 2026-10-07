import { useEffect, useMemo, useState } from "react";
import "../../css/visitors.css";

const formatDateTime = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

const Visitors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVisitors = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/visitors", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Visitors load થઈ શક્યા નહીં");
        setVisitors((data.visitors || []).map((row) => ({
          visitorId: `VIS${row.visitor_id}`,
          visitorName: row.visitor_name || "Visitor",
          contact: row.contact_number || "—",
          flatNumber: [row.block_wing, row.flat_number].filter(Boolean).join("-") || "—",
          residentName: [row.resident_first_name, row.resident_last_name].filter(Boolean).join(" ") || "Resident",
          purpose: row.purpose || "—", approvalStatus: row.status || "Pending",
          entryTime: formatDateTime(row.entry_time), exitTime: formatDateTime(row.exit_time),
        })));
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    loadVisitors();
  }, []);

  const filteredVisitors = useMemo(() => visitors.filter((visitor) => {
    const search = searchTerm.toLowerCase();
    const matches = [visitor.visitorId, visitor.visitorName, visitor.contact, visitor.flatNumber, visitor.residentName, visitor.purpose].some((value) => value.toLowerCase().includes(search));
    return matches && (statusFilter === "All" || visitor.approvalStatus === statusFilter);
  }), [visitors, searchTerm, statusFilter]);
  const approved = visitors.filter((visitor) => visitor.approvalStatus === "Approved").length;
  const pending = visitors.filter((visitor) => visitor.approvalStatus === "Pending").length;
  const inside = visitors.filter((visitor) => visitor.entryTime !== "—" && visitor.exitTime === "—").length;

  return <div className="visitors-page">
    <div className="visitors-header"><div><p className="visitors-overline">SECURITY & VISITOR MANAGEMENT</p><h1>Visitors Management</h1><p className="visitors-subtitle">Visitor entry, exit અને approval records databaseમાંથી.</p></div></div>
    <div className="visitor-stats-grid"><div className="visitor-stat-card"><div className="visitor-stat-icon blue">👥</div><div><p>Total Visitors</p><h2>{visitors.length}</h2><span>Database records</span></div></div><div className="visitor-stat-card"><div className="visitor-stat-icon green">✓</div><div><p>Approved</p><h2>{approved}</h2><span>Approved visitors</span></div></div><div className="visitor-stat-card"><div className="visitor-stat-icon orange">⏳</div><div><p>Pending Verification</p><h2>{pending}</h2><span>Awaiting approval</span></div></div><div className="visitor-stat-card"><div className="visitor-stat-icon purple">🚪</div><div><p>Currently Inside</p><h2>{inside}</h2><span>Entry recorded, exit pending</span></div></div></div>
    <section className="visitors-section"><div className="visitors-section-header"><div><h2>Visitor Records</h2><p>Review visitor contact, resident, purpose and gate timestamps.</p></div><span className="record-count">{filteredVisitors.length} Records</span></div>
      <div className="visitors-toolbar"><div className="visitor-search"><span>🔍</span><input placeholder="Search visitor, resident, flat or purpose..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Completed</option></select></div>
      {error && <p className="page-error" role="alert">{error}</p>}
      <div className="visitors-table-wrapper"><table className="visitors-table"><thead><tr><th>Visitor</th><th>Contact</th><th>Resident / Flat</th><th>Purpose</th><th>Entry</th><th>Exit</th><th>Status</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="7">Loading visitors…</td></tr> : filteredVisitors.length ? filteredVisitors.map((visitor) => <tr key={visitor.visitorId}><td><strong>{visitor.visitorName}</strong><small>{visitor.visitorId}</small></td><td>{visitor.contact}</td><td><div className="resident-flat"><strong>{visitor.residentName}</strong><span>{visitor.flatNumber}</span></div></td><td>{visitor.purpose}</td><td>{visitor.entryTime}</td><td>{visitor.exitTime}</td><td><span className={`approval-status approval-${visitor.approvalStatus.toLowerCase()}`}>{visitor.approvalStatus}</span></td></tr>) : <tr><td colSpan="7" className="no-visitor-data">No visitors found.</td></tr>}
      </tbody></table></div></section>
    <section className="visitor-info-card"><div className="visitor-info-icon">🛡️</div><div><h3>Visitor Records</h3><p>Visitor requests સાથે જોડાયેલા database entry અને exit સમય અહીં દેખાય છે.</p></div></section>
  </div>;
};
export default Visitors;
