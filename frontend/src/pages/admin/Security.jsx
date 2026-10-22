import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, DoorOpen, Search, Shield, UserRoundPlus } from "lucide-react";
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
      const response = await fetch("http://localhost:5000/api/admin/security", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }, signal,
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
    const loadSecurity = async () => {
      await fetchSecurity(controller.signal);
    };
    loadSecurity();
    return () => controller.abort();
  }, [fetchSecurity]);

  const filteredGuards = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return guards;
    return guards.filter((guard) => [guard.id, guard.first_name, guard.last_name, guard.email, guard.phone]
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
        <div><span className="admin-records-eyebrow">STAFF & SECURITY</span><h1>Staff Contacts</h1><p>Staff contact records and today’s visitor activity.</p></div>
      </header>

      <section className="admin-records-stats">
        <article><span><Shield size={18} strokeWidth={1.8} aria-hidden="true" /></span><div><small>Total staff</small><strong>{loading ? "—" : guards.length}</strong></div></article>
        <article><span><DoorOpen size={18} strokeWidth={1.8} aria-hidden="true" /></span><div><small>Visitor entries today</small><strong>{loading ? "—" : visitorStats.visitorsToday}</strong></div></article>
        <article><span><Check size={18} strokeWidth={1.8} aria-hidden="true" /></span><div><small>Currently inside</small><strong>{loading ? "—" : visitorStats.checkedInToday}</strong></div></article>
        <article><span><UserRoundPlus size={18} strokeWidth={1.8} aria-hidden="true" /></span><div><small>Guards joined this month</small><strong>{loading ? "—" : joinedThisMonth}</strong></div></article>
      </section>

      <section className="admin-records-card">
        <div className="admin-records-card-header">
          <div><h2>Staff Directory</h2><p>{filteredGuards.length} of {guards.length} staff members</p></div>
          <label className="admin-records-search"><Search size={16} aria-hidden="true" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name, phone or email" /></label>
        </div>

        {loading ? <div className="admin-records-state">Loading staff from database...</div> : error ? (
          <div className="admin-records-state error"><strong>Unable to load staff</strong><p>{error}</p><button type="button" onClick={() => fetchSecurity()}>Try again</button></div>
        ) : filteredGuards.length === 0 ? <div className="admin-records-state">No staff records found.</div> : (
          <div className="admin-records-table-wrap">
            <table className="admin-records-table">
              <thead><tr><th>Staff member</th><th>Phone</th><th>Email</th><th>Joined</th></tr></thead>
              <tbody>{filteredGuards.map((guard) => {
                const name = `${guard.first_name || ""} ${guard.last_name || ""}`.trim() || "Staff member";
                return <tr key={guard.id}>
                  <td><div className="admin-records-person"><span>{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><small>Staff ID #{guard.id}</small></div></div></td>
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
