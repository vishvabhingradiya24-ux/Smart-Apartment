
import { useCallback, useEffect, useState } from "react";
import "../../css/staff/staff_dashboard.css";
import "../../css/staff/staff_shared_theme.css";
import { useNavigate } from "react-router-dom";
import { workSummary } from "../../constants/workDepartments";
import StaffNav from "../../components/StaffNav";
import { staffMenuFor } from "../../constants/staffMenu";
import { buildDashboardCards } from "../../constants/staffDashboardCards";

const mergeStoredStaff = (serverStaff) => {
  let currentStaff = {};
  try {
    currentStaff = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Unable to read stored staff profile:", error);
  }

  const updatedStaff = { ...currentStaff, ...serverStaff };
  try {
    localStorage.setItem("user", JSON.stringify(updatedStaff));
  } catch (error) {
    console.error("Unable to store refreshed staff profile:", error);
  }
  return updatedStaff;
};

function StaffDashboard() {
  const navigate = useNavigate();

  const [staff, setStaff] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const firstName = staff?.first_name || staff?.name || "Staff";
  const lastName = staff?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();


  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`
      .toUpperCase() || "S";

  /* =========================
     CURRENT DATE & TIME
  ========================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const requestDashboard = useCallback(async (signal) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Login session expired. Please sign in again.");
    }

      const response = await fetch("http://localhost:5000/api/staff/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unable to load dashboard data.");
    }
    return data;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    requestDashboard(controller.signal)
      .then((data) => {
        setDashboard(data);
        if (data.staff) {
          setStaff(mergeStoredStaff(data.staff));
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setDashboard(null);
        setDashboardError(error.message || "Unable to load dashboard data.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setDashboardLoading(false);
      });
    return () => controller.abort();
  }, [requestDashboard]);

  const retryDashboard = () => {
    setDashboardLoading(true);
    setDashboardError("");
    requestDashboard()
      .then((data) => {
        setDashboard(data);
        if (data.staff) {
          setStaff(mergeStoredStaff(data.staff));
        }
      })
      .catch((error) => {
        setDashboard(null);
        setDashboardError(error.message || "Unable to load dashboard data.");
      })
      .finally(() => setDashboardLoading(false));
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("staff");

    navigate("/login");
  };

  /* =========================
     NAVIGATION
  ========================= */

  const handleNavigation = (path) => {
    setSidebarOpen(false);

    if (path) {
      navigate(path);
    }
  };

  /* =========================
     SERVICE DATA
  ========================= */

  const allServices = [
    {
      id: 1,
      icon: "🛠️",
      title: "Assigned Complaints",
      description:
        "Track, inspect, and resolve resident reported complaints.",
      path: "/staff/complaints",
    },
    {
      id: 2,
      icon: "📋",
      title: "Service Requests",
      description:
        "Manage resident service requests and update their progress.",
      path: "/staff/service-requests",
    },
    {
      id: 3,
      icon: "✅",
      title: "My Tasks",
      description:
        "View daily tasks, inspections, and assigned activities.",
      path: "/staff/tasks",
    },
    {
      id: 4,
      icon: "⚙️",
      title: "Maintenance",
      description:
        "Manage scheduled maintenance, repairs, and work updates.",
      path: "/staff/maintenance",
    },
    {
      id: 5,
      icon: "📦",
      title: "Assets & Inventory",
      description:
        "Check equipment status and manage inventory information.",
      path: "/staff/assets",
    },
    {
      id: 6,
      icon: "📜",
      title: "Work History",
      description:
        "Review completed tasks and previous monthly activities.",
      path: "/staff/work-history",
    },
    {
      id: 7,
      icon: "🚪",
      title: "Visitors",
      description:
        "Register visitors, record entry and exit, and see who is inside.",
      path: "/staff/visitors",
    },
    {
      id: 8,
      icon: "📝",
      title: staff.department === "Security" ? "Incident Report" : "Report an Issue",
      description:
        staff.department === "Security"
          ? "Report suspicious activity or incidents to the Supervisor and Admin."
          : "Report unsafe or complex issues to the supervisor.",
      path: "/staff/report-issue",
    },
    {
      id: 9,
      icon: "👥",
      title: "Staff Overview",
      description:
        "See every staff member, their work status and task counts.",
      path: "/staff/supervisor/staff",
    },
    {
      id: 10,
      icon: "🗂️",
      title: "Task Management",
      description:
        "Create, assign and reassign tasks and track their progress.",
      path: "/staff/supervisor/tasks",
    },
    {
      id: 11,
      icon: "📡",
      title: "Complaint Monitoring",
      description:
        "Follow every complaint, who it is assigned to and its status.",
      path: "/staff/supervisor/complaints",
    },
    {
      id: 12,
      icon: "🔍",
      title: "Work Verification",
      description:
        "Check completed work and approve it or reopen it.",
      path: "/staff/supervisor/verification",
    },
    {
      id: 13,
      icon: "📈",
      title: "Reports",
      description:
        "Daily work, staff-wise tasks, pending, completed and overdue work.",
      path: "/staff/supervisor/reports",
    },
    {
      id: 14,
      icon: "🚨",
      title: "Incident Reports",
      description:
        "Incidents and issues reported by Security and other staff.",
      path: "/staff/supervisor/incidents",
    },
  ];

  // Only show the cards for pages in this staff member's menu.
  const allowedPaths = new Set(
    staffMenuFor(staff.department).map((item) => item.path)
  );

  const services = allServices.filter((service) =>
    allowedPaths.has(service.path)
  );

  /* =========================
     SEARCH
  ========================= */

  const filteredServices = (() => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) {
      return services;
    }

    return services.filter(
      (service) =>
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
    );
  })();

  const counts = dashboard?.counts;
  const displayCount = (value) =>
    dashboardLoading ? "…" : counts ? Number(value || 0) : "—";
  const hasAssignedWork = counts && (
    Number(counts.complaints_total || 0) > 0 ||
    Number(counts.service_requests_total || 0) > 0 ||
    Number(counts.tasks_pending || 0) > 0 ||
    Number(counts.tasks_in_progress || 0) > 0 ||
    Number(counts.tasks_completed || 0) > 0
  );
  const allStats = buildDashboardCards({
    department: staff.department,
    counts,
    security: dashboard?.security,
    supervisor: dashboard?.supervisor,
    display: displayCount,
  });

  const stats = allStats.filter((stat) => allowedPaths.has(stat.path));

  return (
    <div className="modern-staff-layout">

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {sidebarOpen && (
        <div
          className="staff-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`modern-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        {/* Brand */}

        <div className="brand-header">

          <div className="brand-icon">
            🏢
          </div>

          <div className="brand-info">
            <h3>Smart Apartment</h3>
            <span>Staff Portal</span>
          </div>

          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>

        </div>


        <div className="sidebar-section-title">
          MAIN MENU
        </div>


        {/* Navigation */}
                <StaffNav onNavigate={handleNavigation} />


        {/* Sidebar Footer */}

        <div className="sidebar-footer">

          <div className="user-profile-summary">

            <div className="avatar-circle">
              {initials}
            </div>

            <div className="user-details">
              <strong>{fullName}</strong>
              <small>{staff.department || "Department not set"}</small>
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


      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="modern-main-content">

        {/* =====================================
            TOP HEADER
        ===================================== */}

        <header className="top-header">

          <div className="header-title">

            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <span className="badge-tag">
              {staff.department ? `${staff.department.toUpperCase()} DEPARTMENT` : "STAFF WORKSPACE"}
            </span>

            <h1>
              Welcome back, {firstName}!
            </h1>

            <p>
              {staff.department
                ? `You receive ${workSummary(staff.department)}.`
                : "Set your department in My Profile to complete your staff dashboard."}
            </p>

          </div>


          <div className="header-actions">

            {/* Date / Time */}

            <div className="header-datetime">
              <strong>{formattedTime}</strong>
              <span>{formattedDate}</span>
            </div>


            {/* Profile */}

            <button
              className="profile-pill"
              onClick={() =>
                handleNavigation("/staff/profile")
              }
            >

              <div className="avatar-sm">
                {initials}
              </div>

              <div className="profile-pill-info">
                <strong>{fullName}</strong>
                <span>{staff.department || "Department not set"}</span>
              </div>

              <span className="profile-arrow">
                ›
              </span>

            </button>

          </div>

        </header>

        {dashboardError && (
          <div className="dashboard-data-error" role="alert">
            <span>{dashboardError}</span>
            <button
              type="button"
              onClick={retryDashboard}
            >
              Retry
            </button>
          </div>
        )}

        {!dashboardLoading && !dashboardError && !staff.department && (
          <div className="dashboard-data-error" role="status">
            <span>Select your department to complete your dashboard profile.</span>
            <button type="button" onClick={() => handleNavigation("/staff/profile")}>
              Set department
            </button>
          </div>
        )}

        {!dashboardLoading && !dashboardError && counts && !hasAssignedWork && (
          <div className="dashboard-data-empty" role="status">
            No complaints, service requests, or tasks are assigned to your account in the database yet.
            Ask your administrator to assign work; it will appear here automatically.
          </div>
        )}


        {/* =====================================
            WELCOME HERO
        ===================================== */}

        <section className="staff-welcome-banner">

          <div className="welcome-banner-content">

            <span>
              TODAY'S WORKSPACE
            </span>

            <h2>
              Keep your community
              <br />
              running smoothly.
            </h2>

            <p>
              Stay on top of complaints, requests,
              maintenance and daily tasks from one
              simple workspace.
            </p>


            <div className="welcome-actions">

              <button
                className="primary-action-btn"
                onClick={() =>
                  handleNavigation(
                    "/staff/complaints"
                  )
                }
              >
                <span>View My Work</span>
                <span>→</span>
              </button>


              <button
                className="secondary-action-btn"
                onClick={() =>
                  setShowQuickActions(
                    !showQuickActions
                  )
                }
              >
                Quick Actions
                <span>⌄</span>
              </button>

            </div>


            {showQuickActions && (
              <div className="quick-actions-menu">

                <button
                  onClick={() =>
                    handleNavigation(
                      "/staff/complaints"
                    )
                  }
                >
                  🛠️ View Complaints
                </button>

                <button
                  onClick={() =>
                    handleNavigation(
                      "/staff/service-requests"
                    )
                  }
                >
                  📋 Service Requests
                </button>

                <button
                  onClick={() =>
                    handleNavigation(
                      "/staff/tasks"
                    )
                  }
                >
                  ✅ My Tasks
                </button>

              </div>
            )}

          </div>


          <div className="welcome-banner-visual">

            <div className="welcome-circle large"></div>
            <div className="welcome-circle medium"></div>

            <div className="welcome-user-card">

              <div className="welcome-user-avatar">
                {initials}
              </div>

              <div>
                <span>{staff.department?.toUpperCase() || "DEPARTMENT NOT SET"}</span>
                <strong>{fullName}</strong>
              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            QUICK STATS
        ===================================== */}

        <section className="stats-section">

          <div className="section-header">

            <div>
              <span className="section-kicker">
                OVERVIEW
              </span>

              <h2>
                Your Work Summary
              </h2>
            </div>

            <p>
              A quick look at your current workload.
            </p>

          </div>


          <div className="stats-grid">

            {stats.map((stat) => (
              <button
                key={stat.title}
                className={`stat-card ${stat.className}`}
                onClick={() =>
                  handleNavigation(stat.path)
                }
              >

                <div className="stat-icon">
                  {stat.icon}
                </div>

                <div className="stat-info">

                  <h3>
                    {stat.title}
                  </h3>

                  <span className="stat-value">
                    {stat.value}
                  </span>

                  <small>
                    {stat.description}
                  </small>

                </div>

                <span className="stat-arrow">
                  ↗
                </span>

              </button>
            ))}

          </div>

        </section>


        {/* =====================================
            SERVICES
        ===================================== */}

        <section className="services-section">

          <div className="section-header services-header">

            <div>

              <span className="section-kicker">
                STAFF SERVICES
              </span>

              <h2>
                Quick Management Services
              </h2>

            </div>

            <div className="services-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                >
                  ×
                </button>
              )}

            </div>

          </div>


          <p className="services-subtitle">
            Select a module below to manage your
            daily society operations.
          </p>


          <div className="services-grid">

            {filteredServices.length > 0 ? (
              filteredServices.map((service, index) => (
                <button
                  key={service.id}
                  className={`service-card ${
                    index === 0
                      ? "service-card-featured"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(service.path)
                  }
                >

                  <div className="card-top">

                    <span className="card-icon">
                      {service.icon}
                    </span>

                    <span className="arrow-icon">
                      ↗
                    </span>

                  </div>


                  <div className="service-card-content">

                    <h3>
                      {service.title}
                    </h3>

                    <p>
                      {service.description}
                    </p>

                  </div>


                  <span className="service-card-link">
                    Open service →
                  </span>

                </button>
              ))
            ) : (

              <div className="no-services-found">

                <div>
                  🔎
                </div>

                <h3>
                  No service found
                </h3>

                <p>
                  Try searching with another keyword.
                </p>

                <button
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </button>

              </div>

            )}

          </div>

        </section>


        {/* =====================================
            WORK STATUS
        ===================================== */}

        <section className="staff-bottom-grid">

          {/* Task Status */}

          <div className="dashboard-panel">

            <div className="panel-header">

              <div>
                <span className="section-kicker">
                  TASK MANAGEMENT
                </span>

                <h2>
                  Work Status
                </h2>
              </div>

              <button
                onClick={() =>
                  handleNavigation("/staff/tasks")
                }
              >
                View Tasks →
              </button>

            </div>


            <div className="work-status-list">

              <div className="work-status-row">

                <div className="status-left">
                  <span className="status-dot pending"></span>
                  <span>Pending</span>
                </div>

                <strong>{displayCount(counts?.tasks_pending)}</strong>

              </div>


              <div className="work-status-row">

                <div className="status-left">
                  <span className="status-dot progress"></span>
                  <span>In Progress</span>
                </div>

                <strong>{displayCount(counts?.tasks_in_progress)}</strong>

              </div>


              <div className="work-status-row">

                <div className="status-left">
                  <span className="status-dot completed"></span>
                  <span>Completed</span>
                </div>

                <strong>{displayCount(counts?.tasks_completed)}</strong>

              </div>

            </div>

          </div>


          {/* Profile / Availability */}

          <div className="dashboard-panel staff-profile-panel">

            <div className="panel-profile-top">

              <div className="panel-avatar">
                {initials}
              </div>

              <div>

                <span className="section-kicker">
                  YOUR PROFILE
                </span>

                <h2>
                  {fullName}
                </h2>

                <p>
                  {staff.department || "Department not set"}
                </p>

              </div>

            </div>


            <div className="availability-status">

              <span className="online-dot"></span>

              <div>
                <strong>Current assignments</strong>
                <small>
                  {dashboardLoading
                    ? "Loading assigned work…"
                    : counts
                      ? `${Number(counts.complaints_open || 0) + Number(counts.service_requests_open || 0) + Number(counts.tasks_pending || 0) + Number(counts.tasks_in_progress || 0)} open assignments`
                      : "Assignment data unavailable"}
                </small>
              </div>

            </div>


            <button
              className="profile-panel-btn"
              onClick={() =>
                handleNavigation("/staff/profile")
              }
            >
              Manage Profile →
            </button>

          </div>

        </section>


        {/* =====================================
            RECENT ACTIVITY
        ===================================== */}

        <section className="activity-section">

          <div className="section-header">

            <div>

              <span className="section-kicker">
                YOUR SPACE
              </span>

              <h2>
                Recent Work Activity
              </h2>

            </div>

            <button
              className="activity-view-btn"
              onClick={() =>
                handleNavigation(
                  "/staff/work-history"
                )
              }
            >
              View History →
            </button>

          </div>


          <div className="activity-card">
            {dashboardLoading ? (
              <p className="dashboard-activity-empty">Loading recent work…</p>
            ) : dashboardError ? (
              <p className="dashboard-activity-empty">Recent work could not be loaded.</p>
            ) : dashboard?.recentActivity?.length ? (
              dashboard.recentActivity.map((activity, index) => (
                <div className="activity-item" key={`${activity.activity_type}-${index}`}>
                  <div className="activity-icon">
                    {activity.activity_type === "Complaint"
                      ? "🛠️"
                      : activity.activity_type === "Service Request"
                        ? "📋"
                        : "✅"}
                  </div>
                  <div className="activity-content">
                    <strong>{activity.title}</strong>
                    <p>{activity.details || activity.status}</p>
                  </div>
                  <span className="activity-time">
                    {activity.activity_date
                      ? new Date(activity.activity_date).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : activity.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="dashboard-activity-empty">No assigned work activity yet.</p>
            )}

          </div>

        </section>


        {/* =====================================
            FOOTER
        ===================================== */}

        <footer className="staff-footer">

          <span>
            © {currentTime.getFullYear()} Smart Apartment
            Management System
          </span>

          <span>
            Staff Portal
          </span>

        </footer>

      </main>

    </div>
  );
}

export default StaffDashboard;
