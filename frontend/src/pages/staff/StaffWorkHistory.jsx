import React, { useMemo, useState } from "react";
import "../../css/staff/staff_work_history.css";
import { useNavigate } from "react-router-dom";

function StaffWorkHistory() {
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

  const [workHistory, setWorkHistory] = useState([
    {
      id: "WRK-001",
      title: "Water Leakage Repair",
      category: "Plumbing",
      location: "Flat A-204",
      priority: "High",
      status: "Completed",
      date: "28 Sep 2026",
      duration: "2 hrs",
      description: "Bathroom water leakage repaired successfully.",
    },
    {
      id: "WRK-002",
      title: "Electrical Switch Replacement",
      category: "Electrical",
      location: "Block B - 2nd Floor",
      priority: "Medium",
      status: "Completed",
      date: "26 Sep 2026",
      duration: "1 hr",
      description: "Damaged electrical switches replaced.",
    },
    {
      id: "WRK-003",
      title: "Lift Inspection",
      category: "Inspection",
      location: "Block A",
      priority: "High",
      status: "Completed",
      date: "24 Sep 2026",
      duration: "1.5 hrs",
      description: "Monthly lift inspection completed.",
    },
    {
      id: "WRK-004",
      title: "Garden Maintenance",
      category: "Cleaning",
      location: "Main Garden",
      priority: "Low",
      status: "Completed",
      date: "22 Sep 2026",
      duration: "3 hrs",
      description: "Garden cleaning and maintenance completed.",
    },
    {
      id: "WRK-005",
      title: "Water Tank Cleaning",
      category: "Maintenance",
      location: "Block C",
      priority: "Medium",
      status: "Completed",
      date: "20 Sep 2026",
      duration: "4 hrs",
      description: "Overhead water tank cleaning completed.",
    },
    {
      id: "WRK-006",
      title: "Common Area Light Repair",
      category: "Electrical",
      location: "Block C - Ground Floor",
      priority: "Medium",
      status: "Completed",
      date: "18 Sep 2026",
      duration: "1 hr",
      description: "Faulty common area lights repaired.",
    },
    {
      id: "WRK-007",
      title: "AC Maintenance",
      category: "Maintenance",
      location: "Club House",
      priority: "Low",
      status: "Completed",
      date: "15 Sep 2026",
      duration: "2.5 hrs",
      description: "Routine AC maintenance completed.",
    },
  ]);

  const filteredHistory = useMemo(() => {
    return workHistory.filter((work) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        work.id.toLowerCase().includes(search) ||
        work.title.toLowerCase().includes(search) ||
        work.category.toLowerCase().includes(search) ||
        work.location.toLowerCase().includes(search) ||
        work.priority.toLowerCase().includes(search);

      const matchesFilter =
        activeFilter === "All" || work.category === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [workHistory, searchTerm, activeFilter]);

  const totalCompleted = workHistory.filter(
    (work) => work.status === "Completed"
  ).length;

  const totalHours = workHistory.reduce((total, work) => {
    const hours = parseFloat(work.duration);
    return total + (isNaN(hours) ? 0 : hours);
  }, 0);

  const highPriority = workHistory.filter(
    (work) => work.priority === "High"
  ).length;

  const thisMonth = workHistory.length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("staff");

    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleView = (work) => {
    alert(
      `Work Details\n\n` +
        `Work ID: ${work.id}\n` +
        `Title: ${work.title}\n` +
        `Category: ${work.category}\n` +
        `Location: ${work.location}\n` +
        `Priority: ${work.priority}\n` +
        `Status: ${work.status}\n` +
        `Date: ${work.date}\n` +
        `Duration: ${work.duration}\n\n` +
        `Description: ${work.description}`
    );
  };

  const handleDownload = () => {
    const rows = workHistory.map((work) => ({
      "Work ID": work.id,
      "Work Title": work.title,
      Category: work.category,
      Location: work.location,
      Priority: work.priority,
      Status: work.status,
      Date: work.date,
      Duration: work.duration,
    }));

    const headers = Object.keys(rows[0]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => `"${row[header]}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "staff_work_history.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
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
            className="nav-btn active"
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
        {/* HEADER */}

        <header className="top-header">
          <div className="header-title">
            <span className="badge-tag">WORK HISTORY</span>

            <h1>My Work History</h1>

            <p>
              Review completed tasks, repairs and maintenance work performed
              by you.
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
            <div className="stat-icon completed-icon">✓</div>

            <div className="stat-info">
              <h3>Completed Work</h3>

              <span className="stat-value">{totalCompleted}</span>

              <small>Successfully completed</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon hours-icon">⏱️</div>

            <div className="stat-info">
              <h3>Total Hours</h3>

              <span className="stat-value">
                {totalHours.toFixed(1)}
              </span>

              <small>Hours worked</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon priority-icon">⚡</div>

            <div className="stat-info">
              <h3>High Priority</h3>

              <span className="stat-value">{highPriority}</span>

              <small>Priority jobs handled</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon month-icon">📅</div>

            <div className="stat-info">
              <h3>This Month</h3>

              <span className="stat-value">{thisMonth}</span>

              <small>Work records</small>
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
              placeholder="Search work, category or location..."
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
            {[
              "All",
              "Plumbing",
              "Electrical",
              "Maintenance",
              "Cleaning",
              "Inspection",
            ].map((filter) => (
              <button
                key={filter}
                className={`filter-tab-btn ${
                  activeFilter === filter ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* ================= WORK HISTORY TABLE ================= */}

        <section className="table-container">
          <div className="table-header">
            <div>
              <h2>Completed Work Records</h2>

              <p>
                {filteredHistory.length} record
                {filteredHistory.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <button
              className="download-btn"
              onClick={handleDownload}
            >
              ⬇ Export CSV
            </button>
          </div>

          {filteredHistory.length > 0 ? (
            <div className="table-scroll">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>WORK ID</th>
                    <th>WORK DETAILS</th>
                    <th>CATEGORY</th>
                    <th>LOCATION</th>
                    <th>PRIORITY</th>
                    <th>DATE</th>
                    <th>DURATION</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHistory.map((work) => (
                    <tr key={work.id}>
                      <td>
                        <span className="id-badge">{work.id}</span>
                      </td>

                      <td>
                        <div className="work-cell">
                          <div className="work-avatar">
                            {work.category === "Plumbing" && "🚰"}

                            {work.category === "Electrical" && "⚡"}

                            {work.category === "Maintenance" && "🔧"}

                            {work.category === "Cleaning" && "🧹"}

                            {work.category === "Inspection" && "🔍"}
                          </div>

                          <div>
                            <strong>{work.title}</strong>

                            <small>{work.description}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="category-tag">
                          {work.category}
                        </span>
                      </td>

                      <td>
                        <span className="location-cell">
                          📍 {work.location}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`priority-pill ${work.priority.toLowerCase()}`}
                        >
                          {work.priority}
                        </span>
                      </td>

                      <td>
                        <span className="date-cell">
                          📅 {work.date}
                        </span>
                      </td>

                      <td>
                        <span className="duration-cell">
                          ⏱ {work.duration}
                        </span>
                      </td>

                      <td>
                        <span className="status-badge completed">
                          ✓ Completed
                        </span>
                      </td>

                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleView(work)}
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

              <h3>No Work History Found</h3>

              <p>
                Try changing your search or selecting another category.
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

export default StaffWorkHistory;