import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/serviceRequests.css";

const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!token) {
        setErrorMessage("Your session has expired. Please login again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/resident/requests",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load service requests"
        );
      }

      setRequests(data.requests || []);
    } catch (error) {
      console.error("Service Request Error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!serviceType) {
      setErrorMessage("Please select a service type.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Please enter a description.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/api/resident/requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            service_type: serviceType,
            request_description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit service request"
        );
      }

      setSuccessMessage(
        "Your service request has been submitted successfully."
      );

      setServiceType("");
      setDescription("");

      await fetchRequests();
    } catch (error) {
      console.error("Submit Service Request Error:", error);
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    const value = status?.toLowerCase();

    if (value === "completed") {
      return "request-status completed";
    }

    if (value === "in progress") {
      return "request-status in-progress";
    }

    if (value === "assigned") {
      return "request-status assigned";
    }

    return "request-status pending";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalRequests = requests.length;

  const pendingRequests = requests.filter(
    (item) => item.status?.toLowerCase() === "pending"
  ).length;

  const completedRequests = requests.filter(
    (item) => item.status?.toLowerCase() === "completed"
  ).length;

  return (
    <div className="service-requests-page">

      {/* TOP HEADER */}
      <header className="sr-header">

        <div className="sr-header-left">

          <Link to="/resident" className="sr-back-link">
            ← Dashboard
          </Link>

          <span className="sr-eyebrow">
            RESIDENT SERVICES
          </span>

          <h1>Service Requests</h1>

          <p>
            Request apartment services and track their progress
            from one place.
          </p>

        </div>

        <div className="sr-header-badge">
          <div className="sr-header-badge-icon">
            SR
          </div>

          <div>
            <span>MY REQUESTS</span>
            <strong>{totalRequests}</strong>
          </div>
        </div>

      </header>


      {/* ALERTS */}

      {successMessage && (
        <div className="sr-alert success">
          <div className="alert-icon">✓</div>

          <div>
            <strong>Request Submitted</strong>
            <p>{successMessage}</p>
          </div>

          <button
            onClick={() => setSuccessMessage("")}
          >
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="sr-alert error">
          <div className="alert-icon">!</div>

          <div>
            <strong>Something went wrong</strong>
            <p>{errorMessage}</p>
          </div>

          <button
            onClick={() => setErrorMessage("")}
          >
            ×
          </button>
        </div>
      )}


      {/* SUMMARY */}

      <section className="sr-summary-grid">

        <div className="sr-summary-card">

          <div className="summary-icon blue">
            ≡
          </div>

          <div>
            <span>Total Requests</span>
            <strong>{totalRequests}</strong>
          </div>

        </div>


        <div className="sr-summary-card">

          <div className="summary-icon orange">
            ◷
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingRequests}</strong>
          </div>

        </div>


        <div className="sr-summary-card">

          <div className="summary-icon green">
            ✓
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedRequests}</strong>
          </div>

        </div>

      </section>


      {/* MAIN GRID */}

      <section className="sr-main-grid">

        {/* NEW REQUEST */}

        <div className="sr-form-card">

          <div className="sr-card-heading">

            <div className="sr-heading-icon">
              +
            </div>

            <div>
              <span>NEW REQUEST</span>
              <h2>Request a Service</h2>
            </div>

          </div>

          <p className="sr-form-intro">
            Need assistance with your apartment?
            Submit a service request below.
          </p>


          <form onSubmit={handleSubmit}>

            <div className="sr-form-group">

              <label>
                Service Type
              </label>

              <select
                value={serviceType}
                onChange={(e) =>
                  setServiceType(e.target.value)
                }
              >
                <option value="">
                  Select a service
                </option>

                <option value="Electrician">
                  Electrical Service
                </option>

                <option value="Plumber">
                  Plumbing Service
                </option>

                <option value="Cleaning">
                  Cleaning Service
                </option>

                <option value="Carpenter">
                  Carpentry Service
                </option>

                <option value="Other">
                  Other Service
                </option>
              </select>

            </div>


            <div className="sr-form-group">

              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe the service you need..."
                rows="5"
              />

              <small>
                Please provide enough details so the staff
                can understand your request.
              </small>

            </div>


            <button
              type="submit"
              className="sr-submit-btn"
              disabled={submitting}
            >
              {submitting
                ? "Submitting Request..."
                : "Submit Service Request"}

              {!submitting && (
                <span>→</span>
              )}
            </button>

          </form>

        </div>


        {/* INFORMATION CARD */}

        <div className="sr-info-card">

          <div className="sr-info-top">

            <span>HOW IT WORKS</span>

            <h2>
              Get your request
              <br />
              handled smoothly.
            </h2>

          </div>


          <div className="sr-steps">

            <div className="sr-step">

              <div className="step-number">
                01
              </div>

              <div>
                <h3>Submit Request</h3>
                <p>
                  Tell us what service you need
                  and describe the issue.
                </p>
              </div>

            </div>


            <div className="sr-step">

              <div className="step-number">
                02
              </div>

              <div>
                <h3>Staff Assignment</h3>
                <p>
                  Your request can be assigned
                  to the appropriate staff member.
                </p>
              </div>

            </div>


            <div className="sr-step">

              <div className="step-number">
                03
              </div>

              <div>
                <h3>Track Progress</h3>
                <p>
                  Follow the request status until
                  the service is completed.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* REQUEST LIST */}

      <section className="sr-list-card">

        <div className="sr-list-header">

          <div>

            <span>REQUEST HISTORY</span>

            <h2>
              My Service Requests
            </h2>

            <p>
              View your submitted service requests
              and their current status.
            </p>

          </div>

          <button
            className="sr-refresh-btn"
            onClick={fetchRequests}
            disabled={loading}
          >
            ↻ Refresh
          </button>

        </div>


        {loading ? (

          <div className="sr-loading">
            <div className="sr-loader"></div>

            <p>
              Loading your service requests...
            </p>
          </div>

        ) : requests.length === 0 ? (

          <div className="sr-empty">

            <div className="sr-empty-icon">
              ≡
            </div>

            <h3>
              No service requests yet
            </h3>

            <p>
              Once you submit a service request,
              it will appear here.
            </p>

          </div>

        ) : (

          <div className="sr-request-list">

            {requests.map((request) => (

              <div
                className="sr-request"
                key={request.service_request_id}
              >

                <div className="sr-request-main">

                  <div className="sr-request-icon">
                    {request.service_type
                      ?.charAt(0)
                      ?.toUpperCase() || "S"}
                  </div>

                  <div className="sr-request-title">

                    <span>
                      REQUEST #{request.service_request_id}
                    </span>

                    <h3>
                      {request.service_type}
                    </h3>

                    <p>
                      {request.request_description}
                    </p>

                  </div>

                </div>


                <div className="sr-request-details">

                  <div>
                    <span>REQUEST DATE</span>
                    <strong>
                      {formatDate(request.request_date)}
                    </strong>
                  </div>

                  <div>
                    <span>ASSIGNED STAFF</span>
                    <strong>
                      {request.assigned_to
                        ? `Staff #${request.assigned_to}`
                        : "Not Assigned"}
                    </strong>
                  </div>

                  <div>
                    <span>COMPLETED</span>
                    <strong>
                      {formatDate(request.completed_date)}
                    </strong>
                  </div>

                </div>


                <div className="sr-request-status">

                  <span className={getStatusClass(request.status)}>
                    <i></i>
                    {request.status || "Pending"}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* FOOTER */}

      <footer className="sr-footer">

        <span>
          Smart Apartment
        </span>

        <span>
          Service Request Management
        </span>

      </footer>

    </div>
  );
};

export default ServiceRequests;