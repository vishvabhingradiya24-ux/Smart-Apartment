import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/visitors.css";

const API_URL = "http://localhost:5000/api/resident/visitors";

const Visitors = () => {
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

  // =========================
  // GET VISITORS
  // =========================
  const fetchVisitors = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch visitors");
      }

      setVisitors(data.visitors || []);
    } catch (err) {
      console.error("Fetch Visitors Error:", err);
      setError(err.message || "Unable to fetch visitors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SUBMIT VISITOR
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.visitor_name.trim() ||
      !formData.contact_number.trim() ||
      !formData.purpose.trim() ||
      !formData.visit_date ||
      !formData.expected_time
    ) {
      setError("Please fill all visitor details.");
      return;
    }

    if (!/^[0-9]{10,15}$/.test(formData.contact_number.trim())) {
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
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit visitor request");
      }

      setSuccess(
        data.message || "Visitor request submitted successfully."
      );

      setFormData({
        visitor_name: "",
        contact_number: "",
        purpose: "",
        visit_date: "",
        expected_time: "",
      });

      setShowForm(false);

      // Refresh visitor list from database
      await fetchVisitors();
    } catch (err) {
      console.error("Create Visitor Error:", err);
      setError(err.message || "Unable to submit visitor request.");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // FORMAT TIME
  // =========================
  const formatTime = (timeValue) => {
    if (!timeValue) return "-";

    const parts = timeValue.split(":");

    if (parts.length < 2) {
      return timeValue;
    }

    const hours = Number(parts[0]);
    const minutes = parts[1];

    const date = new Date();

    date.setHours(hours);
    date.setMinutes(Number(minutes));
    date.setSeconds(0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =========================
  // SUMMARY COUNTS
  // =========================
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

  // =========================
  // STATUS CLASS
  // =========================
  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "status-approved";

      case "Rejected":
        return "status-rejected";

      case "Completed":
        return "status-completed";

      case "Pending":
      default:
        return "status-pending";
    }
  };

  return (
    <div className="visitors-page">

      {/* =========================
          TOP NAVIGATION
      ========================= */}
      <header className="visitors-header">
        <div className="visitors-header-left">
          <Link to="/resident" className="visitors-back-btn">
            <span>←</span>
            Dashboard
          </Link>

          <div className="visitors-title-wrapper">
            <h1>Visitors</h1>
            <p>Manage your visitor requests</p>
          </div>
        </div>

        <button
          className="add-visitor-btn"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
        >
          <span>+</span>
          Add Visitor
        </button>
      </header>

      <main className="visitors-container">

        {/* =========================
            ALERTS
        ========================= */}
        {success && (
          <div className="visitor-alert visitor-success">
            <span className="alert-icon">✓</span>
            <span>{success}</span>

            <button onClick={() => setSuccess("")}>×</button>
          </div>
        )}

        {error && (
          <div className="visitor-alert visitor-error">
            <span className="alert-icon">!</span>
            <span>{error}</span>

            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* =========================
            PAGE INTRO
        ========================= */}
        <section className="visitor-intro">
          <div className="visitor-intro-icon">
            👤
          </div>

          <div>
            <h2>Visitor Management</h2>

            <p>
              Pre-register your visitors before they arrive at the society.
              Your request will remain pending until it is reviewed.
            </p>
          </div>
        </section>

        {/* =========================
            SUMMARY CARDS
        ========================= */}
        <section className="visitor-summary">

          <div className="visitor-summary-card">
            <div className="summary-icon total-icon">
              👥
            </div>

            <div>
              <span>Total Visits</span>
              <strong>{totalVisitors}</strong>
            </div>
          </div>

          <div className="visitor-summary-card">
            <div className="summary-icon pending-icon">
              ⏳
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingVisitors}</strong>
            </div>
          </div>

          <div className="visitor-summary-card">
            <div className="summary-icon approved-icon">
              ✓
            </div>

            <div>
              <span>Approved</span>
              <strong>{approvedVisitors}</strong>
            </div>
          </div>

          <div className="visitor-summary-card">
            <div className="summary-icon completed-icon">
              ✓
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedVisitors}</strong>
            </div>
          </div>

        </section>

        {/* =========================
            ADD VISITOR FORM
        ========================= */}
        {showForm && (
          <section className="visitor-form-card">

            <div className="form-card-header">
              <div>
                <h2>Register New Visitor</h2>
                <p>
                  Enter the details of the person visiting your flat.
                </p>
              </div>

              <button
                className="close-form-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="visitor-form-grid">

                <div className="form-group">
                  <label>
                    Visitor Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="visitor_name"
                    value={formData.visitor_name}
                    onChange={handleChange}
                    placeholder="Enter visitor name"
                    maxLength="100"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Contact Number <span>*</span>
                  </label>

                  <input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    maxLength="15"
                  />
                </div>

                <div className="form-group form-full">
                  <label>
                    Purpose of Visit <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    placeholder="Example: Family visit, personal meeting, delivery..."
                    maxLength="150"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Visit Date <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="visit_date"
                    value={formData.visit_date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Expected Time <span>*</span>
                  </label>

                  <input
                    type="time"
                    name="expected_time"
                    value={formData.expected_time}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-visitor-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>

              </div>

            </form>
          </section>
        )}

        {/* =========================
            VISITOR HISTORY
        ========================= */}
        <section className="visitor-history-card">

          <div className="history-header">

            <div>
              <h2>Visitor History</h2>
              <p>
                View all your registered visitor requests.
              </p>
            </div>

            <button
              className="refresh-btn"
              onClick={fetchVisitors}
              disabled={loading}
            >
              ↻ Refresh
            </button>

          </div>

          {loading ? (
            <div className="visitor-loading">
              <div className="loading-spinner"></div>
              <p>Loading visitors...</p>
            </div>
          ) : visitors.length === 0 ? (
            <div className="visitor-empty">

              <div className="empty-icon">
                👤
              </div>

              <h3>No visitors registered</h3>

              <p>
                You haven't registered any visitors yet.
              </p>

              <button
                className="empty-add-btn"
                onClick={() => setShowForm(true)}
              >
                + Register Visitor
              </button>

            </div>
          ) : (
            <div className="visitor-list">

              {visitors.map((visitor) => (
                <div
                  className="visitor-item"
                  key={visitor.visitor_id}
                >

                  <div className="visitor-person">

                    <div className="visitor-avatar">
                      {visitor.visitor_name
                        ? visitor.visitor_name.charAt(0).toUpperCase()
                        : "V"}
                    </div>

                    <div className="visitor-person-info">
                      <h3>{visitor.visitor_name}</h3>

                      <p>
                        {visitor.contact_number}
                      </p>
                    </div>

                  </div>

                  <div className="visitor-detail">
                    <span>Purpose</span>
                    <strong>{visitor.purpose}</strong>
                  </div>

                  <div className="visitor-detail">
                    <span>Date</span>
                    <strong>
                      {formatDate(visitor.visit_date)}
                    </strong>
                  </div>

                  <div className="visitor-detail">
                    <span>Expected Time</span>
                    <strong>
                      {formatTime(visitor.expected_time)}
                    </strong>
                  </div>

                  <div className="visitor-status-wrapper">
                    <span>Status</span>

                    <span
                      className={`visitor-status ${getStatusClass(
                        visitor.status
                      )}`}
                    >
                      {visitor.status}
                    </span>
                  </div>

                  {(visitor.entry_time || visitor.exit_time) && (
                    <div className="visitor-entry-info">

                      {visitor.entry_time && (
                        <div>
                          <span>Entry</span>
                          <strong>
                            {formatDate(visitor.entry_time)}
                          </strong>
                        </div>
                      )}

                      {visitor.exit_time && (
                        <div>
                          <span>Exit</span>
                          <strong>
                            {formatDate(visitor.exit_time)}
                          </strong>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
};

export default Visitors;