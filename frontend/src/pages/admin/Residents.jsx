import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import "../../css/admin.css";

const flatNumberCollator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});
const wingOptions = ["A", "B", "C", "D"];
const flatNumberOptions = Array.from({ length: 5 }, (_, floorIndex) =>
  [1, 2, 3, 4].map((unit) => String((floorIndex + 1) * 100 + unit)),
).flat();

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
  const [showPassword, setShowPassword] = useState(false);
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
    setShowPassword(false);
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
    setShowPassword(false);
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
    setFormError("");
    setSuccessMessage("");

    const enteredEmail = form.email.trim();
    const normalizedForm = {
      ...form,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: enteredEmail.toLowerCase(),
      phone: form.phone.trim(),
      block_wing: form.block_wing.trim(),
      flat_number: form.flat_number.trim(),
    };
    const requiredFields = editingId
      ? ["first_name", "last_name", "email", "phone"]
      : Object.keys(normalizedForm);
    const namePattern = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;
    const passwordBytes = new TextEncoder().encode(normalizedForm.password).length;
    const passwordDigits = (normalizedForm.password.match(/[0-9]/g) || []).length;
    const hasPasswordSpecialCharacter = /[^A-Za-z0-9\s]/.test(normalizedForm.password);

    if (requiredFields.some((field) => !normalizedForm[field])) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (normalizedForm.first_name.length > 100 || normalizedForm.last_name.length > 100) {
      setFormError("Names must be 100 characters or fewer.");
      return;
    }
    if (!namePattern.test(normalizedForm.first_name) || !namePattern.test(normalizedForm.last_name)) {
      setFormError("Names can contain letters, spaces, apostrophes, periods and hyphens.");
      return;
    }
    if (/[A-Z]/.test(enteredEmail)) {
      setFormError("Email must not contain uppercase letters.");
      return;
    }
    if (normalizedForm.email.length > 150) {
      setFormError("Email must be 150 characters or fewer.");
      return;
    }
    if (!emailPattern.test(normalizedForm.email)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (!phonePattern.test(normalizedForm.phone)) {
      setFormError("Enter a phone number with exactly 10 digits.");
      return;
    }
    if (
      !editingId &&
      (normalizedForm.password.length < 5 || passwordDigits < 3 || !hasPasswordSpecialCharacter || passwordBytes > 72)
    ) {
      setFormError("Password must have at least 5 characters, 3 digits, 1 special character and be no more than 72 bytes.");
      return;
    }

    const payload = editingId
      ? {
          first_name: normalizedForm.first_name,
          last_name: normalizedForm.last_name,
          email: normalizedForm.email,
          phone: normalizedForm.phone,
        }
      : normalizedForm;

    setSaving(true);
    try {
      const response = await request(
        editingId ? `/api/admin/residents/${editingId}` : "/api/admin/residents",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
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

  useEffect(() => {
    if (!showForm) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) setShowForm(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showForm, saving]);

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
        </div>
      </header>

      {successMessage && <p className="admin-staff-success" role="status">{successMessage}</p>}

      {showForm && (
        <div
          className="admin-resident-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setShowForm(false);
          }}
        >
          <section
            className="admin-records-card admin-resident-form-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resident-form-title"
          >
            <div className="admin-records-card-header admin-resident-modal-header">
              <div>
                <h2 id="resident-form-title">{editingId ? "Edit Resident" : "Add Resident"}</h2>
                <p>{editingId ? "Update resident name and contact information." : "Create a resident login account and assign the resident's flat."}</p>
              </div>
              <button
                type="button"
                className="admin-resident-modal-close"
                aria-label="Close resident form"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                ×
              </button>
            </div>
            <form className="admin-staff-create-form" onSubmit={saveResident}>
              <label>
                First name
                <input required autoFocus maxLength="100" autoComplete="given-name" value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} />
              </label>
              <label>
                Last name
                <input required maxLength="100" autoComplete="family-name" value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} />
              </label>
              <label>
                Email
                <input required type="email" maxLength="150" pattern="[^A-Z]*" title="Email must not contain uppercase letters." autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label>
                Phone
                <input required type="tel" inputMode="numeric" pattern="[0-9]{10}" minLength="10" maxLength="10" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </label>
              {!editingId && (
                <>
                  <label>
                    Block / Wing
                    <select required value={form.block_wing} onChange={(event) => setForm({ ...form, block_wing: event.target.value })}>
                      <option value="">Select wing</option>
                      {wingOptions.map((wing) => <option key={wing} value={wing}>{wing}</option>)}
                    </select>
                  </label>
                  <label>
                    Flat number
                    <select required value={form.flat_number} onChange={(event) => setForm({ ...form, flat_number: event.target.value })}>
                      <option value="">Select flat</option>
                      {flatNumberOptions.map((flatNumber) => <option key={flatNumber} value={flatNumber}>{flatNumber}</option>)}
                    </select>
                  </label>
                  <label>
                    Ownership type
                    <select required value={form.ownership_type} onChange={(event) => setForm({ ...form, ownership_type: event.target.value })}>
                      <option value="">Select ownership</option>
                      <option value="Owner">Owner</option>
                      <option value="Rent">Rent</option>
                    </select>
                  </label>
                  <label>
                    Initial password
                    <div className="admin-resident-password-control">
                      <input required minLength="5" maxLength="72" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                      <button
                        type="button"
                        className="admin-resident-password-toggle"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((visible) => !visible)}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </label>
                </>
              )}
              {formError && <p className="admin-staff-form-error" role="alert">{formError}</p>}
              <div className="admin-staff-form-actions">
                <button type="button" className="admin-records-secondary" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="admin-records-secondary" disabled={saving}>{saving ? "Saving…" : editingId ? "Save Changes" : "Add Resident"}</button>
              </div>
            </form>
          </section>
        </div>
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
              <Search size={16} aria-hidden="true" />
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
