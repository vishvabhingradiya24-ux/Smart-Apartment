import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/resident/residentComplaints.css";

function ResidentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [complaintTitle, setComplaintTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!token) {
        setErrorMessage("Your session has expired. Please login again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/resident/complaints/my",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load complaints."
        );
      }

      let complaintList = [];

      if (Array.isArray(result)) {
        complaintList = result;
      } else if (Array.isArray(result.complaints)) {
        complaintList = result.complaints;
      } else if (Array.isArray(result.data)) {
        complaintList = result.data;
      } else if (Array.isArray(result.data?.complaints)) {
        complaintList = result.data.complaints;
      } else if (Array.isArray(result.data?.data)) {
        complaintList = result.data.data;
      }

      setComplaints(complaintList);
    } catch (error) {
      console.error("Complaint Error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openComplaintForm = () => {
    setSuccessMessage("");
    setErrorMessage("");
    setShowForm(true);
  };

  const closeComplaintForm = () => {
    if (submitting) return;

    setShowForm(false);
    setComplaintTitle("");
    setCategory("");
    setDescription("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!complaintTitle.trim()) {
      setErrorMessage("Please enter a complaint title.");
      return;
    }

    if (!category) {
      setErrorMessage("Please select a complaint category.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Please enter a complaint description.");
      return;
    }

    if (!token) {
      setErrorMessage("Your session has expired. Please login again.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/api/resident/complaints",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            complaint_title: complaintTitle.trim(),
            complaint_description: description.trim(),
            category,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to submit complaint."
        );
      }

      setSuccessMessage(
        "Your complaint has been submitted successfully."
      );

      setComplaintTitle("");
      setCategory("");
      setDescription("");
      setShowForm(false);

      await fetchComplaints();
    } catch (error) {
      console.error("Submit Complaint Error:", error);
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const formatted = new Date(date);

    if (Number.isNaN(formatted.getTime())) {
      return "—";
    }

    return formatted.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    const formatted = new Date(date);

    if (Number.isNaN(formatted.getTime())) {
      return "—";
    }

    return formatted.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    const value = status?.toLowerCase();

    if (value === "completed") {
      return "complaint-status completed";
    }

    if (value === "in progress") {
      return "complaint-status in-progress";
    }

    if (value === "resolved") {
      return "complaint-status resolved";
    }

    if (value === "rejected") {
      return "complaint-status rejected";
    }

    return "complaint-status pending";
  };

  const getCategoryClass = (categoryValue) => {
    const value = categoryValue?.toLowerCase();

    if (value === "plumbing") {
      return "complaint-category plumbing";
    }

    if (value === "maintenance") {
      return "complaint-category maintenance";
    }

    if (value === "electrical") {
      return "complaint-category electrical";
    }

    if (value === "cleaning") {
      return "complaint-category cleaning";
    }

    if (value === "security") {
      return "complaint-category security";
    }

    return "complaint-category";
  };

  const pendingCount = complaints.filter(
    (item) => item.status?.toLowerCase() === "pending"
  ).length;

  const completedCount = complaints.filter(
    (item) =>
      item.status?.toLowerCase() === "completed" ||
      item.status?.toLowerCase() === "resolved"
  ).length;

  return (
    <div className="complaints-page">

      <section className="complaints-page-header">

        <div className="complaints-header-content">

          <span className="complaints-eyebrow">
            RESIDENT SERVICES
          </span>

          <h1>My Complaints</h1>

          <p>
            Report and track issues related to your residence.
          </p>

        </div>

        <div className="complaints-header-actions">

          <Link
            to="/resident"
            className="complaints-dashboard-btn"
          >
            <span>←</span>
            Back to Dashboard
          </Link>

          <button
            type="button"
            className="complaints-new-btn"
            onClick={openComplaintForm}
          >
            <span>+</span>
            New Complaint
          </button>

        </div>

      </section>


      {successMessage && (
        <div className="complaints-alert success">

          <div className="complaints-alert-icon">
            ✓
          </div>

          <div className="complaints-alert-content">

            <strong>
              Complaint Submitted
            </strong>

            <p>
              {successMessage}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
          >
            ×
          </button>

        </div>
      )}


      {errorMessage && (
        <div className="complaints-alert error">

          <div className="complaints-alert-icon">
            !
          </div>

          <div className="complaints-alert-content">

            <strong>
              Something went wrong
            </strong>

            <p>
              {errorMessage}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setErrorMessage("")}
          >
            ×
          </button>

        </div>
      )}


      <section className="complaints-overview">

        <div className="complaints-overview-title">

          <span>
            COMPLAINT OVERVIEW
          </span>

          <h2>
            Your complaint activity
          </h2>

        </div>


        <div className="complaints-stat-list">

          <div className="complaints-stat">

            <div className="complaints-stat-icon mint">
              ≡
            </div>

            <div>
              <span>Total Complaints</span>
              <strong>{complaints.length}</strong>
            </div>

          </div>


          <div className="complaints-stat">

            <div className="complaints-stat-icon orange">
              ◷
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>

          </div>


          <div className="complaints-stat">

            <div className="complaints-stat-icon green">
              ✓
            </div>

            <div>
              <span>Resolved</span>
              <strong>{completedCount}</strong>
            </div>

          </div>

        </div>

      </section>


      {showForm && (
        <section className="complaint-form-section">

          <div className="complaint-form-card">

            <div className="complaint-form-header">

              <div className="complaint-form-heading">

                <div className="complaint-form-icon">
                  +
                </div>

                <div>

                  <span>
                    NEW COMPLAINT
                  </span>

                  <h2>
                    Report an Issue
                  </h2>

                </div>

              </div>


              <button
                type="button"
                className="complaint-close-btn"
                onClick={closeComplaintForm}
              >
                ×
              </button>

            </div>


            <p className="complaint-form-intro">
              Tell us about an issue in your residence.
              Your complaint will be sent to the management
              team for review.
            </p>


            <form onSubmit={handleSubmit}>

              <div className="complaint-form-grid">

                <div className="complaint-form-group">

                  <label htmlFor="complaintTitle">
                    Complaint Title
                  </label>

                  <input
                    id="complaintTitle"
                    type="text"
                    value={complaintTitle}
                    onChange={(event) =>
                      setComplaintTitle(event.target.value)
                    }
                    placeholder="Enter complaint title"
                    maxLength={30}
                  />

                  <small>
                    Maximum 30 characters
                  </small>

                </div>


                <div className="complaint-form-group">

                  <label htmlFor="complaintCategory">
                    Category
                  </label>

                  <select
                    id="complaintCategory"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                  >

                    <option value="">
                      Select category
                    </option>

                    <option value="Maintenance">
                      Maintenance
                    </option>

                    <option value="Plumbing">
                      Plumbing
                    </option>

                    <option value="Electrical">
                      Electrical
                    </option>

                    <option value="Cleaning">
                      Cleaning
                    </option>

                    <option value="Security">
                      Security
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

              </div>


              <div className="complaint-form-group">

                <label htmlFor="complaintDescription">
                  Description
                </label>

                <textarea
                  id="complaintDescription"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the issue in detail..."
                  rows={5}
                />

                <small>
                  Please provide enough details so the
                  management team can understand the issue.
                </small>

              </div>


              <div className="complaint-form-actions">

                <button
                  type="button"
                  className="complaint-cancel-btn"
                  onClick={closeComplaintForm}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="complaint-submit-btn"
                  disabled={submitting}
                >

                  {submitting
                    ? "Submitting..."
                    : "Submit Complaint"}

                  {!submitting && (
                    <span>→</span>
                  )}

                </button>

              </div>

            </form>

          </div>

        </section>
      )}


      <section className="complaints-history-section">

        <div className="complaints-history-heading">

          <div>

            <span>
              YOUR REQUESTS
            </span>

            <h2>
              Complaint History
            </h2>

            <p>
              View your submitted complaints and their current status.
            </p>

          </div>


          <div className="complaints-history-actions">

            <span className="complaints-count">

              {complaints.length}{" "}

              {complaints.length === 1
                ? "Complaint"
                : "Complaints"}

            </span>

            <button
              type="button"
              className="complaints-refresh-btn"
              onClick={fetchComplaints}
              disabled={loading}
            >
              ↻ Refresh
            </button>

          </div>

        </div>


        {loading ? (

          <div className="complaints-loading">

            <div className="complaints-loader"></div>

            <p>
              Loading your complaints...
            </p>

          </div>

        ) : complaints.length === 0 ? (

          <div className="complaints-empty">

            <div className="complaints-empty-icon">
              ✓
            </div>

            <h3>
              No complaints yet
            </h3>

            <p>
              When you submit a complaint,
              it will appear here.
            </p>

            <button
              type="button"
              onClick={openComplaintForm}
            >
              + Report an Issue
            </button>

          </div>

        ) : (

          <div className="complaints-list">

            {complaints.map((complaint) => (

              <article
                className="complaint-card"
                key={complaint.complaint_id}
              >

                <div className="complaint-card-top">

                  <div className="complaint-card-left">

                    <div className="complaint-card-icon">

                      {complaint.category
                        ?.charAt(0)
                        ?.toUpperCase() || "C"}

                    </div>


                    <div className="complaint-card-content">

                      <div className="complaint-card-number">
                        COMPLAINT #{complaint.complaint_id}
                      </div>

                      <h3>
                        {complaint.complaint_title}
                      </h3>

                      <p>
                        {complaint.complaint_description}
                      </p>

                    </div>

                  </div>


                  <span
                    className={getStatusClass(
                      complaint.status
                    )}
                  >

                    <i></i>

                    {complaint.status || "Pending"}

                  </span>

                </div>


                <div className="complaint-card-details">

                  <div className="complaint-detail">

                    <span>
                      CATEGORY
                    </span>

                    <strong
                      className={getCategoryClass(
                        complaint.category
                      )}
                    >
                      {complaint.category || "Other"}
                    </strong>

                  </div>


                  <div className="complaint-detail">

                    <span>
                      SUBMITTED
                    </span>

                    <strong>
                      {formatDate(
                        complaint.complaint_date
                      )}
                    </strong>

                  </div>


                  <div className="complaint-detail">

                    <span>
                      DATE & TIME
                    </span>

                    <strong>
                      {formatDateTime(
                        complaint.complaint_date
                      )}
                    </strong>

                  </div>


                  <div className="complaint-detail">

                    <span>
                      COMPLAINT ID
                    </span>

                    <strong>
                      #{complaint.complaint_id}
                    </strong>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>


      <section className="complaints-info-strip">

        <div className="complaints-info-icon">
          i
        </div>

        <div>

          <strong>
            How complaint handling works
          </strong>

          <p>
            Your complaint is reviewed by the management
            team. The status is updated as the issue
            progresses toward resolution.
          </p>

        </div>

      </section>

    </div>
  );
}

export default ResidentComplaints;