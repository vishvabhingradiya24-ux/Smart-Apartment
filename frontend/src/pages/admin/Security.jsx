import { useCallback, useEffect, useMemo, useState } from "react";
import "../../css/admin.css";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const Security = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [guards, setGuards] = useState([]);
  const [visitorStats, setVisitorStats] = useState({ visitorsToday: 0, checkedInToday: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSecurity = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5000/api/admin/security", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load security records.");
      setGuards(data.guards || []);
      setVisitorStats({ visitorsToday: Number(data.visitorsToday || 0), checkedInToday: Number(data.checkedInToday || 0) });
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to load security records.");
      setGuards([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchSecurity(controller.signal);
    return () => controller.abort();
  }, [fetchSecurity]);

  const filteredGuards = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return guards;
    return guards.filter((guard) => [guard.id, guard.first_name, guard.last_name, guard.email, guard.phone, guard.staff_type]
      .some((value) => String(value || "").toLowerCase().includes(query)));
  }, [guards, searchTerm]);

  const joinedThisMonth = guards.filter((guard) => {
    const date = new Date(guard.created_at);
    const now = new Date();
    return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="admin-records-page admin-security-page">
      <header className="admin-records-header">
        <div><span className="admin-records-eyebrow">SECURITY MANAGEMENT</span><h1>Security Guards</h1><p>Security team records and today’s visitor activity.</p></div>
        <div className="admin-records-header-actions">
          <button type="button" className="admin-records-refresh" onClick={() => fetchSecurity()} disabled={loading}>↻ Refresh</button>
        </div>
      </header>

      <section className="admin-records-stats">
        <article><span>🛡️</span><div><small>Security staff</small><strong>{loading ? "—" : guards.length}</strong></div></article>
        <article><span>🚪</span><div><small>Visitor requests today</small><strong>{loading ? "—" : visitorStats.visitorsToday}</strong></div></article>
        <article><span>✅</span><div><small>Checked in today</small><strong>{loading ? "—" : visitorStats.checkedInToday}</strong></div></article>
        <article><span>🆕</span><div><small>Guards joined this month</small><strong>{loading ? "—" : joinedThisMonth}</strong></div></article>
      </section>

      <section className="admin-records-card">
        <div className="admin-records-card-header">
          <div><h2>Security Team</h2><p>{filteredGuards.length} of {guards.length} guards</p></div>
          <label className="admin-records-search"><span>🔍</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name, phone or email" /></label>
        </div>

        {loading ? <div className="admin-records-state">Loading security staff from database...</div> : error ? (
          <div className="admin-records-state error"><strong>Unable to load security staff</strong><p>{error}</p><button type="button" onClick={() => fetchSecurity()}>Try again</button></div>
        ) : filteredGuards.length === 0 ? <div className="admin-records-state">No security staff records found.</div> : (
          <div className="admin-records-table-wrap">
            <table className="admin-records-table">
              <thead><tr><th>Security staff</th><th>Role</th><th>Phone</th><th>Email</th><th>Joined</th></tr></thead>
              <tbody>{filteredGuards.map((guard) => {
                const name = `${guard.first_name || ""} ${guard.last_name || ""}`.trim() || "Security staff";
                return <tr key={guard.id}>
                  <td><div className="admin-records-person"><span>{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><small>Staff ID #{guard.id}</small></div></div></td>
                  <td><span className="admin-records-badge">{guard.staff_type || "Security Staff"}</span></td>
                  <td>{guard.phone || "—"}</td><td>{guard.email || "—"}</td><td>{formatDate(guard.created_at)}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Security;
