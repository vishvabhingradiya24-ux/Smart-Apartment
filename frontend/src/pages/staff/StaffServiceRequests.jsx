import { useEffect, useMemo, useState } from "react";
import "../../css/staff/staff_service_requests.css";
import "../../css/staff/staff_shared_theme.css";
import { useNavigate } from "react-router-dom";
import { Check, Eye, Play, X } from "lucide-react";
import StaffNav from "../../components/StaffNav";

function StaffServiceRequests() {
  const navigate = useNavigate();

  // ================= STAFF DATA =================
  const [staff] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const firstName = staff?.first_name || staff?.name || "Staff";
  const lastName = staff?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "S";

  // ================= STATES =================
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Keeps track of the request currently being updated
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // ================= FETCH SERVICE REQUESTS =================
  useEffect(() => {
    const fetchServiceRequests = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Authentication token not found. Please login again."
          );
        }

        const response = await fetch(
          "http://localhost:5000/api/resident/requests/staff",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to fetch service requests"
          );
        }

        /*
          Backend response:

          {
            requests: [
              {
                service_request_id,
                resident_id,
                first_name,
                last_name,
                flat_number,
                service_type,
                request_description,
                status,
                assigned_to,
                request_date,
                completed_date
              }
            ]
          }
        */

        const formattedRequests = (data?.requests || []).map((item) => ({
          id: String(item.service_request_id),

          resident:
            `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
            "Unknown Resident",

          flat: String(item.flat_number || "-"),

          service: item.service_type || "Other",

          // Your Resident form has service type + description,
          // but no separate title field.
          request: item.service_type || "Service Request",

          description:
            item.request_description || "No description provided.",

          // Backend currently does not return priority.
          priority: item.priority || "Normal",

          status: item.status || "Pending",

          date: item.request_date
            ? new Date(item.request_date).toLocaleDateString()
            : "-",

          assignedTo: item.assigned_to || null,

          completedDate: item.completed_date || null,
        }));

        setServiceRequests(formattedRequests);
      } catch (err) {
        console.error("Fetch Staff Service Requests Error:", err);

        setError(
          err?.message || "Unable to load service requests."
        );

        setServiceRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRequests();
  }, []);

  // ================= FILTER + SEARCH =================
  const filteredRequests = useMemo(() => {
    return serviceRequests.filter((item) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        String(item.id || "").toLowerCase().includes(search) ||
        String(item.resident || "").toLowerCase().includes(search) ||
        String(item.flat || "").toLowerCase().includes(search) ||
        String(item.service || "").toLowerCase().includes(search) ||
        String(item.request || "").toLowerCase().includes(search) ||
        String(item.description || "").toLowerCase().includes(search);

      const matchesFilter =
        activeFilter === "All" || item.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [serviceRequests, searchTerm, activeFilter]);

  // ================= STATISTICS =================
  const totalRequests = serviceRequests.length;

  const pendingRequests = serviceRequests.filter(
    (item) => item.status === "Pending"
  ).length;

  const inProgressRequests = serviceRequests.filter(
    (item) => item.status === "In Progress"
  ).length;

  const completedRequests = serviceRequests.filter(
    (item) =>
      item.status === "Completed" ||
      item.status === "Resolved"
  ).length;

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("staff");

    navigate("/login");
  };

  // ================= NAVIGATION =================
  const handleNavigation = (path) => {
    navigate(path);
  };

  // ================= UPDATE STATUS =================
  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        navigate("/login");
        return false;
      }

      setUpdatingRequestId(String(requestId));

      const response = await fetch(
        `http://localhost:5000/api/resident/requests/staff/${requestId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to update service request status"
        );
      }

      /*
        Update the request in frontend immediately.
        No page refresh is required.
      */
      setServiceRequests((previousRequests) =>
        previousRequests.map((item) =>
          item.id === String(requestId)
            ? {
                ...item,
                status: newStatus,

                // Store completed date locally when completed.
                completedDate:
                  newStatus === "Completed"
                    ? new Date().toISOString()
                    : item.completedDate,
              }
            : item
        )
      );

      console.log(
        `Service request ${requestId} updated to ${newStatus}`
      );
      return true;
    } catch (error) {
      console.error(
        "Update Service Request Status Error:",
        error
      );

      alert(
        error?.message ||
          "Unable to update service request status."
      );
      return false;
    } finally {
      setUpdatingRequestId(null);
    }
  };

  // ================= VIEW REQUEST =================
  const handleViewRequest = (request) => setSelectedRequest(request);

  // ================= RESET FILTER =================
  const handleReset = () => {
    setSearchTerm("");
    setActiveFilter("All");
  };

  // ================= UI =================
  return (
    <div className="modern-staff-layout">

      {/* ================= SIDEBAR ================= */}
      <aside className="modern-sidebar">

        <div className="brand-header">
          <div className="brand-icon">🏢</div>

          <div className="brand-info">
            <h3>Smart Apartment</h3>
            <span>Staff Portal</span>
          </div>
        </div>

        <div className="sidebar-section-title">
          MAIN MENU
        </div>
                <StaffNav onNavigate={handleNavigation} />

        {/* ================= SIDEBAR USER ================= */}
        <div className="sidebar-footer">

          <div className="user-profile-summary">

            <div className="avatar-circle">
              {initials}
            </div>

            <div className="user-details">
              <strong>{fullName}</strong>
              <small>Staff Member</small>
            </div>

          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="modern-main-content">

        {/* ================= HEADER ================= */}
        <header className="top-header">

          <div className="header-title">

            <span className="badge-tag">
              SERVICE REQUESTS
            </span>

            <h1>Service Requests</h1>

            <p>
              View and manage resident service requests.
            </p>

          </div>

          <div className="header-actions">

            <div
              className="profile-pill"
              onClick={() =>
                handleNavigation("/staff/profile")
              }
            >

              <div className="avatar-sm">
                {initials}
              </div>

              <span>{fullName}</span>

            </div>

          </div>

        </header>

        <section className="staff-page-intro staff-page-intro--requests">
          <div><span className="staff-page-intro-kicker">RESIDENT SUPPORT DESK</span><h2>Every request deserves a clear next step.</h2><p>Track new service needs, coordinate follow-up and keep residents informed.</p></div>
          <div className="staff-page-intro-aside"><span>OPEN QUEUE</span><strong>{pendingRequests}</strong><small>requests awaiting action</small><i aria-hidden="true">⌁</i></div>
          <span className="staff-page-intro-art" aria-hidden="true">⌂</span>
        </section>

        {/* ================= STATS ================= */}
        <section className="stats-grid">

          <div className="stat-card stat-active">

            <div className="stat-icon service-icon">
              📋
            </div>

            <div className="stat-info">

              <h3>Total Requests</h3>

              <span className="stat-value">
                {totalRequests}
              </span>

              <small>
                All service requests
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon pending-icon">
              ⏳
            </div>

            <div className="stat-info">

              <h3>Pending</h3>

              <span className="stat-value">
                {pendingRequests}
              </span>

              <small>
                Need attention
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon progress-icon">
              🔄
            </div>

            <div className="stat-info">

              <h3>In Progress</h3>

              <span className="stat-value">
                {inProgressRequests}
              </span>

              <small>
                Currently working
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon completed-icon">
              ✓
            </div>

            <div className="stat-info">

              <h3>Completed</h3>

              <span className="stat-value">
                {completedRequests}
              </span>

              <small>
                Successfully completed
              </small>

            </div>

          </div>

        </section>

        {/* ================= CONTROLS ================= */}
        <section className="controls-bar">

          <div className="search-input-wrapper">

            <span className="search-icon-svg">
              🔍
            </span>

            <input
              type="text"
              className="search-input"
              placeholder="Search service requests..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                ✕
              </button>
            )}

          </div>

          <div className="filter-tabs">

            {[
              "All",
              "Pending",
              "In Progress",
              "Completed",
            ].map((filter) => (

              <button
                key={filter}
                className={`filter-tab-btn ${
                  activeFilter === filter
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveFilter(filter)
                }
              >
                {filter}
              </button>

            ))}

          </div>

        </section>

        {/* ================= TABLE ================= */}
        <section className="table-container">

          <div className="table-header">

            <div>

              <h2>
                Service Requests
              </h2>

              <p>
                {filteredRequests.length} request
                {filteredRequests.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

            <button
              className="refresh-btn"
              onClick={handleReset}
            >
              ↻ Reset
            </button>

          </div>

          {/* ================= LOADING ================= */}
          {loading ? (

            <div className="empty-state">

              <div className="empty-icon">
                ⏳
              </div>

              <h3>
                Loading Service Requests...
              </h3>

              <p>
                Please wait while requests are
                being loaded.
              </p>

            </div>

          ) : error ? (

            /* ================= ERROR ================= */
            <div className="empty-state">

              <div className="empty-icon">
                ⚠️
              </div>

              <h3>
                Unable to Load Service Requests
              </h3>

              <p>
                {error}
              </p>

              <button
                className="empty-reset-btn"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>

            </div>

          ) : filteredRequests.length > 0 ? (

            /* ================= DATA TABLE ================= */
            <div className="table-scroll">

              <table className="custom-table">

                <thead>

                  <tr>
                    <th>REQUEST ID</th>
                    <th>RESIDENT</th>
                    <th>SERVICE</th>
                    <th>REQUEST DETAILS</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                    <th>ACTION</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredRequests.map((request) => (

                    <tr key={request.id}>

                      {/* REQUEST ID */}
                      <td>

                        <span className="id-badge">
                          {request.id}
                        </span>

                      </td>

                      {/* RESIDENT */}
                      <td>

                        <div className="resident-cell">

                          <strong>
                            {request.resident}
                          </strong>

                          <small>
                            Flat {request.flat}
                          </small>

                        </div>

                      </td>

                      {/* SERVICE */}
                      <td>

                        <span className="category-tag">

                          {request.service ===
                            "Plumbing" && "🔧"}

                          {request.service ===
                            "Electrical" && "⚡"}

                          {request.service ===
                            "Carpentry" && "🪚"}

                          {request.service ===
                            "Cleaning" && "🧹"}

                          {request.service ===
                            "Water Supply" && "💧"}

                          {request.service ===
                            "Maintenance" && "⚙️"}

                          {![
                            "Plumbing",
                            "Electrical",
                            "Carpentry",
                            "Cleaning",
                            "Water Supply",
                            "Maintenance",
                          ].includes(request.service) &&
                            "📋"}

                          {" "}

                          {request.service}

                        </span>

                      </td>

                      {/* REQUEST DETAILS */}
                      <td>

                        <div className="issue-cell">

                          <strong>
                            {request.request}
                          </strong>

                          <p>
                            {request.description}
                          </p>

                        </div>

                      </td>

                      {/* PRIORITY */}
                      <td>

                        <span
                          className={`priority-pill ${String(
                            request.priority
                          ).toLowerCase()}`}
                        >
                          {request.priority}
                        </span>

                      </td>

                      {/* STATUS */}
                      <td>

                        <span
                          className={`status-badge ${String(
                            request.status
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {request.status}
                        </span>

                      </td>

                      {/* DATE */}
                      <td>

                        <span className="date-cell">
                          {request.date}
                        </span>

                      </td>

                      {/* ACTION */}
                      <td>

                        <div className="service-action-buttons">

                          {/* VIEW */}
                          <button
                            className="service-action-btn service-action-btn--view"
                            type="button"
                            onClick={() =>
                              handleViewRequest(request)
                            }
                          >
                            <Eye size={15} aria-hidden="true" />
                            View
                          </button>

                          {/* PENDING → IN PROGRESS */}
                          {request.status ===
                            "Pending" && (

                            <button
                              className="service-action-btn service-action-btn--start"
                              type="button"
                              onClick={() =>
                                handleStatusUpdate(
                                  request.id,
                                  "In Progress"
                                )
                              }
                              disabled={
                                updatingRequestId ===
                                request.id
                              }
                            >
                              {updatingRequestId ===
                              request.id
                                ? "Updating..."
                                : "Start Work"}
                              {updatingRequestId !== request.id && (
                                <Play size={14} aria-hidden="true" />
                              )}
                            </button>

                          )}

                          {/* IN PROGRESS → COMPLETED */}
                          {request.status ===
                            "In Progress" && (

                            <button
                              className="service-action-btn service-action-btn--complete"
                              type="button"
                              onClick={() =>
                                handleStatusUpdate(
                                  request.id,
                                  "Completed"
                                )
                              }
                              disabled={
                                updatingRequestId ===
                                request.id
                              }
                            >
                              {updatingRequestId ===
                              request.id
                                ? "Updating..."
                                : "Complete"}
                              {updatingRequestId !== request.id && (
                                <Check size={15} aria-hidden="true" />
                              )}
                            </button>

                          )}

                          {/* COMPLETED */}
                          {request.status ===
                            "Completed" && (

                            <span className="service-completed-label">
                              <Check size={14} aria-hidden="true" />
                              Completed
                            </span>

                          )}

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          ) : (

            /* ================= NO DATA ================= */
            <div className="empty-state">

              <div className="empty-icon">
                📭
              </div>

              <h3>
                No Service Requests Found
              </h3>

              <p>
                There are currently no service
                requests matching your filters.
              </p>

              <button
                className="empty-reset-btn"
                onClick={handleReset}
              >
                Reset Filters
              </button>

            </div>

          )}

        </section>

      </main>

      {selectedRequest && (
        <div
          className="service-request-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRequest(null);
            }
          }}
        >
          <section
            className="service-request-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-request-modal-title"
          >
            <header className="service-request-modal-header">
              <div>
                <span>REQUEST DETAILS · #{selectedRequest.id}</span>
                <h2 id="service-request-modal-title">{selectedRequest.service}</h2>
              </div>
              <button
                className="service-request-modal-close"
                type="button"
                aria-label="Close request details"
                onClick={() => setSelectedRequest(null)}
              >
                <X size={19} aria-hidden="true" />
              </button>
            </header>
            <div className="service-request-modal-body">
              <div className="service-request-modal-meta">
                <div><span>Resident</span><strong>{selectedRequest.resident}</strong></div>
                <div><span>Flat</span><strong>{selectedRequest.flat}</strong></div>
                <div>
                  <span>Status</span>
                  <strong className={`status-badge ${String(selectedRequest.status).toLowerCase().replace(/\s+/g, "-")}`}>
                    {selectedRequest.status}
                  </strong>
                </div>
                <div><span>Submitted</span><strong>{selectedRequest.date}</strong></div>
              </div>
              <div className="service-request-modal-description">
                <span>Request description</span>
                <p>{selectedRequest.description}</p>
              </div>
            </div>
            <footer className="service-request-modal-footer">
              <button
                className="service-action-btn service-action-btn--view"
                type="button"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
              {selectedRequest.status === "Pending" && (
                <button
                  className="service-action-btn service-action-btn--start"
                  type="button"
                  disabled={updatingRequestId === selectedRequest.id}
                  onClick={async () => {
                    const updated = await handleStatusUpdate(selectedRequest.id, "In Progress");
                    if (updated) {
                      setSelectedRequest((current) => current
                        ? { ...current, status: "In Progress" }
                        : current);
                    }
                  }}
                >
                  <Play size={14} aria-hidden="true" />
                  Start Work
                </button>
              )}
              {selectedRequest.status === "In Progress" && (
                <button
                  className="service-action-btn service-action-btn--complete"
                  type="button"
                  disabled={updatingRequestId === selectedRequest.id}
                  onClick={async () => {
                    const updated = await handleStatusUpdate(selectedRequest.id, "Completed");
                    if (updated) {
                      setSelectedRequest((current) => current
                        ? { ...current, status: "Completed" }
                        : current);
                    }
                  }}
                >
                  <Check size={15} aria-hidden="true" />
                  Complete
                </button>
              )}
            </footer>
          </section>
        </div>
      )}

    </div>
  );
}

export default StaffServiceRequests;
