import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/admin.css";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const Staff = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStaff = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5000/api/admin/staff", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load staff records.");
      setStaffList(data.staff || []);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to load staff records.");
      setStaffList([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchStaff(controller.signal);
    return () => controller.abort();
  }, [fetchStaff]);

  const staffTypes = useMemo(() => [...new Set(staffList.map((person) => person.staff_type).filter(Boolean))].sort(), [staffList]);
  const filteredStaff = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return staffList.filter((person) => {
      const matchesSearch = [person.id, person.first_name, person.last_name, person.email, person.phone, person.staff_type]
        .some((value) => String(value || "").toLowerCase().includes(query));
      return matchesSearch && (typeFilter === "All" || person.staff_type === typeFilter);
    });
  }, [staffList, searchTerm, typeFilter]);

  const countType = (fragment) => staffList.filter((person) => (person.staff_type || "").toLowerCase().includes(fragment)).length;

  const viewStaff = (person) => {
    alert(`Staff Details\n\nName: ${person.first_name || ""} ${person.last_name || ""}\nStaff ID: ${person.id}\nType: ${person.staff_type || "—"}\nEmail: ${person.email || "—"}\nPhone: ${person.phone || "—"}\nJoined: ${formatDate(person.created_at)}`);
  };

  return (
    <div className="admin-records-page admin-staff-page">
      <header className="admin-records-header">
        <div><span className="admin-records-eyebrow">STAFF MANAGEMENT</span><h1>Staff Members</h1><p>Staff directory from your database, including roles and contact details.</p></div>
        <button type="button" className="admin-records-refresh" onClick={() => fetchStaff()} disabled={loading}>↻ Refresh</button>
      </header>

      <section className="admin-records-stats">
        <article><span>👨‍💼</span><div><small>Total staff</small><strong>{loading ? "—" : staffList.length}</strong></div></article>
        <article><span>🔧</span><div><small>Maintenance</small><strong>{loading ? "—" : countType("maintenance")}</strong></div></article>
        <article><span>🧹</span><div><small>Housekeeping</small><strong>{loading ? "—" : countType("housekeeping")}</strong></div></article>
        <article><span>🛡️</span><div><small>Security</small><strong>{loading ? "—" : countType("security")}</strong></div></article>
      </section>

      <section className="admin-records-card">
        <div className="admin-records-card-header">
          <div><h2>Staff Directory</h2><p>{filteredStaff.length} of {staffList.length} staff members</p></div>
          <div className="admin-records-controls">
            <label className="admin-records-search"><span>🔍</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name, phone or email" /></label>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by staff type">
              <option value="All">All staff types</option>
              {staffTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>

        {loading ? <div className="admin-records-state">Loading staff from database...</div> : error ? (
          <div className="admin-records-state error"><strong>Unable to load staff</strong><p>{error}</p><button type="button" onClick={() => fetchStaff()}>Try again</button></div>
        ) : filteredStaff.length === 0 ? <div className="admin-records-state">No staff members match this search.</div> : (
          <div className="admin-records-table-wrap">
            <table className="admin-records-table">
              <thead><tr><th>Staff member</th><th>Staff type</th><th>Phone</th><th>Email</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>{filteredStaff.map((person) => {
                const name = `${person.first_name || ""} ${person.last_name || ""}`.trim() || "Staff member";
                return <tr key={person.id}>
                  <td><div className="admin-records-person"><span>{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><small>Staff ID #{person.id}</small></div></div></td>
                  <td><span className="admin-records-badge">{person.staff_type || "—"}</span></td>
                  <td>{person.phone || "—"}</td><td>{person.email || "—"}</td><td>{formatDate(person.created_at)}</td>
                  <td><div className="admin-records-actions"><button type="button" onClick={() => viewStaff(person)}>View</button><button type="button" onClick={() => navigate("/admin/task")}>Tasks</button></div></td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Staff;
