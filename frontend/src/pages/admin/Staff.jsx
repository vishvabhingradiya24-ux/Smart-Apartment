import { API_BASE_URL } from "../../utils/apiBase.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Plus, Search, UsersRound } from "lucide-react";
import AdminFormModal from "./AdminFormModal";
import { STAFF_DEPARTMENTS } from "../../constants/staffDepartments";
import "../../css/admin.css";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const EMPTY_CREATE_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  department: "",
  password: "",
};

const Staff = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "", phone: "", department: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchStaff = useCallback(async (signal) => {
    try {
      const response = await fetch(API_BASE_URL + "/api/admin/staff", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }, signal,
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

  const filteredStaff = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return staffList.filter((person) => {
      const matchesSearch = [person.id, person.first_name, person.last_name, person.email, person.phone, person.department]
        .some((value) => String(value || "").toLowerCase().includes(query));
      return matchesSearch;
    });
  }, [staffList, searchTerm]);
  const joinedThisMonth = staffList.filter((person) => {
    const date = new Date(person.created_at);
    const now = new Date();
    return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const createStaff = async (event) => {
    event.preventDefault();
    setCreatingStaff(true);
    setCreateError("");
    setSuccessMessage("");
    try {
      const newStaff = {
        first_name: createForm.first_name.trim(),
        last_name: createForm.last_name.trim(),
        email: createForm.email.trim().toLowerCase(),
        phone: createForm.phone.trim(),
        department: createForm.department,
        password: createForm.password,
      };
      const response = await fetch(`${API_BASE_URL}/api/admin/staff`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStaff),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to add staff member.");

      setStaffList((current) => [{
        id: data.staffId,
        first_name: newStaff.first_name,
        last_name: newStaff.last_name,
        email: newStaff.email,
        phone: newStaff.phone,
        department: newStaff.department,
        created_at: new Date().toISOString(),
      }, ...current]);
      setCreateForm(EMPTY_CREATE_FORM);
      setShowCreateForm(false);
      setSuccessMessage(data.message || "Staff member added successfully.");
    } catch (err) {
      setCreateError(err.message || "Unable to add staff member.");
    } finally {
      setCreatingStaff(false);
    }
  };

  const openEditForm = (person) => {
    setEditingStaff(person);
    setEditForm({
      first_name: person.first_name || "",
      last_name: person.last_name || "",
      email: person.email || "",
      phone: person.phone || "",
      department: person.department || "",
    });
    setEditError("");
  };

  const saveStaffEdit = async (event) => {
    event.preventDefault();
    if (!editingStaff) return;
    setSavingEdit(true);
    setEditError("");
    try {
      const updatedFields = {
        ...editForm,
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
      };
      const response = await fetch(`${API_BASE_URL}/api/admin/staff/${editingStaff.id}`, {
        method: "PUT",
        headers: {
          Authorization: `******"token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update staff member.");

      setStaffList((current) => current.map((person) =>
        person.id === editingStaff.id ? { ...person, ...updatedFields } : person
      ));
      setEditingStaff(null);
      setSuccessMessage(data.message || "Staff member updated successfully.");
    } catch (err) {
      setEditError(err.message || "Unable to update staff member.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="admin-records-page admin-staff-page">
      <header className="admin-records-header">
        <div><span className="admin-records-eyebrow">STAFF MANAGEMENT</span><h1>Staff Members</h1><p>Staff directory from your database, including contact details.</p></div>
        <div className="admin-records-header-actions">
          <button type="button" className="admin-records-refresh" onClick={() => {
            setCreateError("");
            setSuccessMessage("");
            setShowCreateForm(true);
          }}>
            <Plus size={16} aria-hidden="true" /> Add Staff
          </button>
        </div>
      </header>

      {successMessage && <p className="admin-staff-success" role="status">{successMessage}</p>}
      {showCreateForm && (
        <AdminFormModal title="Add Staff Member" onClose={() => setShowCreateForm(false)} saving={creatingStaff}>
          <form className="admin-staff-create-form" onSubmit={createStaff}>
            <label>
              First name
              <input required maxLength={100} autoComplete="given-name" value={createForm.first_name} onChange={(event) => setCreateForm({ ...createForm, first_name: event.target.value })} />
            </label>
            <label>
              Department
              <select required value={createForm.department} onChange={(event) => setCreateForm({ ...createForm, department: event.target.value })}>
                <option value="" disabled>Select department</option>
                {STAFF_DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </label>
            <label>
              Last name
              <input required maxLength={100} autoComplete="family-name" value={createForm.last_name} onChange={(event) => setCreateForm({ ...createForm, last_name: event.target.value })} />
            </label>
            <label>
              Email
              <input type="email" required maxLength={150} pattern="[^A-Z]*" title="Email must not contain uppercase letters." autoComplete="email" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} />
            </label>
            <label>
              Phone
              <input type="tel" required inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} autoComplete="tel" value={createForm.phone} onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })} />
            </label>
            <label>
              Initial password
              <input type="password" required minLength={5} maxLength={72} autoComplete="new-password" value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} />
            </label>
            <p className="admin-staff-form-hint">Use at least 5 characters, including 3 digits and 1 special character. Share this initial password with the staff member so they can log in.</p>
            {createError && <p className="admin-staff-form-error" role="alert">{createError}</p>}
            <div className="admin-staff-form-actions">
              <button type="button" className="admin-records-secondary" onClick={() => setShowCreateForm(false)} disabled={creatingStaff}>Cancel</button>
              <button type="submit" className="admin-records-secondary" disabled={creatingStaff}>{creatingStaff ? "Adding..." : "Add Staff"}</button>
            </div>
          </form>
        </AdminFormModal>
      )}
      {editingStaff && (
        <AdminFormModal title="Edit Staff Member" onClose={() => setEditingStaff(null)} saving={savingEdit}>
          <form className="admin-staff-create-form" onSubmit={saveStaffEdit}>
            <label>
              First name
              <input required maxLength={100} autoComplete="given-name" value={editForm.first_name} onChange={(event) => setEditForm({ ...editForm, first_name: event.target.value })} />
            </label>
            <label>
              Department
              <select required value={editForm.department} onChange={(event) => setEditForm({ ...editForm, department: event.target.value })}>
                <option value="" disabled>Select department</option>
                {STAFF_DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </label>
            <label>
              Last name
              <input required maxLength={100} autoComplete="family-name" value={editForm.last_name} onChange={(event) => setEditForm({ ...editForm, last_name: event.target.value })} />
            </label>
            <label>
              Email
              <input type="email" required maxLength={150} pattern="[^A-Z]*" title="Email must not contain uppercase letters." autoComplete="email" value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} />
            </label>
            <label>
              Phone
              <input type="tel" required inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} autoComplete="tel" value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} />
            </label>
            {editError && <p className="admin-staff-form-error" role="alert">{editError}</p>}
            <div className="admin-staff-form-actions">
              <button type="button" className="admin-records-secondary" onClick={() => setEditingStaff(null)} disabled={savingEdit}>Cancel</button>
              <button type="submit" className="admin-records-secondary" disabled={savingEdit}>{savingEdit ? "Saving..." : "Save Changes"}</button>
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
              <thead><tr><th>Staff member</th><th>Department</th><th>Phone</th><th>Email</th><th>Joined</th><th className="admin-action-column">Actions</th></tr></thead>
              <tbody>{filteredStaff.map((person) => {
                const name = `${person.first_name || ""} ${person.last_name || ""}`.trim() || "Staff member";
                return <tr key={person.id}>
                  <td><div className="admin-records-person"><span>{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><small>Staff ID #{person.id}</small></div></div></td>
                  <td>{person.department || "Not assigned"}</td>
                  <td>{person.phone || "—"}</td><td>{person.email || "—"}</td><td>{formatDate(person.created_at)}</td>
                  <td className="admin-action-column"><div className="admin-records-actions"><button type="button" onClick={() => openEditForm(person)}>Edit</button><button type="button" onClick={() => navigate(`/admin/task?staffId=${encodeURIComponent(person.id)}`)}>Tasks</button></div></td>
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
