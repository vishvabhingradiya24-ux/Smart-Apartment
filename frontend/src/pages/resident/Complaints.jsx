import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/resident.css";
import "../../css/complaints.css";

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    complaint_title: "",
    complaint_description: "",
    category: ""
  });

  const token = localStorage.getItem("token");

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/complaints/my",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch complaints"
        );
      }

      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchComplaints();
    } else {
      setError("Please login again");
      setLoading(false);
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/complaints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit complaint"
        );
      }

      setMessage("Complaint submitted successfully");

      setFormData({
        complaint_title: "",
        complaint_description: "",
        category: ""
      });

      setShowForm(false);

      fetchComplaints();

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "Pending") {
      return "complaint-status pending";
    }

    if (status === "In Progress") {
      return "complaint-status progress";
    }

    if (status === "Completed") {
      return "complaint-status completed";
    }

    return "complaint-status";
  };

  return (
    <div className="complaints-page">

      <aside className="complaints-sidebar">

        <div className="complaints-brand">
          <div className="complaints-brand-mark">
            ⌂
          </div>

          <div>
            <h2>Smart Apartment</h2>
            <span>Resident Portal</span>
          </div>
        </div>

        <div className="complaints-menu-label">
          MAIN MENU
        </div>

        <nav className="complaints-nav">

          <Link to="/resident">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link to="/resident/profile">
            <span>◯</span>
            My Profile
          </Link>

          <Link to="/resident/flat">
            <span>▦</span>
            Flat Details
          </Link>

          <Link to="/resident/payments">
            <span>₹</span>
            Payments
          </Link>

          <Link
            to="/resident/complaints"
            className="active"
          >
            <span>⚒</span>
            Complaints
          </Link>

          <Link to="/resident/requests">
            <span>≡</span>
            Service Requests
          </Link>

          <Link to="/resident/visitors">
            <span>◉</span>
            Visitors
          </Link>

          <Link to="/resident/amenities">
            <span>□</span>
            Amenity Booking
          </Link>

          <Link to="/resident/notices">
            <span>!</span>
            Notices & Events
          </Link>

          <Link to="/resident/polls">
            <span>✓</span>
            Polls & Voting
          </Link>

          <Link to="/resident/notifications">
            <span>○</span>
            Notifications
          </Link>

          <Link to="/resident/emergency">
            <span>!</span>
            Emergency Contacts
          </Link>

        </nav>

        <div className="complaints-sidebar-bottom">

          <Link
            to="/resident"
            className="complaints-back"
          >
            ← Dashboard
          </Link>

        </div>

      </aside>

      <main className="complaints-main">

        <header className="complaints-header">

          <div>
            <span className="complaints-overline">
              RESIDENT SPACE
            </span>

            <h1>My Complaints</h1>

            <p>
              Report and track issues related to your residence.
            </p>
          </div>

          <button
            className="new-complaint-button"
            onClick={() => {
              setShowForm(!showForm);
              setMessage("");
              setError("");
            }}
          >
            {showForm ? "Close" : "+ New Complaint"}
          </button>

        </header>

        {message && (
          <div className="complaint-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="complaint-message error">
            {error}
          </div>
        )}

        {showForm && (
          <section className="complaint-form-card">

            <div className="complaint-form-heading">
              <div>
                <span>NEW COMPLAINT</span>
                <h2>Submit a Complaint</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="complaint-form-grid">

                <div className="complaint-field">
                  <label>
                    Complaint Title
                  </label>

                  <input
                    type="text"
                    name="complaint_title"
                    value={formData.complaint_title}
                    onChange={handleChange}
                    maxLength={30}
                    required
                    placeholder="Enter complaint title"
                  />
                </div>

                <div className="complaint-field">
                  <label>
                    Category
                  </label>

                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    maxLength={20}
                    required
                    placeholder="Enter complaint category"
                  />
                </div>

              </div>

              <div className="complaint-field">
                <label>
                  Complaint Description
                </label>

                <textarea
                  name="complaint_description"
                  value={formData.complaint_description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your complaint"
                  rows="6"
                />
              </div>

              <button
                type="submit"
                className="submit-complaint-button"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Complaint"}
              </button>

            </form>

          </section>
        )}

        <section className="complaints-section">

          <div className="complaints-section-heading">

            <div>
              <span>YOUR REQUESTS</span>

              <h2>
                Complaint History
              </h2>
            </div>

            <span className="complaint-count">
              {complaints.length} Complaint
              {complaints.length !== 1 ? "s" : ""}
            </span>

          </div>

          {loading ? (
            <div className="complaints-empty">
              <div className="complaints-empty-icon">
                ...
              </div>

              <h3>
                Loading complaints
              </h3>

              <p>
                Please wait while we fetch your complaints.
              </p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="complaints-empty">

              <div className="complaints-empty-icon">
                +
              </div>

              <h3>
                No complaints yet
              </h3>

              <p>
                You have not submitted any complaints.
                Your complaints will appear here.
              </p>

              <button
                className="empty-new-button"
                onClick={() => setShowForm(true)}
              >
                + Submit Complaint
              </button>

            </div>
          ) : (
            <div className="complaints-list">

              {complaints.map((complaint) => (
                <div
                  className="complaint-card"
                  key={complaint.complaint_id}
                >

                  <div className="complaint-card-top">

                    <div>
                      <span className="complaint-category">
                        {complaint.category}
                      </span>

                      <h3>
                        {complaint.complaint_title}
                      </h3>
                    </div>

                    <span
                      className={getStatusClass(
                        complaint.status
                      )}
                    >
                      {complaint.status}
                    </span>

                  </div>

                  <p className="complaint-description">
                    {complaint.complaint_description}
                  </p>

                  <div className="complaint-card-footer">

                    <span>
                      Complaint ID: #{complaint.complaint_id}
                    </span>

                    <span>
                      {new Date(
                        complaint.complaint_date
                      ).toLocaleString("en-IN")}
                    </span>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        <footer className="complaints-footer">

          <span>
            Smart Apartment
          </span>

          <span>
            Residential Management System
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Complaints;