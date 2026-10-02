import React, { useMemo, useState } from "react";
import "../../css/staff/staff_tasks.css";
import { useNavigate } from "react-router-dom";

function StaffTasks() {
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

  const [tasks, setTasks] = useState([
    {
      id: "TSK-001",
      title: "Water Tank Inspection",
      category: "Inspection",
      location: "Building A",
      priority: "High",
      status: "Pending",
      dueDate: "30 Sep 2026",
      assignedDate: "28 Sep 2026",
      description: "Inspect overhead water tank and check water level.",
    },
    {
      id: "TSK-002",
      title: "Garden Maintenance",
      category: "Maintenance",
      location: "Garden Area",
      priority: "Medium",
      status: "In Progress",
      dueDate: "29 Sep 2026",
      assignedDate: "27 Sep 2026",
      description: "Complete garden cleaning and plant maintenance.",
    },
    {
      id: "TSK-003",
      title: "Lift Area Cleaning",
      category: "Cleaning",
      location: "Block B",
      priority: "Low",
      status: "Completed",
      dueDate: "27 Sep 2026",
      assignedDate: "26 Sep 2026",
      description: "Clean lift entrance and surrounding common area.",
    },
    {
      id: "TSK-004",
      title: "Electrical Panel Check",
      category: "Electrical",
      location: "Block C",
      priority: "Urgent",
      status: "Pending",
      dueDate: "30 Sep 2026",
      assignedDate: "29 Sep 2026",
      description: "Check electrical panel for loose connections.",
    },
    {
      id: "TSK-005",
      title: "Parking Area Inspection",
      category: "Inspection",
      location: "Parking Area",
      priority: "Medium",
      status: "In Progress",
      dueDate: "01 Oct 2026",
      assignedDate: "29 Sep 2026",
      description: "Inspect parking area and report maintenance issues.",
    },
  ]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        task.id.toLowerCase().includes(search) ||
        task.title.toLowerCase().includes(search) ||
        task.category.toLowerCase().includes(search) ||
        task.location.toLowerCase().includes(search) ||
        task.priority.toLowerCase().includes(search);

      const matchesFilter =
        activeFilter === "All" || task.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchTerm, activeFilter]);

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
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

  const updateTaskStatus = (id, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: newStatus,
            }
          : task
      )
    );
  };

  const handleViewTask = (task) => {
    alert(
      `Task Details\n\n` +
        `Task ID: ${task.id}\n` +
        `Title: ${task.title}\n` +
        `Category: ${task.category}\n` +
        `Location: ${task.location}\n` +
        `Priority: ${task.priority}\n` +
        `Status: ${task.status}\n` +
        `Due Date: ${task.dueDate}\n\n` +
        `${task.description}`
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
            className="nav-btn active"
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

        {/* User Profile */}

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
            <span className="badge-tag">TASK MANAGEMENT</span>

            <h1>My Tasks</h1>

            <p>
              View, manage and complete your assigned daily tasks.
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
            <div className="stat-icon task-icon">✅</div>

            <div className="stat-info">
              <h3>Total Tasks</h3>

              <span className="stat-value">{totalTasks}</span>

              <small>Assigned to you</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending-icon">⏳</div>

            <div className="stat-info">
              <h3>Pending</h3>

              <span className="stat-value">{pendingTasks}</span>

              <small>Need attention</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon progress-icon">🔄</div>

            <div className="stat-info">
              <h3>In Progress</h3>

              <span className="stat-value">{inProgressTasks}</span>

              <small>Currently working</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed-icon">🏆</div>

            <div className="stat-info">
              <h3>Completed</h3>

              <span className="stat-value">{completedTasks}</span>

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
              placeholder="Search tasks..."
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

        {/* ================= TASK TABLE ================= */}

        <section className="table-container">
          <div className="table-header">
            <div>
              <h2>Assigned Tasks</h2>

              <p>
                {filteredTasks.length} task
                {filteredTasks.length !== 1 ? "s" : ""} found
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

          {filteredTasks.length > 0 ? (
            <div className="table-scroll">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>TASK ID</th>
                    <th>TASK DETAILS</th>
                    <th>CATEGORY</th>
                    <th>LOCATION</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>DUE DATE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      {/* Task ID */}

                      <td>
                        <span className="id-badge">{task.id}</span>
                      </td>

                      {/* Task Details */}

                      <td>
                        <div className="task-cell">
                          <strong>{task.title}</strong>

                          <p>{task.description}</p>
                        </div>
                      </td>

                      {/* Category */}

                      <td>
                        <span className="category-tag">
                          {task.category === "Inspection" && "🔍"}

                          {task.category === "Maintenance" && "🔧"}

                          {task.category === "Cleaning" && "🧹"}

                          {task.category === "Electrical" && "⚡"}

                          {" "}

                          {task.category}
                        </span>
                      </td>

                      {/* Location */}

                      <td>
                        <span className="location-cell">
                          📍 {task.location}
                        </span>
                      </td>

                      {/* Priority */}

                      <td>
                        <span
                          className={`priority-pill ${task.priority.toLowerCase()}`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Status */}

                      <td>
                        <select
                          className={`status-select ${task.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                          value={task.status}
                          onChange={(e) =>
                            updateTaskStatus(
                              task.id,
                              e.target.value
                            )
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

                      {/* Due Date */}

                      <td>
                        <div className="date-cell">
                          <strong>{task.dueDate}</strong>

                          <small>
                            Assigned: {task.assignedDate}
                          </small>
                        </div>
                      </td>

                      {/* Action */}

                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleViewTask(task)}
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

              <h3>No Tasks Found</h3>

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

export default StaffTasks;