import { useCallback, useEffect, useMemo, useState } from "react";
import "../../css/admin.css";

const flatNumberCollator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const Residents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingResidentId, setSavingResidentId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    block_wing: "",
    flat_number: "",
    ownership_type: "",
    password: "",
  });

  const request = useCallback((url, options = {}) => fetch(`http://localhost:5000${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  }), []);

  const fetchResidents = useCallback(async (signal) => {
    const response = await request("/api/admin/residents", { signal });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unable to load residents.");
    }
    return data.residents || [];
  }, [request]);

  const refreshResidents = async () => {
    setLoading(true);
    setError("");
    try {
      setResidents(await fetchResidents());
    } catch (err) {
      setError(err.message || "Unable to load residents.");
      setResidents([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOwnership = async (residentId, ownershipType) => {
    setSavingResidentId(residentId);
    setError("");
    try {
      const response = await request(`/api/admin/residents/${residentId}/ownership`, {
        method: "PUT",
        body: JSON.stringify({ ownership_type: ownershipType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update ownership type.");
      setResidents((current) => current.map((resident) => (
        resident.id === residentId ? { ...resident, ownership_type: ownershipType } : resident
      )));
    } catch (err) {
      setError(err.message || "Unable to update ownership type.");
    } finally {
      setSavingResidentId(null);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      block_wing: "",
      flat_number: "",
      ownership_type: "",
      password: "",
    });
    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const openEditForm = (resident) => {
    setEditingId(resident.id);
    setForm({
      first_name: resident.first_name || "",
      last_name: resident.last_name || "",
      email: resident.email || "",
      phone: resident.phone || "",
      block_wing: resident.block_wing || "",
      flat_number: resident.flat_number || "",
      ownership_type: resident.ownership_type || "",
      password: "",
    });
    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const saveResident = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setSuccessMessage("");
    try {
      const response = await request(
        editingId ? `/api/admin/residents/${editingId}` : "/api/admin/residents",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save resident.");
      setShowForm(false);
      setSuccessMessage(data.message || (editingId ? "Resident updated." : "Resident added."));
      await refreshResidents();
    } catch (err) {
      setFormError(err.message || "Unable to save resident.");
    } finally {
      setSaving(false);
    }
  };

  const setArchived = async (resident, shouldArchive) => {
    const actionText = shouldArchive ? "archive" : "restore";
    if (shouldArchive && !window.confirm(
      `Archive ${resident.first_name} ${resident.last_name}? Their account will be deactivated, while existing records are preserved.`,
    )) return;
    setSavingResidentId(resident.id);
    setError("");
    setSuccessMessage("");
    try {
      const response = await request(
        `/api/admin/residents/${resident.id}/${shouldArchive ? "archive" : "restore"}`,
        { method: "PATCH" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Unable to ${actionText} resident.`);
      setResidents((current) => current.map((item) => (
        item.id === resident.id ? { ...item, is_active: data.is_active } : item
      )));
      setSuccessMessage(data.message);
    } catch (err) {
      setError(err.message || `Unable to ${actionText} resident.`);
    } finally {
      setSavingResidentId(null);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadResidents = async () => {
      try {
        setResidents(await fetchResidents(controller.signal));
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Unable to load residents.");
        setResidents([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadResidents();
    return () => controller.abort();
  }, [fetchResidents]);

  const filteredResidents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return [...residents]
      .sort((first, second) => {
        const blockOrder = flatNumberCollator.compare(
          first.block_wing || "",
          second.block_wing || "",
        );
        if (blockOrder !== 0) return blockOrder;

        const flatOrder = flatNumberCollator.compare(
          first.flat_number || "",
          second.flat_number || "",
        );
        return flatOrder || Number(first.id) - Number(second.id);
      })
      .filter((resident) =>
        [
          resident.first_name,
          resident.last_name,
          resident.email,
          resident.phone,
          resident.block_wing,
          resident.flat_number,
          resident.id,
        ].some((value) => String(value || "").toLowerCase().includes(query)),
      )
      .filter((resident) => (
        statusFilter === "All" ||
        (statusFilter === "Active" && Number(resident.is_active) === 1) ||
        (statusFilter === "Archived" && Number(resident.is_active) === 0)
      ));
  }, [residents, searchTerm, statusFilter]);

  const occupiedFlats = new Set(
    residents
      .filter((resident) => Number(resident.is_active) === 1)
      .map(
        (resident) =>
          `${resident.block_wing || ""}-${resident.flat_number || ""}`,
      )
      .filter((flat) => flat !== "-"),
  );
  const now = new Date();
  const joinedThisMonth = residents.filter((resident) => {
    const date = new Date(resident.created_at);
    return (
      Number(resident.is_active) === 1 &&
      !Number.isNaN(date.getTime()) &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;
  const activeResidents = residents.filter((resident) => Number(resident.is_active) === 1).length;
  const archivedResidents = residents.length - activeResidents;

  return (
    <div className="admin-records-page admin-residents-page">
      <header className="admin-records-header">
        <div>
          <span className="admin-records-eyebrow">ADMINISTRATION</span>
          <h1>Residents</h1>
          <p>Manage resident records; archive accounts without deleting their history.</p>
        </div>
        <div className="admin-records-header-actions">
          <button type="button" className="admin-records-secondary" onClick={openAddForm}>＋ Add Resident</button>
          <button type="button" className="admin-records-refresh" onClick={refreshResidents} disabled={loading}>↻ Refresh</button>
        </div>
      </header>

      {successMessage && <p className="admin-staff-success" role="status">{successMessage}</p>}

      {showForm && (
        <section className="admin-records-card admin-resident-form-card">
          <div className="admin-records-card-header">
            <div>
              <h2>{editingId ? "Edit Resident" : "Add Resident"}</h2>
              <p>{editingId ? "Update resident details; leave password blank to keep it unchanged." : "Create a resident login account and assign the resident's flat."}</p>
            </div>
          </div>
          <form className="admin-staff-create-form" onSubmit={saveResident}>
            <label>First name<input required maxLength="100" autoComplete="given-name" value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} /></label>
            <label>Last name<input required maxLength="100" autoComplete="family-name" value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} /></label>
            <label>Email<input required type="email" maxLength="150" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label>Phone<input required type="tel" maxLength="20" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
            <label>Block / Wing<input required maxLength="50" value={form.block_wing} onChange={(event) => setForm({ ...form, block_wing: event.target.value })} /></label>
            <label>Flat number<input required maxLength="20" value={form.flat_number} onChange={(event) => setForm({ ...form, flat_number: event.target.value })} /></label>
            <label>Ownership type<select required value={form.ownership_type} onChange={(event) => setForm({ ...form, ownership_type: event.target.value })}><option value="">Select ownership</option><option value="Owner">Owner</option><option value="Rent">Rent</option></select></label>
            <label>{editingId ? "New password (optional)" : "Initial password"}<input required={!editingId} minLength="6" type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
            {formError && <p className="admin-staff-form-error" role="alert">{formError}</p>}
            <div className="admin-staff-form-actions">
              <button type="button" className="admin-records-secondary" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
              <button type="submit" className="admin-records-secondary" disabled={saving}>{saving ? "Saving…" : editingId ? "Save Changes" : "Add Resident"}</button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-records-stats">
        <article>
          <span>👥</span>
          <div>
            <small>Active residents</small>
            <strong>{loading ? "—" : activeResidents}</strong>
          </div>
        </article>
        <article>
          <span>🏠</span>
          <div>
            <small>Occupied flats</small>
            <strong>{loading ? "—" : occupiedFlats.size}</strong>
          </div>
        </article>
        <article>
          <span>🆕</span>
          <div>
            <small>Joined this month</small>
            <strong>{loading ? "—" : joinedThisMonth}</strong>
          </div>
        </article>
        <article>
          <span>📦</span>
          <div>
            <small>Archived residents</small>
            <strong>{loading ? "—" : archivedResidents}</strong>
          </div>
        </article>
      </section>

      <section className="admin-records-card">
        <div className="admin-records-card-header">
          <div>
            <h2>Resident Directory</h2>
            <p>
              {filteredResidents.length} shown · {residents.length} total records
            </p>
          </div>
          <div className="admin-records-controls">
            <label className="admin-records-search">
              <span>🔍</span>
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name, flat, phone or email" />
            </label>
            <select aria-label="Resident account status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
              <option value="All">All residents</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-records-state">
            Loading residents from database...
          </div>
        ) : error ? (
          <div className="admin-records-state error">
            <strong>Unable to load residents</strong>
            <p>{error}</p>
            <button type="button" onClick={refreshResidents}>
              Try again
            </button>
          </div>
        ) : filteredResidents.length === 0 ? (
          <div className="admin-records-state">
            No residents match this search.
          </div>
        ) : (
          <div className="admin-records-table-wrap">
            <table className="admin-records-table">
              <thead>
                <tr>
                  <th>Flat No.</th>
                  <th>Resident</th>
                  <th>Rent / Owner</th>
                  <th>Phone</th>
                  <th>Registered</th>
                  <th>Account</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.map((resident) => {
                  const name =
                    `${resident.first_name || ""} ${resident.last_name || ""}`.trim() ||
                    "Resident";
                  return (
                    <tr key={resident.id}>
                      <td>
                        <span className="admin-records-badge">
                          {[resident.block_wing, resident.flat_number]
                            .filter(Boolean)
                            .join(" - ") || "Not assigned"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-records-person">
                          <span>{name.charAt(0).toUpperCase()}</span>
                          <div>
                            <strong>{name}</strong>
                            <small>{resident.email || "No email on file"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className="admin-ownership-select"
                          aria-label={`Ownership type for ${name}`}
                          value={resident.ownership_type || ""}
                          disabled={savingResidentId === resident.id || Number(resident.is_active) === 0}
                          onChange={(event) => updateOwnership(resident.id, event.target.value)}
                        >
                          <option value="" disabled>Not specified</option>
                          <option value="Owner">Owner</option>
                          <option value="Rent">Rent</option>
                        </select>
                      </td>
                      <td>{resident.phone || "—"}</td>
                      <td>{formatDate(resident.created_at)}</td>
                      <td>
                        <span className={`resident-account-status ${Number(resident.is_active) === 1 ? "active" : "archived"}`}>
                          {Number(resident.is_active) === 1 ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-records-actions">
                          <button type="button" onClick={() => openEditForm(resident)}>Edit</button>
                          {Number(resident.is_active) === 1 ? (
                            <button
                              type="button"
                              className="resident-archive-action"
                              disabled={savingResidentId === resident.id}
                              onClick={() => setArchived(resident, true)}
                            >
                              {savingResidentId === resident.id ? "Saving…" : "Archive"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={savingResidentId === resident.id}
                              onClick={() => setArchived(resident, false)}
                            >
                              {savingResidentId === resident.id ? "Saving…" : "Restore"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Residents;
