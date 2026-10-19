import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Eye, EyeOff, Search, UsersRound } from "lucide-react";
import AdminFormModal from "./AdminFormModal";
import "../../css/admin.css";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const Staff = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [newStaff, setNewStaff] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
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
    setFormError("");
    setSuccessMessage("");

    const enteredEmail = newStaff.email.trim();
    const normalizedStaff = {
      first_name: newStaff.first_name.trim(),
      last_name: newStaff.last_name.trim(),
      email: newStaff.email.trim().toLowerCase(),
      phone: newStaff.phone.trim(),
      password: newStaff.password,
    };
    const namePattern = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedStaff.first_name || !normalizedStaff.last_name || !normalizedStaff.email || !normalizedStaff.phone || !normalizedStaff.password) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (!namePattern.test(normalizedStaff.first_name) || !namePattern.test(normalizedStaff.last_name)) {
      setFormError("Names can contain letters, spaces, apostrophes, periods and hyphens.");
      return;
    }
    if (/[A-Z]/.test(enteredEmail)) {
      setFormError("Email must not contain uppercase letters.");
      return;
    }
    if (!emailPattern.test(normalizedStaff.email) || normalizedStaff.email.length > 150) {
      setFormError("Enter a valid email address with no more than 150 characters.");
      return;
    }
    if (!/^[0-9]{10}$/.test(normalizedStaff.phone)) {
      setFormError("Enter a phone number with exactly 10 digits.");
      return;
    }
    const passwordDigits = (normalizedStaff.password.match(/[0-9]/g) || []).length;
    if (
      normalizedStaff.password.length < 5 ||
      passwordDigits < 3 ||
      !/[^A-Za-z0-9\s]/.test(normalizedStaff.password) ||
      new TextEncoder().encode(normalizedStaff.password).length > 72
    ) {
      setFormError("Password must have at least 5 characters, 3 digits and 1 special character, and be no more than 72 bytes.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/staff", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizedStaff),
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
        password: "",
      });
      setShowPassword(false);
      setShowAddForm(false);
      setSuccessMessage(data.message || "Staff member added successfully.");
      await fetchStaff();
    } catch (err) {
      setFormError(err.message || "Unable to add staff member.");
    } finally {
      setSaving(false);
    }
  };

  const filteredStaff = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return staffList.filter((person) => {
      const matchesSearch = [person.id, person.first_name, person.last_name, person.email, person.phone]
        .some((value) => String(value || "").toLowerCase().includes(query));
      return matchesSearch;
    });
  }, [staffList, searchTerm]);
  const joinedThisMonth = staffList.filter((person) => {
    const date = new Date(person.created_at);
    const now = new Date();
    return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="admin-records-page admin-staff-page">
      <header className="admin-records-header">
        <div><span className="admin-records-eyebrow">STAFF MANAGEMENT</span><h1>Staff Members</h1><p>Staff directory from your database, including contact details.</p></div>
        <div className="admin-records-header-actions">
          <button
            type="button"
            className="admin-records-secondary"
            onClick={() => {
              setShowAddForm(true);
              setShowPassword(false);
              setFormError("");
              setSuccessMessage("");
            }}
          >
            + Add Staff
          </button>
        </div>
      </header>

      {successMessage && <p className="admin-staff-success" role="status">{successMessage}</p>}

      {showAddForm && (
        <AdminFormModal title="Add Staff Member" onClose={() => setShowAddForm(false)} saving={saving}>
          <form className="admin-staff-create-form" onSubmit={handleAddStaff}>
            <label>
              First name
              <input
                required
                maxLength={100}
                value={newStaff.first_name}
                onChange={(event) => setNewStaff({ ...newStaff, first_name: event.target.value })}
                autoComplete="given-name"
              />
            </label>
            <label>
              Last name
              <input
                required
                maxLength={100}
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
                maxLength={150}
                pattern="[^A-Z]*"
                title="Email must not contain uppercase letters."
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
                inputMode="numeric"
                pattern="[0-9]{10}"
                minLength={10}
                maxLength={10}
                value={newStaff.phone}
                onChange={(event) => setNewStaff({ ...newStaff, phone: event.target.value })}
                autoComplete="tel"
              />
            </label>
            <label>
              Initial password
              <div className="admin-resident-password-control">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={5}
                  maxLength={72}
                  value={newStaff.password}
                  onChange={(event) => setNewStaff({ ...newStaff, password: event.target.value })}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="admin-resident-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
            </label>
            {formError && <p className="admin-staff-form-error" role="alert">{formError}</p>}
            <div className="admin-staff-form-actions">
              <button type="button" className="admin-records-secondary" onClick={() => setShowAddForm(false)} disabled={saving}>Cancel</button>
              <button type="submit" className="admin-records-refresh" disabled={saving}>
                {saving ? "Adding..." : "Add Staff"}
              </button>
            </div>
          </form>
        </AdminFormModal>
      )}

      <section className="admin-records-stats">
        <article><span><UsersRound size={18} strokeWidth={1.8} aria-hidden="true" /></span><div><small>Total staff</small><strong>{loading ? "—" : staffList.length}</strong></div></article>
        <article><span><CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" /></span><div><small>Joined this month</small><strong>{loading ? "—" : joinedThisMonth}</strong></div></article>
        <article><span><Search size={18} strokeWidth={1.8} aria-hidden="true" /></span><div><small>Matching search</small><strong>{loading ? "—" : filteredStaff.length}</strong></div></article>
      </section>

      <section className="admin-records-card">
        <div className="admin-records-card-header">
          <div><h2>Staff Directory</h2><p>{filteredStaff.length} of {staffList.length} staff members</p></div>
          <div className="admin-records-controls">
            <label className="admin-records-search"><Search size={16} aria-hidden="true" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name, phone or email" /></label>
          </div>
        </div>

        {loading ? <div className="admin-records-state">Loading staff from database...</div> : error ? (
          <div className="admin-records-state error"><strong>Unable to load staff</strong><p>{error}</p><button type="button" onClick={refreshStaff}>Try again</button></div>
        ) : filteredStaff.length === 0 ? <div className="admin-records-state">No staff members match this search.</div> : (
          <div className="admin-records-table-wrap">
            <table className="admin-records-table">
              <thead><tr><th>Staff member</th><th>Phone</th><th>Email</th><th>Joined</th><th className="admin-action-column">Actions</th></tr></thead>
              <tbody>{filteredStaff.map((person) => {
                const name = `${person.first_name || ""} ${person.last_name || ""}`.trim() || "Staff member";
                return <tr key={person.id}>
                  <td><div className="admin-records-person"><span>{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><small>Staff ID #{person.id}</small></div></div></td>
                  <td>{person.phone || "—"}</td><td>{person.email || "—"}</td><td>{formatDate(person.created_at)}</td>
                  <td className="admin-action-column"><div className="admin-records-actions"><button type="button" onClick={() => navigate("/admin/task")}>Tasks</button></div></td>
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
