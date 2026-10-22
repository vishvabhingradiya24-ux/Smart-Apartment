import { useEffect, useState } from "react";
import "../../css/resident/residentVisitors.css";

const API_URL = "http://localhost:5000/api/resident/visitors";
const VISITOR_TYPES = ["Guest", "Delivery", "Service", "Cab", "Other"];

const getTodayDate = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  return new Date(today.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
};

function ResidentVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingVisitorId, setUpdatingVisitorId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [registering, setRegistering] = useState(false);
  const [showVisitorForm, setShowVisitorForm] = useState(false);
  const [visitorForm, setVisitorForm] = useState({
    visitor_name: "",
    contact_number: "",
    visitor_type: "Guest",
    purpose: "",
    visit_date: getTodayDate(),
    expected_time: "",
  });

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
      setVisitorForm({
        visitor_name: "",
        contact_number: "",
        visitor_type: "Guest",
        purpose: "",
        visit_date: getTodayDate(),
        expected_time: "",
      });
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

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "resident-visitors-status-approved";

      case "Rejected":
        return "resident-visitors-status-rejected";

      case "Completed":
        return "resident-visitors-status-completed";

      case "Pending":
      default:
        return "resident-visitors-status-pending";
    }
  };

  const totalVisitors = visitors.length;

  const pendingVisitors = visitors.filter(
    (visitor) => visitor.status === "Pending"
  ).length;

  const approvedVisitors = visitors.filter(
    (visitor) => visitor.status === "Approved"
  ).length;

  const completedVisitors = visitors.filter(
    (visitor) => visitor.status === "Completed"
  ).length;

  const visitorGroups = [
    {
      key: "resident",
      title: "Pre-registered by you",
      description: "Visitors you registered in advance.",
      emptyMessage: "You haven’t pre-registered any visitors yet.",
      visitors: visitors.filter((visitor) => visitor.registered_by_staff_id == null),
    },
    {
      key: "security",
      title: "Requests added by Security",
      description: "Visitors recorded by Security for your approval.",
      emptyMessage: "There are no visitor requests from Security.",
      visitors: visitors.filter((visitor) => visitor.registered_by_staff_id != null),
    },
  ];

  return (
    <div className="resident-visitors-page">

      <section className="resident-visitors-top">

        <div>
          <span className="resident-visitors-eyebrow">
            RESIDENT SERVICES
          </span>

          <h1>Visitors</h1>

          <p>Register your expected visitors in advance and review requests from Security.</p>
        </div>
        <button
          type="button"
          className="resident-visitors-new"
          onClick={() => {
            setError("");
            setShowVisitorForm(true);
          }}
        >
          + Register visitor
        </button>
      </section>


      {success && (
        <div className="resident-visitors-alert success">

          <div className="resident-visitors-alert-icon">
            ✓
          </div>

          <div>
            <strong>Success</strong>
            <p>{success}</p>
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            ×
          </button>

        </div>
      )}


      {error && !showVisitorForm && (
        <div className="resident-visitors-alert error">

          <div className="resident-visitors-alert-icon">
            !
          </div>

          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>

        </div>
      )}

      {showVisitorForm && (
        <div
          className="resident-visitor-modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget && !registering) setShowVisitorForm(false);
          }}
        >
          <section
            className="resident-visitors-form-card resident-visitor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resident-visitor-form-title"
          >
          <div className="resident-visitors-form-header">
            <div>
              <span>PLAN A VISIT</span>
              <h2 id="resident-visitor-form-title">Pre-register a visitor</h2>
            </div>
            <button
              type="button"
              className="resident-visitor-modal-close"
              aria-label="Close visitor registration"
              onClick={() => setShowVisitorForm(false)}
              disabled={registering}
            >
              ×
            </button>
          </div>
          {error && (
            <div className="resident-visitors-alert error" role="alert">
              <div className="resident-visitors-alert-icon">!</div>
              <div>
                <strong>Unable to register visitor</strong>
                <p>{error}</p>
              </div>
              <button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button>
            </div>
          )}
          <p className="resident-visitors-form-description">
            Add the visitor’s details and expected arrival time. Security will be able to check the approved visit at the gate.
          </p>

          <form className="resident-visitors-form-grid" onSubmit={registerVisitor}>
            <div className="resident-visitors-form-group">
              <label htmlFor="resident-visitor-name">Visitor name</label>
              <input
                id="resident-visitor-name"
                value={visitorForm.visitor_name}
                onChange={(event) => setVisitorForm({ ...visitorForm, visitor_name: event.target.value })}
                maxLength={100}
                required
              />
            </div>
            <div className="resident-visitors-form-group">
              <label htmlFor="resident-visitor-contact">Contact number</label>
              <input
                id="resident-visitor-contact"
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
            </div>
            <div className="resident-visitors-form-group">
              <label htmlFor="resident-visitor-type">Visitor type</label>
              <select
                id="resident-visitor-type"
                value={visitorForm.visitor_type}
                onChange={(event) => setVisitorForm({ ...visitorForm, visitor_type: event.target.value })}
              >
                {VISITOR_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="resident-visitors-form-group">
              <label htmlFor="resident-visitor-purpose">Purpose of visit</label>
              <input
                id="resident-visitor-purpose"
                value={visitorForm.purpose}
                onChange={(event) => setVisitorForm({ ...visitorForm, purpose: event.target.value })}
                maxLength={255}
                required
              />
            </div>
            <div className="resident-visitors-form-group">
              <label htmlFor="resident-visitor-date">Visit date</label>
              <input
                id="resident-visitor-date"
                type="date"
                min={getTodayDate()}
                value={visitorForm.visit_date}
                onChange={(event) => setVisitorForm({ ...visitorForm, visit_date: event.target.value })}
                required
              />
            </div>
            <div className="resident-visitors-form-group">
              <label htmlFor="resident-visitor-time">Expected arrival time</label>
              <input
                id="resident-visitor-time"
                type="time"
                value={visitorForm.expected_time}
                onChange={(event) => setVisitorForm({ ...visitorForm, expected_time: event.target.value })}
                required
              />
            </div>
            <div className="resident-visitors-form-actions">
              <button
                className="resident-visitors-cancel"
                type="button"
                onClick={() => setShowVisitorForm(false)}
                disabled={registering}
              >
                Cancel
              </button>
              <button className="resident-visitors-submit" type="submit" disabled={registering}>
                {registering ? "Registering..." : "Register visitor"}
              </button>
            </div>
          </form>
          </section>
        </div>
      )}


      <section className="resident-visitors-overview">

        <div className="resident-visitors-overview-heading">
          <span>VISITOR OVERVIEW</span>
          <h2>Your visitor activity</h2>
        </div>

        <div className="resident-visitors-stat-grid">

          <div className="resident-visitors-stat">
            <span>Total Visitors</span>
            <strong>{totalVisitors}</strong>
          </div>

          <div className="resident-visitors-stat pending">
            <span>Pending</span>
            <strong>{pendingVisitors}</strong>
          </div>

          <div className="resident-visitors-stat approved">
            <span>Approved</span>
            <strong>{approvedVisitors}</strong>
          </div>

          <div className="resident-visitors-stat completed">
            <span>Completed</span>
            <strong>{completedVisitors}</strong>
          </div>

        </div>

      </section>


      <section className="resident-visitors-history">

        <div className="resident-visitors-history-header">

          <div>
            <span>VISITOR HISTORY</span>
            <h2>Your visitors</h2>
            <p>Your pre-registrations and requests recorded by Security are shown separately.</p>
          </div>

        </div>


        {loading ? (

          <div className="resident-visitors-loading">

            <div className="resident-visitors-loader"></div>

            <p>Loading visitor records...</p>

          </div>

        ) : (
          <div className="resident-visitors-groups">
            {visitorGroups.map((group) => (
              <section className="resident-visitors-group" key={group.key}>
                <header className="resident-visitors-group-header">
                  <div>
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                  <span>{group.visitors.length}</span>
                </header>
                {group.visitors.length === 0 ? (
                  <div className="resident-visitors-group-empty">{group.emptyMessage}</div>
                ) : (
                  <div className="resident-visitors-list">
                    {group.visitors.map((visitor) => (

              <article
                className="resident-visitor-card"
                key={visitor.visitor_id}
              >

                <div className="resident-visitor-card-top">

                  <div className="resident-visitor-person">

                    <div className="resident-visitor-avatar">
                      {visitor.visitor_name
                        ?.charAt(0)
                        ?.toUpperCase() || "V"}
                    </div>

                    <div>

                      <span>
                        VISITOR #{visitor.visitor_id}
                      </span>

                      <h3>
                        {visitor.visitor_name}
                      </h3>

                      <p>
                        {visitor.purpose}
                      </p>

                    </div>

                  </div>


                  <span
                    className={`resident-visitors-status ${getStatusClass(
                      visitor.status
                    )}`}
                  >
                    {visitor.status || "Pending"}
                  </span>

                </div>


                <div className="resident-visitor-details">

                  <div>
                    <span>CONTACT</span>
                    <strong>
                      {visitor.contact_number || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>VISIT DATE</span>
                    <strong>
                      {formatDate(visitor.visit_date)}
                    </strong>
                  </div>

                  <div>
                    <span>EXPECTED TIME</span>
                    <strong>
                      {formatTime(visitor.expected_time)}
                    </strong>
                  </div>

                  <div>
                    <span>REQUESTED</span>
                    <strong>
                      {formatDateTime(visitor.created_at)}
                    </strong>
                  </div>

                </div>


                {(visitor.entry_time ||
                  visitor.exit_time) && (

                  <div className="resident-visitor-entry">

                    {visitor.entry_time && (
                      <div>
                        <span>ENTRY</span>
                        <strong>
                          {formatDateTime(
                            visitor.entry_time
                          )}
                        </strong>
                      </div>
                    )}

                    {visitor.exit_time && (
                      <div>
                        <span>EXIT</span>
                        <strong>
                          {formatDateTime(
                            visitor.exit_time
                          )}
                        </strong>
                      </div>
                    )}

                  </div>

                )}

                {visitor.status === "Pending" && (
                  <div className="resident-visitor-decision-actions">
                    <button type="button" className="resident-visitor-reject" onClick={() => updateVisitorStatus(visitor.visitor_id, "Rejected")} disabled={updatingVisitorId === visitor.visitor_id}>
                      {updatingVisitorId === visitor.visitor_id ? "Updating..." : "Reject"}
                    </button>
                    <button type="button" className="resident-visitor-approve" onClick={() => updateVisitorStatus(visitor.visitor_id, "Approved")} disabled={updatingVisitorId === visitor.visitor_id}>
                      {updatingVisitorId === visitor.visitor_id ? "Updating..." : "Approve"}
                    </button>
                  </div>
                )}

              </article>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

        )}

      </section>


      <section className="resident-visitors-info">

        <div className="resident-visitors-info-icon">
          i
        </div>

        <div>
          <strong>
            Visitor approval
          </strong>

          <p>
            Review each request and approve or reject it. Decisions are available only while a request is pending.
          </p>
        </div>

      </section>

    </div>
  );
}

export default ResidentVisitors;