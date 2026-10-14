import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../css/staff/staff_maintenance.css";
import "../../css/staff/staff_shared_theme.css";
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

  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMaintenance = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in again to view assigned maintenance work.");
      const response = await fetch("http://localhost:5000/api/staff/tasks", {
        headers: { Authorization: `Bearer ${token}` }, signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load maintenance work.");
      setMaintenance((data.tasks || []).map((task) => ({
        id: String(task.task_id),
        title: task.task_name || "Untitled task",
        description: task.description || "No description provided.",
        priority: task.priority || "Normal",
        status: task.status || "Pending",
        date: task.due_date ? new Date(task.due_date).toLocaleDateString() : "Not set",
      })));
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to load maintenance work.");
      setMaintenance([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchMaintenance(controller.signal);
    return () => controller.abort();
  }, [fetchMaintenance]);

  const filteredMaintenance = useMemo(() => {
    return maintenance.filter((item) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        item.id.toLowerCase().includes(search) ||
        item.title.toLowerCase().includes(search) ||
        item.priority.toLowerCase().includes(search);

      const matchesFilter =
        activeFilter === "All" || item.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [maintenance, searchTerm, activeFilter]);

  const totalMaintenance = maintenance.length;

  const scheduledCount = maintenance.filter(
    (item) => item.status === "Pending"
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

  const updateMaintenance = async (id, changes) => {
    try {
      const response = await fetch(`http://localhost:5000/api/staff/tasks/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save changes.");
      setMaintenance((previous) => previous.map((item) => item.id === id ? { ...item, ...changes } : item));
      setError("");
    } catch (err) {
      setError(err.message || "Unable to save changes.");
      fetchMaintenance();
    }
  };

  const handleView = (item) => {
    alert(
      `Maintenance Details\n\n` +
        `ID: ${item.id}\n` +
        `Title: ${item.title}\n` +
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

        <section className="staff-page-intro staff-page-intro--maintenance">
          <div><span className="staff-page-intro-kicker">PROPERTY CARE</span><h2>Keep every shared space running well.</h2><p>Review planned maintenance and follow each repair through to completion.</p></div>
          <div className="staff-page-intro-aside"><span>MAINTENANCE ITEMS</span><strong>{totalMaintenance}</strong><small>{completedCount} completed so far</small><i aria-hidden="true">⚙</i></div>
          <span className="staff-page-intro-art" aria-hidden="true">⌘</span>
        </section>

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
              <h3>Pending</h3>

              <span className="stat-value">{scheduledCount}</span>

              <small>Awaiting work</small>
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
              onClick={() => fetchMaintenance()}
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-icon">⏳</div><h3>Loading maintenance work...</h3><p>Fetching tasks assigned to you.</p></div>
          ) : error ? (
            <div className="empty-state"><div className="empty-icon">⚠️</div><h3>Unable to Load Maintenance</h3><p>{error}</p><button className="empty-reset-btn" onClick={() => fetchMaintenance()}>Try Again</button></div>
          ) : filteredMaintenance.length > 0 ? (
            <div className="table-scroll">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>TASK ID</th>
                    <th>MAINTENANCE DETAILS</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>DUE DATE</th>
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
                        <select
                          className={`status-select ${item.priority.toLowerCase()}`}
                          value={item.priority}
                          aria-label={`Change priority for ${item.title}`}
                          onChange={(e) => updateMaintenance(item.id, { priority: e.target.value })}
                        >
                          {["Low", "Medium", "Normal", "High", "Urgent"].map((priority) => (
                            <option key={priority} value={priority}>{priority}</option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <select
                          className={`status-select ${item.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                          value={item.status}
                          onChange={(e) =>
                            updateMaintenance(item.id, { status: e.target.value })
                          }
                        >
                          <option value="Pending">Pending</option>

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

                          <small>Due date</small>
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
