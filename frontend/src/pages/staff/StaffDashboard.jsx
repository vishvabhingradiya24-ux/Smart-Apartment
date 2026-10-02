
import React, { useEffect, useMemo, useState } from "react";
import "../../css/staff/staff_dashboard.css";
import { useNavigate } from "react-router-dom";

function StaffDashboard() {
  const navigate = useNavigate();

  const [staff] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const firstName = staff?.first_name || staff?.name || "Staff";
  const lastName = staff?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const staffType = staff?.staff_type || "Maintenance Staff";

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

  const services = [
    {
      id: 1,
      icon: "🛠️",
      title: "Assigned Complaints",
      description:
        "Track, inspect, and resolve resident reported complaints.",
      path: "/staff/complaints",
      tag: "04 Pending",
    },
    {
      id: 2,
      icon: "📋",
      title: "Service Requests",
      description:
        "Manage resident service requests and update their progress.",
      path: "/staff/service-requests",
      tag: "02 Active",
    },
    {
      id: 3,
      icon: "✅",
      title: "My Tasks",
      description:
        "View daily tasks, inspections, and assigned activities.",
      path: "/staff/tasks",
      tag: "Today",
    },
    {
      id: 4,
      icon: "⚙️",
      title: "Maintenance",
      description:
        "Manage scheduled maintenance, repairs, and work updates.",
      path: "/staff/maintenance",
      tag: "03 Scheduled",
    },
    {
      id: 5,
      icon: "📦",
      title: "Assets & Inventory",
      description:
        "Check equipment status and manage inventory information.",
      path: "/staff/assets",
      tag: "06 Assigned",
    },
    {
      id: 6,
      icon: "📜",
      title: "Work History",
      description:
        "Review completed tasks and previous monthly activities.",
      path: "/staff/work-history",
      tag: "18 Completed",
    },
  ];

  /* =========================
     SEARCH
  ========================= */

  const filteredServices = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) {
      return services;
    }

    return services.filter(
      (service) =>
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.tag.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  /* =========================
     QUICK STATS
  ========================= */

  const stats = [
    {
      title: "Complaints",
      value: "04",
      description: "Pending Resolution",
      icon: "🛠️",
      className: "blue",
      path: "/staff/complaints",
    },
    {
      title: "Service Requests",
      value: "02",
      description: "In Progress",
      icon: "📋",
      className: "orange",
      path: "/staff/service-requests",
    },
    {
      title: "Completed Tasks",
      value: "18",
      description: "This Month",
      icon: "✅",
      className: "green",
      path: "/staff/tasks",
    },
    {
      title: "Assets Assigned",
      value: "06",
      description: "Active Items",
      icon: "📦",
      className: "purple",
      path: "/staff/assets",
    },
  ];

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

        <nav className="sidebar-nav">

          <button
            className="nav-btn active"
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
            className="nav-btn"
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


        {/* Sidebar Footer */}

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
              STAFF WORKSPACE
            </span>

            <h1>
              Welcome back, {firstName}!
            </h1>

            <p>
              Manage your daily society tasks and
              maintenance requests efficiently.
            </p>

          </div>


          <div className="header-actions">

            {/* Date / Time */}

            <div className="header-datetime">
              <strong>{formattedTime}</strong>
              <span>{formattedDate}</span>
            </div>


            {/* Notification */}

            <div className="notification-wrapper">

              <button
                className="notification-btn"
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
              >
                🔔
                <span className="notification-dot"></span>
              </button>


              {showNotifications && (
                <div className="notification-dropdown">

                  <div className="notification-header">
                    <strong>Notifications</strong>
                    <span>2 New</span>
                  </div>

                  <div className="notification-item">

                    <span className="notification-icon">
                      🛠️
                    </span>

                    <div>
                      <strong>
                        New complaint assigned
                      </strong>

                      <small>
                        A maintenance complaint needs
                        your attention.
                      </small>
                    </div>

                  </div>


                  <div className="notification-item">

                    <span className="notification-icon">
                      📋
                    </span>

                    <div>
                      <strong>
                        Service request updated
                      </strong>

                      <small>
                        A resident service request
                        was updated.
                      </small>
                    </div>

                  </div>


                  <button
                    className="view-notifications-btn"
                    onClick={() =>
                      handleNavigation(
                        "/staff/complaints"
                      )
                    }
                  >
                    View all activity
                  </button>

                </div>
              )}

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
                <span>{staffType}</span>
              </div>

              <span className="profile-arrow">
                ›
              </span>

            </button>

          </div>

        </header>


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

            <div className="welcome-building">
              🏢
            </div>

            <div className="welcome-user-card">

              <div className="welcome-user-avatar">
                {initials}
              </div>

              <div>
                <span>STAFF MEMBER</span>
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

                    <span className="service-tag">
                      {service.tag}
                    </span>

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

                <strong>04</strong>

              </div>


              <div className="work-status-row">

                <div className="status-left">
                  <span className="status-dot progress"></span>
                  <span>In Progress</span>
                </div>

                <strong>02</strong>

              </div>


              <div className="work-status-row">

                <div className="status-left">
                  <span className="status-dot completed"></span>
                  <span>Completed</span>
                </div>

                <strong>18</strong>

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
                  {staffType}
                </p>

              </div>

            </div>


            <div className="availability-status">

              <span className="online-dot"></span>

              <div>
                <strong>
                  Available for work
                </strong>

                <small>
                  Ready to receive new assignments
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

            <div className="activity-item">

              <div className="activity-icon">
                🛠️
              </div>

              <div className="activity-content">

                <strong>
                  Complaint #CMP-1042
                </strong>

                <p>
                  Electrical maintenance request
                  is waiting for resolution.
                </p>

              </div>

              <span className="activity-time">
                Today
              </span>

            </div>


            <div className="activity-item">

              <div className="activity-icon">
                📋
              </div>

              <div className="activity-content">

                <strong>
                  Service Request #SR-208
                </strong>

                <p>
                  Plumbing service request is
                  currently in progress.
                </p>

              </div>

              <span className="activity-time">
                Today
              </span>

            </div>


            <div className="activity-item">

              <div className="activity-icon">
                ✅
              </div>

              <div className="activity-content">

                <strong>
                  Maintenance Task Completed
                </strong>

                <p>
                  Previous maintenance work was
                  marked as completed.
                </p>

              </div>

              <span className="activity-time">
                Yesterday
              </span>

            </div>

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
