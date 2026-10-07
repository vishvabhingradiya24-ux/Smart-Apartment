import React, { useCallback, useEffect, useMemo, useState } from "react";
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

  const [workHistory, setWorkHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWorkHistory = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5000/api/staff/work-history", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load work history.");
      setWorkHistory((data.works || []).map((work) => ({
        id: String(work.task_id),
        title: work.task_name || "Completed task",
        category: "Task",
        location: "—",
        priority: work.priority || "Normal",
        status: work.status,
        date: work.completed_at ? new Date(work.completed_at).toLocaleDateString() : "—",
        dateValue: work.completed_at,
        duration: "Not tracked",
        description: work.description || "No description provided.",
      })));
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to load work history.");
      setWorkHistory([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchWorkHistory(controller.signal);
    return () => controller.abort();
  }, [fetchWorkHistory]);

  const filteredHistory = useMemo(() => {
    return workHistory.filter((work) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        work.id.toLowerCase().includes(search) ||
        work.title.toLowerCase().includes(search) ||
        work.priority.toLowerCase().includes(search) ||
        work.description.toLowerCase().includes(search);

      const matchesFilter =
        activeFilter === "All" || work.category === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [workHistory, searchTerm, activeFilter]);

  const totalCompleted = workHistory.filter(
    (work) => work.status === "Completed"
  ).length;

  const totalHours = "—";

  const highPriority = workHistory.filter(
    (work) => work.priority === "High"
  ).length;

  const now = new Date();
  const thisMonth = workHistory.filter((work) => {
    if (!work.dateValue) return false;
    const workDate = new Date(work.dateValue);
    return workDate.getMonth() === now.getMonth() && workDate.getFullYear() === now.getFullYear();
  }).length;

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
        `Priority: ${work.priority}\n` +
        `Status: ${work.status}\n` +
        `Date: ${work.date}\n` +
        `Description: ${work.description}`
    );
  };

  const handleDownload = () => {
    if (workHistory.length === 0) return;
    const rows = workHistory.map((work) => ({
      "Work ID": work.id,
      "Work Title": work.title,
      Priority: work.priority,
      Status: work.status,
      Date: work.date,
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

              <span className="stat-value">{totalHours}</span>

              <small>Duration not recorded</small>
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

              <small>Completed this month</small>
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
            {["All"].map((filter) => (
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
              disabled={workHistory.length === 0}
            >
              ⬇ Export CSV
            </button>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-icon">⏳</div><h3>Loading work history...</h3><p>Fetching completed tasks from the database.</p></div>
          ) : error ? (
            <div className="empty-state"><div className="empty-icon">⚠️</div><h3>Unable to Load Work History</h3><p>{error}</p><button className="empty-reset-btn" onClick={() => fetchWorkHistory()}>Try Again</button></div>
          ) : filteredHistory.length > 0 ? (
            <div className="table-scroll">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>WORK ID</th>
                    <th>WORK DETAILS</th>
                    <th>PRIORITY</th>
                    <th>DATE</th>
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
                            🔧
                          </div>

                          <div>
                            <strong>{work.title}</strong>

                            <small>{work.description}</small>
                          </div>
                        </div>
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
