import { useEffect, useState } from "react";
import StaffLayout from "../../components/StaffLayout";
import { formatDate, formatDateTime } from "../../utils/time";

const API = "http://localhost:5000/api/staff/security";

const SCOPES = [
  { key: "today", label: "Today" },
  { key: "expected", label: "Expected" },
  { key: "inside", label: "Currently inside" },
  { key: "history", label: "History" }
];

const VISITOR_TYPES = ["Guest", "Delivery", "Service", "Cab", "Other"];

const STATUS_PILL = {
  Approved: "sx-pill-green",
  Pending: "sx-pill-amber",
  Rejected: "sx-pill-red",
  Completed: "sx-pill-blue"
};

const authHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  "Content-Type": "application/json"
});

const emptyForm = {
  visitor_name: "",
  contact_number: "",
  visitor_type: "Guest",
  purpose: "",
  resident_id: ""
};

function StaffVisitors() {
  const [scope, setScope] = useState(() =>
    new URLSearchParams(window.location.search).get("scope") === "expected" ? "expected" : "today"
  );
  const [search, setSearch] = useState("");
  const [visitors, setVisitors] = useState([]);
  const [counts, setCounts] = useState({ today: 0, expected: 0, inside: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [showRegister, setShowRegister] = useState(false);
  const [flats, setFlats] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      fetch(`${API}/visitors?scope=${scope}&search=${encodeURIComponent(search.trim())}`, {
        headers: authHeaders()
      })
        .then(async (response) => ({ ok: response.ok, data: await response.json() }))
        .then(({ ok, data }) => {
          if (cancelled) return;

          if (!ok) throw new Error(data.message || "Unable to load visitors.");

          setVisitors(data.visitors || []);
          setCounts(data.counts || { today: 0, expected: 0, inside: 0 });
          setError("");
        })
        .catch((err) => {
          if (!cancelled) setError(err.message || "Unable to load visitors.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, search ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [scope, search, reloadKey]);

  const record = async (visitor, action) => {
    setBusyId(visitor.visitor_id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/visitors/${visitor.visitor_id}/${action}`, {
        method: "PATCH",
        headers: authHeaders()
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to update the visitor.");

      setMessage(
        `${visitor.visitor_name}: ${action === "entry" ? "entry" : "exit"} recorded.`
      );
      reload();
    } catch (err) {
      setError(err.message || "Unable to update the visitor.");
    } finally {
      setBusyId(null);
    }
  };

  const openRegister = async () => {
    setForm(emptyForm);
    setFormError("");
    setShowRegister(true);

    if (flats.length === 0) {
      try {
        const response = await fetch(`${API}/flats`, { headers: authHeaders() });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Unable to load flats.");

        setFlats(data.flats || []);
      } catch (err) {
        setFormError(err.message || "Unable to load flats.");
      }
    }
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.visitor_name.trim() || !form.purpose.trim() || !form.resident_id) {
      setFormError("Please fill the visitor name, purpose and flat.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.contact_number)) {
      setFormError("Contact number must be exactly 10 digits.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API}/visitors`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ...form, resident_id: Number(form.resident_id) })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to register the visitor.");

      setShowRegister(false);
      setMessage(data.message);
      setScope("expected");
      reload();
    } catch (err) {
      setFormError(err.message || "Unable to register the visitor.");
    } finally {
      setSaving(false);
    }
  };

  const flatLabel = (visitor) =>
    [visitor.block_wing, visitor.flat_number].filter(Boolean).join(" - ") || "-";

  const formatPersonName = (value) =>
    String(value || "").trim().toLocaleLowerCase("en-IN").replace(
      /(^|[\s'-])(\p{L})/gu,
      (_, separator, initial) => `${separator}${initial.toLocaleUpperCase("en-IN")}`
    );

  return (
    <StaffLayout
      badge="SECURITY"
      title="Visitors"
      subtitle="Register visitors, record their entry and exit, and see who is inside."
      actions={
        <button type="button" className="sx-btn sx-btn-primary" onClick={openRegister}>
          + Register Visitor
        </button>
      }
    >
      <section className="stats-grid">
        <div className="stat-card stat-active">
          <div className="stat-icon inventory-icon">🚪</div>

          <div className="stat-info">
            <h3>Today&apos;s Visitors</h3>
            <span className="stat-value">{counts.today}</span>
            <small>Registered for today</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon assigned-icon">🕘</div>

          <div className="stat-info">
            <h3>Expected</h3>
            <span className="stat-value">{counts.expected}</span>
            <small>Not arrived yet</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon available-icon">🏢</div>

          <div className="stat-info">
            <h3>Currently Inside</h3>
            <span className="stat-value">{counts.inside}</span>
            <small>Entered, not exited</small>
          </div>
        </div>
      </section>

      <section className="controls-bar">
        <div className="search-input-wrapper">
          <span className="search-icon-svg">🔍</span>

          <input
            type="text"
            className="search-input"
            placeholder="Search visitor name, contact or flat..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {SCOPES.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`filter-tab-btn ${scope === item.key ? "active" : ""}`}
              onClick={() => {
                setLoading(true);
                setScope(item.key);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="sx-card">
        {message && <p className="sx-alert sx-alert-success">{message}</p>}
        {error && <p className="sx-alert sx-alert-error">{error}</p>}

        {loading ? (
          <div className="sx-empty">Loading visitors...</div>
        ) : visitors.length === 0 ? (
          <div className="sx-empty">
            <strong>No visitors here</strong>
            {scope === "inside"
              ? "Nobody is inside right now."
              : "Register a visitor to see them in this list."}
          </div>
        ) : (
          <div className="sx-table-wrap">
            <table className="sx-table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Flat to visit</th>
                  <th>Type / Purpose</th>
                  <th>Visit</th>
                  <th>Entry / Exit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {visitors.map((visitor) => {
                  const canEnter = visitor.status === "Approved" && !visitor.entry_time;
                  const canExit = visitor.entry_time && !visitor.exit_time;

                  return (
                    <tr key={visitor.visitor_id}>
                      <td>
                        <strong>{formatPersonName(visitor.visitor_name)}</strong>
                        <small>{visitor.contact_number}</small>
                      </td>

                      <td>
                        {flatLabel(visitor)}
                        <small>
                          {[visitor.resident_first_name, visitor.resident_last_name]
                            .filter(Boolean)
                            .map(formatPersonName)
                            .join(" ")}
                        </small>
                      </td>

                      <td>
                        {visitor.visitor_type || "Guest"}
                        <small>{visitor.purpose}</small>
                      </td>

                      <td>
                        {formatDate(visitor.visit_date)}
                        <small>{String(visitor.expected_time || "").slice(0, 5)}</small>
                      </td>

                      <td>
                        {visitor.entry_time ? `In: ${formatDateTime(visitor.entry_time)}` : "Not entered"}
                        {visitor.exit_time && <small>Out: {formatDateTime(visitor.exit_time)}</small>}
                      </td>

                      <td>
                        <span className={`sx-pill ${STATUS_PILL[visitor.status] || ""}`}>
                          {visitor.status}
                        </span>
                      </td>

                      <td>
                        {canEnter && (
                          <button
                            type="button"
                            className="sx-btn sx-btn-primary sx-btn-small"
                            disabled={busyId === visitor.visitor_id}
                            onClick={() => record(visitor, "entry")}
                          >
                            Record Entry
                          </button>
                        )}

                        {canExit && (
                          <button
                            type="button"
                            className="sx-btn sx-btn-ghost sx-btn-small"
                            disabled={busyId === visitor.visitor_id}
                            onClick={() => record(visitor, "exit")}
                          >
                            Record Exit
                          </button>
                        )}

                        {!canEnter && !canExit && visitor.status === "Pending" && (
                          <small>Waiting for the resident</small>
                        )}

                        {visitor.status === "Rejected" && <small>Do not allow entry</small>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showRegister && (
        <div className="sx-modal-backdrop" role="dialog" aria-modal="true" aria-label="Register visitor">
          <form className="sx-modal" onSubmit={submitRegister}>
            <h3>Register a visitor</h3>
            <p>The resident of the flat will be asked to approve or reject the visit.</p>

            {formError && <p className="sx-alert sx-alert-error">{formError}</p>}

            <div className="sx-grid-2">
              <div className="sx-field">
                <label htmlFor="visitor-name">Visitor name</label>
                <input
                  id="visitor-name"
                  value={form.visitor_name}
                  maxLength={100}
                  onChange={(event) => setForm({ ...form, visitor_name: event.target.value })}
                />
              </div>

              <div className="sx-field">
                <label htmlFor="visitor-contact">Contact number</label>
                <input
                  id="visitor-contact"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.contact_number}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      contact_number: event.target.value.replace(/\D/g, "").slice(0, 10)
                    })
                  }
                />
              </div>

              <div className="sx-field">
                <label htmlFor="visitor-type">Visitor type</label>
                <select
                  id="visitor-type"
                  value={form.visitor_type}
                  onChange={(event) => setForm({ ...form, visitor_type: event.target.value })}
                >
                  {VISITOR_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sx-field">
                <label htmlFor="visitor-flat">Flat to visit</label>
                <select
                  id="visitor-flat"
                  value={form.resident_id}
                  onChange={(event) => setForm({ ...form, resident_id: event.target.value })}
                >
                  <option value="">Select flat</option>
                  {flats.map((flat) => (
                    <option key={flat.id} value={flat.id}>
                      {flat.block_wing} - {flat.flat_number} ({flat.first_name} {flat.last_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sx-field sx-field-wide">
                <label htmlFor="visitor-purpose">Purpose of visit</label>
                <input
                  id="visitor-purpose"
                  value={form.purpose}
                  maxLength={150}
                  placeholder="For example: parcel delivery, family visit"
                  onChange={(event) => setForm({ ...form, purpose: event.target.value })}
                />
              </div>
            </div>

            <div className="sx-modal-actions">
              <button type="button" className="sx-btn sx-btn-ghost" onClick={() => setShowRegister(false)} disabled={saving}>
                Cancel
              </button>

              <button type="submit" className="sx-btn sx-btn-primary" disabled={saving}>
                {saving ? "Registering..." : "Register Visitor"}
              </button>
            </div>
          </form>
        </div>
      )}
    </StaffLayout>
  );
}

export default StaffVisitors;
