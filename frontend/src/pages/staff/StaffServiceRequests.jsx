import React, { useMemo, useState } from "react";
import "../../css/staff/staff_service_requests.css";
import { useNavigate } from "react-router-dom";

function StaffServiceRequests() {
  const navigate = useNavigate();

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

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const serviceRequests = [
    {
      id: "SR-001",
      resident: "Rahul Patel",
      flat: "A-204",
      service: "Plumbing",
      request: "Bathroom tap leakage",
      description: "Water leakage from bathroom tap.",
      priority: "High",
      status: "Pending",
      date: "28 Sep 2026",
    },
    {
      id: "SR-002",
      resident: "Neha Shah",
      flat: "B-102",
      service: "Electrical",
      request: "Ceiling fan repair",
      description: "Fan is making noise while running.",
      priority: "Medium",
      status: "In Progress",
      date: "27 Sep 2026",
    },
    {
      id: "SR-003",
      resident: "Amit Joshi",
      flat: "C-305",
      service: "Carpentry",
      request: "Door handle repair",
      description: "Main door handle is loose.",
      priority: "Medium",
      status: "Completed",
      date: "26 Sep 2026",
    },
    {
      id: "SR-004",
      resident: "Pooja Mehta",
      flat: "A-401",
      service: "Cleaning",
      request: "Deep cleaning request",
      description: "Resident requested deep cleaning.",
      priority: "Low",
      status: "Pending",
      date: "25 Sep 2026",
    },
    {
      id: "SR-005",
      resident: "Karan Desai",
      flat: "B-205",
      service: "Electrical",
      request: "Switch board issue",
      description: "One switch is not working properly.",
      priority: "High",
      status: "In Progress",
      date: "24 Sep 2026",
    },
  ];

  const filteredRequests = useMemo(() => {
    return serviceRequests.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.flat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.request.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || item.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, activeFilter]);

  const totalRequests = serviceRequests.length;
  const pendingRequests = serviceRequests.filter(
    (item) => item.status === "Pending"
  ).length;
  const inProgressRequests = serviceRequests.filter(
    (item) => item.status === "In Progress"
  ).length;
  const completedRequests = serviceRequests.filter(
    (item) => item.status === "Completed"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("staff");
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleViewRequest = (request) => {
    alert(
      `Service Request: ${request.id}\n\nResident: ${request.resident}\nFlat: ${request.flat}\nService: ${request.service}\nRequest: ${request.request}\nStatus: ${request.status}`
    );
  };

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

        <div className="sidebar-section-title">MAIN MENU</div>

        <nav className="sidebar-nav">
          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/dashboard")}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/complaints")}
          >
            <span className="nav-icon">🛠️</span>
            <span>Assigned Complaints</span>
          </button>

          <button
            className="nav-btn active"
            onClick={() => handleNavigation("/staff/service-requests")}
          >
            <span className="nav-icon">📋</span>
            <span>Service Requests</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/tasks")}
          >
            <span className="nav-icon">✅</span>
            <span>Tasks</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/maintenance")}
          >
            <span className="nav-icon">⚙️</span>
            <span>Maintenance</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/assets")}
          >
            <span className="nav-icon">📦</span>
            <span>Assets & Inventory</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/work-history")}
          >
            <span className="nav-icon">📜</span>
            <span>Work History</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/profile")}
          >
            <span className="nav-icon">👤</span>
            <span>My Profile</span>
          </button>
        </nav>

        {/* Sidebar User */}
        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="avatar-circle">{initials}</div>

            <div className="user-details">
              <strong>{fullName}</strong>
              <small>{staffType}</small>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="modern-main-content">
        {/* Header */}
        <header className="top-header">
          <div className="header-title">
            <span className="badge-tag">SERVICE REQUESTS</span>

            <h1>Service Requests</h1>

            <p>
              Manage and track service requests assigned to you.
            </p>
          </div>

          <div className="header-actions">
            <div
              className="profile-pill"
              onClick={() => handleNavigation("/staff/profile")}
            >
              <div className="avatar-sm">{initials}</div>
              <span>{fullName}</span>
            </div>
          </div>
        </header>

        {/* ================= STATS ================= */}
        <section className="stats-grid">
          <div className="stat-card stat-active">
            <div className="stat-icon service-icon">📋</div>

            <div className="stat-info">
              <h3>Total Requests</h3>
              <span className="stat-value">{totalRequests}</span>
              <small>Assigned to you</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending-icon">⏳</div>

            <div className="stat-info">
              <h3>Pending</h3>
              <span className="stat-value">{pendingRequests}</span>
              <small>Need attention</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon progress-icon">🔄</div>

            <div className="stat-info">
              <h3>In Progress</h3>
              <span className="stat-value">{inProgressRequests}</span>
              <small>Currently working</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed-icon">✓</div>

            <div className="stat-info">
              <h3>Completed</h3>
              <span className="stat-value">{completedRequests}</span>
              <small>Successfully completed</small>
            </div>
          </div>
        </section>

        {/* ================= CONTROLS ================= */}
        <section className="controls-bar">
          <div className="search-input-wrapper">
            <span className="search-icon-svg">🔍</span>

            <input
              type="text"
              className="search-input"
              placeholder="Search service requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-tabs">
            {["All", "Pending", "In Progress", "Completed"].map(
              (filter) => (
                <button
                  key={filter}
                  className={`filter-tab-btn ${
                    activeFilter === filter ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              )
            )}
          </div>
        </section>

        {/* ================= TABLE ================= */}
        <section className="table-container">
          <div className="table-header">
            <div>
              <h2>Assigned Service Requests</h2>
              <p>
                {filteredRequests.length} request
                {filteredRequests.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <button
              className="refresh-btn"
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("All");
              }}
            >
              ↻ Reset
            </button>
          </div>

          {filteredRequests.length > 0 ? (
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
                      <td>
                        <span className="id-badge">{request.id}</span>
                      </td>

                      <td>
                        <div className="resident-cell">
                          <strong>{request.resident}</strong>
                          <small>Flat {request.flat}</small>
                        </div>
                      </td>

                      <td>
                        <span className="category-tag">
                          {request.service === "Plumbing" && "🔧"}
                          {request.service === "Electrical" && "⚡"}
                          {request.service === "Carpentry" && "🪚"}
                          {request.service === "Cleaning" && "🧹"}
                          {" "}
                          {request.service}
                        </span>
                      </td>

                      <td>
                        <div className="issue-cell">
                          <strong>{request.request}</strong>
                          <p>{request.description}</p>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`priority-pill ${request.priority.toLowerCase()}`}
                        >
                          {request.priority}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${request.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {request.status}
                        </span>
                      </td>

                      <td>
                        <span className="date-cell">{request.date}</span>
                      </td>

                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleViewRequest(request)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>

              <h3>No Service Requests Found</h3>

              <p>
                Try changing your search or selecting another status filter.
              </p>

              <button
                className="empty-reset-btn"
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("All");
                }}
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