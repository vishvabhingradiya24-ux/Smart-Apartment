import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/resident/residentVisitors.css";

const API_URL = "http://localhost:5000/api/resident/visitors";

function ResidentVisitors() {
  const [visitors, setVisitors] = useState([]);

  const [formData, setFormData] = useState({
    visitor_name: "",
    contact_number: "",
    purpose: "",
    visit_date: "",
    expected_time: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Session expired. Please login again.");
        return;
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

      setVisitors(visitorList);
    } catch (err) {
      console.error("Fetch Visitors Error:", err);

      setVisitors([]);
      setError(
        err.message || "Unable to fetch visitor records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const visitorName = formData.visitor_name.trim();
    const contactNumber = formData.contact_number.trim();
    const purpose = formData.purpose.trim();

    if (
      !visitorName ||
      !contactNumber ||
      !purpose ||
      !formData.visit_date ||
      !formData.expected_time
    ) {
      setError("Please fill all visitor details.");
      return;
    }

    if (!/^[0-9]{10,15}$/.test(contactNumber)) {
      setError("Please enter a valid contact number.");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          visitor_name: visitorName,
          contact_number: contactNumber,
          purpose: purpose,
          visit_date: formData.visit_date,
          expected_time: formData.expected_time,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit visitor request."
        );
      }

      setSuccess(
        data.message ||
          "Visitor request submitted successfully."
      );

      setFormData({
        visitor_name: "",
        contact_number: "",
        purpose: "",
        visit_date: "",
        expected_time: "",
      });

      setShowForm(false);

      await fetchVisitors();
    } catch (err) {
      console.error("Create Visitor Error:", err);

      setError(
        err.message ||
          "Unable to submit visitor request."
      );
    } finally {
      setSubmitting(false);
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

  return (
    <div className="resident-visitors-page">

      <section className="resident-visitors-top">

        <div>
          <span className="resident-visitors-eyebrow">
            RESIDENT SERVICES
          </span>

          <h1>Visitors</h1>

          <p>
            Pre-register your visitors and track
            their approval status.
          </p>
        </div>

        <div className="resident-visitors-actions">

          <Link
            to="/resident"
            className="resident-visitors-back"
          >
            ← Back to Dashboard
          </Link>

          <button
            type="button"
            className="resident-visitors-new"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowForm(true);
            }}
          >
            + New Visitor
          </button>

        </div>

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


      {error && (
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


      {showForm && (
        <section className="resident-visitors-form-section">

          <div className="resident-visitors-form-card">

            <div className="resident-visitors-form-header">

              <div>
                <span>NEW VISITOR</span>
                <h2>Register a Visitor</h2>
              </div>

              <button
                type="button"
                className="resident-visitors-close"
                onClick={() => {
                  if (submitting) return;

                  setShowForm(false);

                  setFormData({
                    visitor_name: "",
                    contact_number: "",
                    purpose: "",
                    visit_date: "",
                    expected_time: "",
                  });
                }}
              >
                ×
              </button>

            </div>

            <p className="resident-visitors-form-description">
              Enter the visitor details below. The request
              will remain pending until it is approved.
            </p>

            <form onSubmit={handleSubmit}>

              <div className="resident-visitors-form-grid">

                <div className="resident-visitors-form-group">

                  <label htmlFor="visitor_name">
                    Visitor Name
                  </label>

                  <input
                    id="visitor_name"
                    name="visitor_name"
                    type="text"
                    value={formData.visitor_name}
                    onChange={handleChange}
                    placeholder="Enter visitor name"
                    maxLength={100}
                  />

                </div>


                <div className="resident-visitors-form-group">

                  <label htmlFor="contact_number">
                    Contact Number
                  </label>

                  <input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    maxLength={15}
                  />

                </div>


                <div className="resident-visitors-form-group">

                  <label htmlFor="purpose">
                    Purpose
                  </label>

                  <input
                    id="purpose"
                    name="purpose"
                    type="text"
                    value={formData.purpose}
                    onChange={handleChange}
                    placeholder="Family visit, personal visit..."
                    maxLength={150}
                  />

                </div>


                <div className="resident-visitors-form-group">

                  <label htmlFor="visit_date">
                    Visit Date
                  </label>

                  <input
                    id="visit_date"
                    name="visit_date"
                    type="date"
                    value={formData.visit_date}
                    onChange={handleChange}
                  />

                </div>


                <div className="resident-visitors-form-group">

                  <label htmlFor="expected_time">
                    Expected Time
                  </label>

                  <input
                    id="expected_time"
                    name="expected_time"
                    type="time"
                    value={formData.expected_time}
                    onChange={handleChange}
                  />

                </div>

              </div>


              <div className="resident-visitors-form-actions">

                <button
                  type="button"
                  className="resident-visitors-cancel"
                  onClick={() => {
                    if (submitting) return;

                    setShowForm(false);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="resident-visitors-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Visitor Request"}

                  {!submitting && <span>→</span>}
                </button>

              </div>

            </form>

          </div>

        </section>
      )}


      <section className="resident-visitors-history">

        <div className="resident-visitors-history-header">

          <div>
            <span>YOUR VISITORS</span>

            <h2>Visitor History</h2>

            <p>
              View your submitted visitor requests
              and their current status.
            </p>
          </div>

          <button
            type="button"
            className="resident-visitors-refresh"
            onClick={fetchVisitors}
            disabled={loading}
          >
            ↻ Refresh
          </button>

        </div>


        {loading ? (

          <div className="resident-visitors-loading">

            <div className="resident-visitors-loader"></div>

            <p>Loading visitor records...</p>

          </div>

        ) : visitors.length === 0 ? (

          <div className="resident-visitors-empty">

            <div className="resident-visitors-empty-icon">
              ◉
            </div>

            <h3>No visitors registered</h3>

            <p>
              Visitor requests that you create will
              appear here.
            </p>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowForm(true);
              }}
            >
              + Register Visitor
            </button>

          </div>

        ) : (

          <div className="resident-visitors-list">

            {visitors.map((visitor) => (

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

              </article>

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
            New visitor requests are submitted as Pending.
            Once management approves the request, the
            visitor status will change to Approved.
          </p>
        </div>

      </section>

    </div>
  );
}

export default ResidentVisitors;