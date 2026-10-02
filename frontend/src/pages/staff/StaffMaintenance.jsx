import React, { useMemo, useState } from "react";
import "../../css/staff/staff_maintenance.css";
import { useNavigate } from "react-router-dom";

function StaffMaintenance() {
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

  const [maintenance, setMaintenance] = useState([
    {
      id: "MNT-001",
      title: "Water Tank Cleaning",
      category: "Plumbing",
      location: "Building A",
      priority: "High",
      status: "Scheduled",
      date: "30 Sep 2026",
      description: "Clean and inspect the overhead water tank.",
    },
    {
      id: "MNT-002",
      title: "Lift Maintenance",
      category: "Electrical",
      location: "Block B",
      priority: "Urgent",
      status: "In Progress",
      date: "29 Sep 2026",
      description: "Routine lift inspection and maintenance work.",
    },
    {
      id: "MNT-003",
      title: "Garden Maintenance",
      category: "Garden",
      location: "Garden Area",
      priority: "Medium",
      status: "Completed",
      date: "27 Sep 2026",
      description: "Complete trimming, cleaning and garden maintenance.",
    },
    {
      id: "MNT-004",
      title: "Electrical Panel Inspection",
      category: "Electrical",
      location: "Block C",
      priority: "High",
      status: "Scheduled",
      date: "01 Oct 2026",
      description: "Inspect electrical panels and check loose connections.",
    },
    {
      id: "MNT-005",
      title: "Common Area Cleaning",
      category: "Cleaning",
      location: "Block A",
      priority: "Low",
      status: "In Progress",
      date: "02 Oct 2026",
      description: "Deep cleaning of common society areas.",
    },
  ]);

  const filteredMaintenance = useMemo(() => {
    return maintenance.filter((item) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        item.id.toLowerCase().includes(search) ||
        item.title.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        item.location.toLowerCase().includes(search) ||
        item.priority.toLowerCase().includes(search);

      const matchesFilter =
        activeFilter === "All" || item.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [maintenance, searchTerm, activeFilter]);

  const totalMaintenance = maintenance.length;

  const scheduledCount = maintenance.filter(
    (item) => item.status === "Scheduled"
  ).length;

  const inProgressCount = maintenance.filter(
    (item) => item.status === "In Progress"
  ).length;

  const completedCount = maintenance.filter(
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

  const updateStatus = (id, newStatus) => {
    setMaintenance((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );
  };

  const handleView = (item) => {
    alert(
      `Maintenance Details\n\n` +
        `ID: ${item.id}\n` +
        `Title: ${item.title}\n` +
        `Category: ${item.category}\n` +
        `Location: ${item.location}\n` +
        `Priority: ${item.priority}\n` +
        `Status: ${item.status}\n` +
        `Scheduled Date: ${item.date}\n\n` +
        `${item.description}`
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
            className="nav-btn"
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
            className="nav-btn active"
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
        <header className="top-header">
          <div className="header-title">
            <span className="badge-tag">MAINTENANCE MANAGEMENT</span>

            <h1>Maintenance</h1>

            <p>
              Schedule, monitor and manage society maintenance activities.
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
            <div className="stat-icon maintenance-icon">⚙️</div>

            <div className="stat-info">
              <h3>Total Maintenance</h3>

              <span className="stat-value">{totalMaintenance}</span>

              <small>Maintenance records</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon scheduled-icon">📅</div>

            <div className="stat-info">
              <h3>Scheduled</h3>

              <span className="stat-value">{scheduledCount}</span>

              <small>Upcoming work</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon progress-icon">🔄</div>

            <div className="stat-info">
              <h3>In Progress</h3>

              <span className="stat-value">{inProgressCount}</span>

              <small>Currently running</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed-icon">✓</div>

            <div className="stat-info">
              <h3>Completed</h3>

              <span className="stat-value">{completedCount}</span>

              <small>Successfully completed</small>
            </div>
          </div>
        </section>

        {/* ================= SEARCH & FILTER ================= */}

        <section className="controls-bar">
          <div className="search-input-wrapper">
            <span className="search-icon-svg">🔍</span>

            <input
              type="text"
              className="search-input"
              placeholder="Search maintenance..."
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
            {["All", "Scheduled", "In Progress", "Completed"].map(
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

        {/* ================= MAINTENANCE TABLE ================= */}

        <section className="table-container">
          <div className="table-header">
            <div>
              <h2>Maintenance Schedule</h2>

              <p>
                {filteredMaintenance.length} maintenance record
                {filteredMaintenance.length !== 1 ? "s" : ""} found
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

          {filteredMaintenance.length > 0 ? (
            <div className="table-scroll">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>MAINTENANCE ID</th>
                    <th>MAINTENANCE DETAILS</th>
                    <th>CATEGORY</th>
                    <th>LOCATION</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>SCHEDULED DATE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMaintenance.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="id-badge">{item.id}</span>
                      </td>

                      <td>
                        <div className="maintenance-cell">
                          <strong>{item.title}</strong>

                          <p>{item.description}</p>
                        </div>
                      </td>

                      <td>
                        <span className="category-tag">
                          {item.category === "Plumbing" && "🚰"}

                          {item.category === "Electrical" && "⚡"}

                          {item.category === "Garden" && "🌱"}

                          {item.category === "Cleaning" && "🧹"}

                          {" "}
                          {item.category}
                        </span>
                      </td>

                      <td>
                        <span className="location-cell">
                          📍 {item.location}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`priority-pill ${item.priority.toLowerCase()}`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      <td>
                        <select
                          className={`status-select ${item.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                          value={item.status}
                          onChange={(e) =>
                            updateStatus(item.id, e.target.value)
                          }
                        >
                          <option value="Scheduled">Scheduled</option>

                          <option value="In Progress">
                            In Progress
                          </option>

                          <option value="Completed">
                            Completed
                          </option>
                        </select>
                      </td>

                      <td>
                        <div className="date-cell">
                          <strong>{item.date}</strong>

                          <small>Scheduled work</small>
                        </div>
                      </td>

                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleView(item)}
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

              <h3>No Maintenance Found</h3>

              <p>
                Try changing your search or selecting another status.
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

export default StaffMaintenance;