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
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [newStaff, setNewStaff] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    staff_type: "",
    password: "",
  });

  const fetchStaff = useCallback(async (signal) => {
    try {
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
    const loadStaff = async () => {
      await fetchStaff(controller.signal);
    };
    loadStaff();
    return () => controller.abort();
  }, [fetchStaff]);

  const refreshStaff = () => {
    setLoading(true);
    setError("");
    fetchStaff();
  };

  const handleAddStaff = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/admin/staff", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStaff),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to add staff member.");
      }

      setNewStaff({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        staff_type: "",
        password: "",
      });
      setShowAddForm(false);
      setSuccessMessage(data.message || "Staff member added successfully.");
      await fetchStaff();
    } catch (err) {
      setFormError(err.message || "Unable to add staff member.");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="admin-records-header-actions">
          <button
            type="button"
            className="admin-records-secondary"
            onClick={() => {
              setShowAddForm((visible) => !visible);
              setFormError("");
              setSuccessMessage("");
            }}
          >
            {showAddForm ? "Cancel" : "+ Add Staff"}
          </button>
          <button type="button" className="admin-records-refresh" onClick={refreshStaff} disabled={loading}>↻ Refresh</button>
        </div>
      </header>

      {successMessage && <p className="admin-staff-success" role="status">{successMessage}</p>}

      {showAddForm && (
        <section className="admin-records-card admin-staff-create-card">
          <div className="admin-records-card-header">
            <div>
              <h2>Add Staff Member</h2>
              <p>Enter staff details and set an initial login password.</p>
            </div>
          </div>
          <form className="admin-staff-create-form" onSubmit={handleAddStaff}>
            <label>
              First name
              <input
                required
                value={newStaff.first_name}
                onChange={(event) => setNewStaff({ ...newStaff, first_name: event.target.value })}
                autoComplete="given-name"
              />
            </label>
            <label>
              Last name
              <input
                required
                value={newStaff.last_name}
                onChange={(event) => setNewStaff({ ...newStaff, last_name: event.target.value })}
                autoComplete="family-name"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                required
                value={newStaff.email}
                onChange={(event) => setNewStaff({ ...newStaff, email: event.target.value })}
                autoComplete="email"
              />
            </label>
            <label>
              Phone
              <input
                type="tel"
                required
                value={newStaff.phone}
                onChange={(event) => setNewStaff({ ...newStaff, phone: event.target.value })}
                autoComplete="tel"
              />
            </label>
            <label>
              Staff type
              <select
                required
                value={newStaff.staff_type}
                onChange={(event) => setNewStaff({ ...newStaff, staff_type: event.target.value })}
              >
                <option value="">Select staff type</option>
                <option value="Security Staff">Security Staff</option>
                <option value="Maintenance Staff">Maintenance Staff</option>
                <option value="Housekeeping Staff">Housekeeping Staff</option>
                <option value="Reception Staff">Reception Staff</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label>
              Initial password
              <input
                type="password"
                required
                minLength={6}
                value={newStaff.password}
                onChange={(event) => setNewStaff({ ...newStaff, password: event.target.value })}
                autoComplete="new-password"
              />
            </label>
            {formError && <p className="admin-staff-form-error" role="alert">{formError}</p>}
            <div className="admin-staff-form-actions">
              <button type="button" className="admin-records-secondary" onClick={() => setShowAddForm(false)} disabled={saving}>Cancel</button>
              <button type="submit" className="admin-records-refresh" disabled={saving}>
                {saving ? "Adding..." : "Add Staff"}
              </button>
            </div>
          </form>
        </section>
      )}

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
          <div className="admin-records-state error"><strong>Unable to load staff</strong><p>{error}</p><button type="button" onClick={refreshStaff}>Try again</button></div>
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
