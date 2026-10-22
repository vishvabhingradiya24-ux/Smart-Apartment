import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, DoorOpen, Info, UsersRound } from "lucide-react";
import "../../css/resident/resident_shared.css";

const API_URL = "http://localhost:5000/api/resident/visitors";

const FILTERS = ["All", "Pending", "Approved", "Rejected", "Completed"];

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

  // Requests that need a decision come first.
  const visibleVisitors = useMemo(() => {
    const list = visitors.filter((visitor) => filter === "All" || (visitor.status || "Pending") === filter);

    return [...list].sort(
      (a, b) => Number(b.status === "Pending") - Number(a.status === "Pending")
    );
  }, [visitors, filter]);

  return (
    <div className="rp-page">
      <header className="rp-banner">
        <div className="rp-banner-text">
          <span className="rp-banner-eyebrow">RESIDENT SERVICES</span>
          <h1>Visitors</h1>
          <p>Review visitor details and approve or reject pending requests.</p>
        </div>
        <span className="rp-banner-icon" aria-hidden="true"><DoorOpen size={28} strokeWidth={1.6} /></span>
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

      {error && (
        <div className="rp-alert is-error" role="alert">
          <Info size={18} aria-hidden="true" />
          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
          <button type="button" aria-label="Dismiss" onClick={() => setError("")}>×</button>
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

      <section className="rp-section">
        <div className="rp-section-head">
          <div>
            <span className="rp-eyebrow">YOUR VISITORS</span>
            <h2>Visitor history</h2>
            <p>Review the visitor information and decide on pending requests.</p>
          </div>
          <span className="rp-chip">{visibleVisitors.length} of {totalVisitors}</span>
        </div>

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
        ) : visibleVisitors.length === 0 ? (
          <div className="rp-empty">
            <span className="rp-empty-icon" aria-hidden="true"><DoorOpen size={24} strokeWidth={1.7} /></span>
            <h3>{totalVisitors === 0 ? "No visitor requests" : `No ${filter.toLowerCase()} visitors`}</h3>
            <p>
              {totalVisitors === 0
                ? "When the security desk registers a visitor for your flat, the request will appear here for you to approve or reject."
                : "Try another filter to see the rest of your visitors."}
            </p>
          </div>
        ) : (
          <div className="rp-grid is-wide">
            {visibleVisitors.map((visitor) => {
              const status = visitor.status || "Pending";
              const isPending = status === "Pending";
              const busy = updatingVisitorId === visitor.visitor_id;

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
                        {visitor.purpose && <p>{visitor.purpose}</p>}
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
            })}
          </div>
        )}
      </section>

      <div className="rp-note">
        <Info size={17} aria-hidden="true" />
        <p>
          <strong>Visitor approval.</strong> Review each request and approve or reject it.
          Decisions are available only while a request is pending.
        </p>
      </div>
    </div>
  );
}

export default ResidentVisitors;
