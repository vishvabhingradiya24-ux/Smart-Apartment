import React, { useEffect, useMemo, useState } from "react";
import "../../css/staff/staff_service_requests.css";
import { useNavigate } from "react-router-dom";

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
  const staffType = staff?.staff_type || "Maintenance Staff";

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

        console.log("STAFF SERVICE REQUEST RESPONSE:", data);

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
        return;
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

      console.log("STATUS UPDATE RESPONSE:", data);

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
    } catch (error) {
      console.error(
        "Update Service Request Status Error:",
        error
      );

      alert(
        error?.message ||
          "Unable to update service request status."
      );
    } finally {
      setUpdatingRequestId(null);
    }
  };

  // ================= VIEW REQUEST =================
  const handleViewRequest = (request) => {
    alert(
      `Service Request: ${request.id}\n\n` +
        `Resident: ${request.resident}\n` +
        `Flat: ${request.flat}\n` +
        `Service: ${request.service}\n` +
        `Description: ${request.description}\n` +
        `Status: ${request.status}\n` +
        `Date: ${request.date}`
    );
  };

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

        <nav className="sidebar-nav">

          <button
            className="nav-btn"
            onClick={() =>
              handleNavigation("/staff/dashboard")
            }
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>

          <button
            className="nav-btn"
            onClick={() =>
              handleNavigation("/staff/complaints")
            }
          >
            <span className="nav-icon">🛠️</span>
            <span>Assigned Complaints</span>
          </button>

          <button
            className="nav-btn active"
            onClick={() =>
              handleNavigation("/staff/service-requests")
            }
          >
            <span className="nav-icon">📋</span>
            <span>Service Requests</span>
          </button>

          <button
            className="nav-btn"
            onClick={() =>
              handleNavigation("/staff/tasks")
            }
          >
            <span className="nav-icon">✅</span>
            <span>Tasks</span>
          </button>

          <button
            className="nav-btn"
            onClick={() =>
              handleNavigation("/staff/maintenance")
            }
          >
            <span className="nav-icon">⚙️</span>
            <span>Maintenance</span>
          </button>

          <button
            className="nav-btn"
            onClick={() =>
              handleNavigation("/staff/assets")
            }
          >
            <span className="nav-icon">📦</span>
            <span>Assets & Inventory</span>
          </button>

          <button
            className="nav-btn"
            onClick={() =>
              handleNavigation("/staff/work-history")
            }
          >
            <span className="nav-icon">📜</span>
            <span>Work History</span>
          </button>

          <button
            className="nav-btn"
            onClick={() =>
              handleNavigation("/staff/profile")
            }
          >
            <span className="nav-icon">👤</span>
            <span>My Profile</span>
          </button>

        </nav>

        {/* ================= SIDEBAR USER ================= */}
        <div className="sidebar-footer">

          <div className="user-profile-summary">

            <div className="avatar-circle">
              {initials}
            </div>

            <div className="user-details">
              <strong>{fullName}</strong>
              <small>{staffType}</small>
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

                        <div
                          className="service-action-buttons"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >

                          {/* VIEW */}
                          <button
                            className="action-btn"
                            onClick={() =>
                              handleViewRequest(request)
                            }
                            disabled={
                              updatingRequestId ===
                              request.id
                            }
                          >
                            View
                          </button>

                          {/* PENDING → IN PROGRESS */}
                          {request.status ===
                            "Pending" && (

                            <button
                              className="action-btn"
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
                            </button>

                          )}

                          {/* IN PROGRESS → COMPLETED */}
                          {request.status ===
                            "In Progress" && (

                            <button
                              className="action-btn"
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
                            </button>

                          )}

                          {/* COMPLETED */}
                          {request.status ===
                            "Completed" && (

                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                opacity: 0.7,
                              }}
                            >
                              ✓ Completed
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

    </div>
  );
}

export default StaffServiceRequests;
