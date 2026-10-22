import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, DoorOpen, Info, Plus, UsersRound, X } from "lucide-react";
import "../../css/resident/resident_shared.css";

const API_URL = "http://localhost:5000/api/resident/visitors";
const VISITOR_TYPES = ["Guest", "Delivery", "Service", "Cab", "Other"];

const FILTERS = ["All", "Pending", "Approved", "Rejected", "Completed"];

const getTodayDate = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  return new Date(today.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
};

const emptyVisitorForm = () => ({
  visitor_name: "",
  contact_number: "",
  visitor_type: "Guest",
  purpose: "",
  visit_date: getTodayDate(),
  expected_time: "",
});

const statusTone = (status) => {
  if (status === "Approved") return "";
  if (status === "Rejected") return "is-danger";
  if (status === "Completed") return "is-muted";
  return "is-warn";
};

function ResidentVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [updatingVisitorId, setUpdatingVisitorId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [registering, setRegistering] = useState(false);
  const [showVisitorForm, setShowVisitorForm] = useState(false);
  const [visitorForm, setVisitorForm] = useState(emptyVisitorForm);

  const fetchVisitors = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch visitors."
        );
      }

      let visitorList = [];

      if (Array.isArray(data)) {
        visitorList = data;
      } else if (Array.isArray(data.visitors)) {
        visitorList = data.visitors;
      } else if (Array.isArray(data.data)) {
        visitorList = data.data;
      } else if (Array.isArray(data.data?.visitors)) {
        visitorList = data.data.visitors;
      }

      return visitorList;
  };

  useEffect(() => {
    let cancelled = false;

    const loadVisitors = async () => {
      try {
        const visitorList = await fetchVisitors();
        if (!cancelled) setVisitors(visitorList);
      } catch (err) {
        console.error("Fetch Visitors Error:", err);

        if (!cancelled) {
          setVisitors([]);
          setError(err.message || "Unable to fetch visitor records.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadVisitors();

    return () => {
      cancelled = true;
    };
  }, []);

  // Escape closes the registration form.
  useEffect(() => {
    if (!showVisitorForm) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !registering) setShowVisitorForm(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showVisitorForm, registering]);

  const openVisitorForm = () => {
    setError("");
    setSuccess("");
    setShowVisitorForm(true);
  };

  const registerVisitor = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setRegistering(true);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Session expired. Please login again.");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(visitorForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to register visitor.");

      setVisitors((previous) => [data.visitor, ...previous]);
      setVisitorForm(emptyVisitorForm());
      setSuccess("Visitor registered. Security can see the approved visit in the expected visitors list.");
      setShowVisitorForm(false);
    } catch (err) {
      setError(err.message || "Unable to register visitor.");
    } finally {
      setRegistering(false);
    }
  };

  const updateVisitorStatus = async (visitorId, status) => {
    setError("");
    setSuccess("");
    setUpdatingVisitorId(visitorId);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Session expired. Please login again.");
      }
      const response = await fetch(`${API_URL}/${visitorId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update visitor status.");
      setVisitors((previous) => previous.map((visitor) =>
        Number(visitor.visitor_id) === Number(visitorId) ? { ...visitor, status } : visitor
      ));
      setSuccess(`Visitor request ${status.toLowerCase()}.`);
    } catch (err) {
      setError(err.message || "Unable to update visitor status.");
    } finally {
      setUpdatingVisitorId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "—";

    const parts = value.split(":");

    if (parts.length < 2) {
      return value;
    }

    const hours = Number(parts[0]);
    const minutes = parts[1];

    const suffix = hours >= 12 ? "PM" : "AM";

    const displayHour =
      hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHour}:${minutes} ${suffix}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const countBy = (status) => visitors.filter((visitor) => visitor.status === status).length;

  const totalVisitors = visitors.length;
  const pendingVisitors = countBy("Pending");
  const approvedVisitors = countBy("Approved");
  const completedVisitors = countBy("Completed");

  // Visitors the resident registered, and requests that Security added for approval.
  const groups = useMemo(() => {
    const shown = visitors.filter((visitor) => filter === "All" || (visitor.status || "Pending") === filter);
    const pendingFirst = (list) =>
      [...list].sort((a, b) => Number(b.status === "Pending") - Number(a.status === "Pending"));

    return [
      {
        key: "security",
        eyebrow: "FROM SECURITY",
        title: "Requests added by Security",
        description: "Visitors recorded by Security for your approval.",
        empty: "There are no visitor requests from Security.",
        visitors: pendingFirst(shown.filter((visitor) => visitor.registered_by_staff_id != null)),
      },
      {
        key: "resident",
        eyebrow: "PRE-REGISTERED",
        title: "Pre-registered by you",
        description: "Visitors you registered in advance.",
        empty: "You haven’t pre-registered any visitors yet.",
        visitors: pendingFirst(shown.filter((visitor) => visitor.registered_by_staff_id == null)),
      },
    ];
  }, [visitors, filter]);

  const renderVisitor = (visitor) => {
    const status = visitor.status || "Pending";
    const isPending = status === "Pending";
    const busy = updatingVisitorId === visitor.visitor_id;
    const description = [visitor.visitor_type, visitor.purpose].filter(Boolean).join(" · ");

    return (
      <article
        className={`rp-card${isPending ? " is-warn" : ""}${status === "Completed" ? " is-muted" : ""}`}
        key={visitor.visitor_id}
      >
        <div className="rp-card-top">
          <div className="rp-person">
            <span className="rp-avatar">
              {visitor.visitor_name?.charAt(0)?.toUpperCase() || "V"}
            </span>
            <div>
              <small>VISITOR #{visitor.visitor_id}</small>
              <h3>{visitor.visitor_name}</h3>
              {description && <p>{description}</p>}
            </div>
          </div>

          <span className={`rp-pill ${statusTone(status)}`}>{status}</span>
        </div>

        <div className="rp-meta">
          <div><small>Contact</small><strong>{visitor.contact_number || "—"}</strong></div>
          <div><small>Visit date</small><strong>{formatDate(visitor.visit_date)}</strong></div>
          <div><small>Expected time</small><strong>{formatTime(visitor.expected_time)}</strong></div>
          <div><small>Requested</small><strong>{formatDateTime(visitor.created_at)}</strong></div>
          {visitor.entry_time && (
            <div><small>Entry</small><strong>{formatDateTime(visitor.entry_time)}</strong></div>
          )}
          {visitor.exit_time && (
            <div><small>Exit</small><strong>{formatDateTime(visitor.exit_time)}</strong></div>
          )}
        </div>

        {isPending && (
          <div className="rp-actions">
            <button
              type="button"
              className="rp-btn is-danger"
              onClick={() => updateVisitorStatus(visitor.visitor_id, "Rejected")}
              disabled={busy}
            >
              {busy ? "Updating..." : "Reject"}
            </button>
            <button
              type="button"
              className="rp-btn"
              onClick={() => updateVisitorStatus(visitor.visitor_id, "Approved")}
              disabled={busy}
            >
              {busy ? "Updating..." : "Approve"}
            </button>
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="rp-page">
      <header className="rp-banner">
        <div className="rp-banner-text">
          <span className="rp-banner-eyebrow">RESIDENT SERVICES</span>
          <h1>Visitors</h1>
          <p>Register your expected visitors in advance and review requests from Security.</p>
        </div>
        <div className="rp-banner-actions">
          <button type="button" className="rp-btn is-light" onClick={openVisitorForm}>
            <Plus size={16} aria-hidden="true" /> Register visitor
          </button>
          <span className="rp-banner-icon" aria-hidden="true"><DoorOpen size={28} strokeWidth={1.6} /></span>
        </div>
      </header>

      {success && (
        <div className="rp-alert" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <div>
            <strong>Done</strong>
            <p>{success}</p>
          </div>
          <button type="button" aria-label="Dismiss" onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      {error && !showVisitorForm && (
        <div className="rp-alert is-error" role="alert">
          <Info size={18} aria-hidden="true" />
          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
          <button type="button" aria-label="Dismiss" onClick={() => setError("")}>×</button>
        </div>
      )}

      {showVisitorForm && (
        <div
          className="rp-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !registering) setShowVisitorForm(false);
          }}
        >
          <section className="rp-modal" role="dialog" aria-modal="true" aria-labelledby="resident-visitor-form-title">
            <header className="rp-modal-head">
              <div>
                <span className="rp-eyebrow">PLAN A VISIT</span>
                <h2 id="resident-visitor-form-title">Pre-register a visitor</h2>
              </div>
              <button
                type="button"
                className="rp-modal-close"
                aria-label="Close visitor registration"
                onClick={() => setShowVisitorForm(false)}
                disabled={registering}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            {error && (
              <div className="rp-alert is-error" role="alert">
                <Info size={18} aria-hidden="true" />
                <div>
                  <strong>Unable to register visitor</strong>
                  <p>{error}</p>
                </div>
                <button type="button" aria-label="Dismiss error" onClick={() => setError("")}>×</button>
              </div>
            )}

            <p className="rp-modal-text">
              Add the visitor’s details and expected arrival time. Security will be able to check the approved visit at the gate.
            </p>

            <form className="rp-form" onSubmit={registerVisitor}>
              <label className="rp-field">
                <span>Visitor name</span>
                <input
                  value={visitorForm.visitor_name}
                  onChange={(event) => setVisitorForm({ ...visitorForm, visitor_name: event.target.value })}
                  maxLength={100}
                  autoFocus
                  required
                />
              </label>

              <label className="rp-field">
                <span>Contact number</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={visitorForm.contact_number}
                  onChange={(event) => setVisitorForm({
                    ...visitorForm,
                    contact_number: event.target.value.replace(/\D/g, "").slice(0, 10),
                  })}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="Enter a 10-digit phone number"
                  required
                />
              </label>

              <label className="rp-field">
                <span>Visitor type</span>
                <select
                  value={visitorForm.visitor_type}
                  onChange={(event) => setVisitorForm({ ...visitorForm, visitor_type: event.target.value })}
                >
                  {VISITOR_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>

              <label className="rp-field">
                <span>Purpose of visit</span>
                <input
                  value={visitorForm.purpose}
                  onChange={(event) => setVisitorForm({ ...visitorForm, purpose: event.target.value })}
                  maxLength={255}
                  required
                />
              </label>

              <label className="rp-field">
                <span>Visit date</span>
                <input
                  type="date"
                  min={getTodayDate()}
                  value={visitorForm.visit_date}
                  onChange={(event) => setVisitorForm({ ...visitorForm, visit_date: event.target.value })}
                  required
                />
              </label>

              <label className="rp-field">
                <span>Expected time</span>
                <input
                  type="time"
                  value={visitorForm.expected_time}
                  onChange={(event) => setVisitorForm({ ...visitorForm, expected_time: event.target.value })}
                  required
                />
              </label>

              <div className="rp-form-actions">
                <button type="button" className="rp-btn is-ghost" onClick={() => setShowVisitorForm(false)} disabled={registering}>
                  Cancel
                </button>
                <button type="submit" className="rp-btn" disabled={registering}>
                  {registering ? "Registering..." : "Register visitor"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <section className="rp-stats" aria-label="Visitor summary">
        <div className="rp-stat">
          <span className="rp-stat-icon"><UsersRound size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>Total visitors</small><strong>{totalVisitors}</strong></div>
        </div>
        <div className={`rp-stat${pendingVisitors > 0 ? " is-warn" : ""}`}>
          <span className="rp-stat-icon"><Clock3 size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>Waiting for you</small><strong>{pendingVisitors}</strong></div>
        </div>
        <div className="rp-stat">
          <span className="rp-stat-icon"><CheckCircle2 size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>Approved</small><strong>{approvedVisitors}</strong></div>
        </div>
        <div className="rp-stat">
          <span className="rp-stat-icon"><DoorOpen size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>Completed visits</small><strong>{completedVisitors}</strong></div>
        </div>
      </section>

      {totalVisitors > 0 && (
        <div className="rp-filters" role="group" aria-label="Filter visitors by status">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              className={`rp-filter${filter === item ? " is-active" : ""}`}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
              <small>{item === "All" ? totalVisitors : countBy(item)}</small>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="rp-loading">
          <span className="rp-spinner" aria-hidden="true" />
          Loading visitor records...
        </div>
      ) : totalVisitors === 0 ? (
        <div className="rp-empty">
          <span className="rp-empty-icon" aria-hidden="true"><DoorOpen size={24} strokeWidth={1.7} /></span>
          <h3>No visitors yet</h3>
          <p>
            Register a visitor in advance so Security can let them in, or approve the requests Security adds for your flat.
          </p>
          <button type="button" className="rp-btn" onClick={openVisitorForm}>
            <Plus size={16} aria-hidden="true" /> Register visitor
          </button>
        </div>
      ) : (
        groups.map((group) => (
          <section className="rp-section" key={group.key}>
            <div className="rp-section-head">
              <div>
                <span className="rp-eyebrow">{group.eyebrow}</span>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <span className="rp-chip">{group.visitors.length} visitor{group.visitors.length === 1 ? "" : "s"}</span>
            </div>

            {group.visitors.length === 0 ? (
              <div className="rp-empty">
                <p>{filter === "All" ? group.empty : `No ${filter.toLowerCase()} visitors here.`}</p>
              </div>
            ) : (
              <div className="rp-grid is-wide">{group.visitors.map(renderVisitor)}</div>
            )}
          </section>
        ))
      )}

      <div className="rp-note">
        <Info size={17} aria-hidden="true" />
        <p>
          <strong>Visitor approval.</strong> Visitors you register are approved straight away. For requests added
          by Security, approve or reject them while they are pending.
        </p>
      </div>
    </div>
  );
}

export default ResidentVisitors;
