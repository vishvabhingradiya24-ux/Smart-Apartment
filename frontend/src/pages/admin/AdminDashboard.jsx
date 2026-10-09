import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/admin.css";
import "../../css/admin_dashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [admin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}") || {};
    } catch {
      return {};
    }
  });
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Admin session expired. Please log in again.");
        const response = await fetch("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load dashboard data.");
        setDashboard(data);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Unable to load dashboard data.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadDashboard();
    return () => controller.abort();
  }, []);

  const adminName = admin.name || "Admin";
  const statsData = dashboard?.stats || {};
  const community = dashboard?.community || {};
  const recentActivities = dashboard?.recentActivities || [];
  const formatActivityTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-IN", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  };

  const stats = [
    {
      title: "Total Residents",
      value: statsData.residents ?? "—",
      icon: "👥",
      change: loading ? "Loading from database..." : "Registered residents",
      path: "/admin/residents",
    },
    {
      title: "Complaints",
      value: statsData.complaints ?? "—",
      icon: "📋",
      change: `${statsData.pendingComplaints ?? 0} pending`,
      path: "/admin/complaints",
    },
    {
      title: "Payments",
      value: statsData.paidTotal === undefined ? "—" : `₹${Number(statsData.paidTotal).toLocaleString("en-IN")}`,
      icon: "💳",
      change: `${statsData.pendingPayments ?? 0} pending`,
      path: "/admin/payments",
    },
    {
      title: "Visitors Today",
      value: statsData.visitorsToday ?? "—",
      icon: "🚪",
      change: `${statsData.checkedInToday ?? 0} checked in today`,
      path: "/admin/visitors",
    },
  ];

  const quickAccess = [
    {
      title: "Residents",
      description: "Manage society residents",
      icon: "👥",
      path: "/admin/residents",
    },
    {
      title: "Security",
      description: "Manage security activities",
      icon: "🛡️",
      path: "/admin/security",
    },
    {
      title: "Staff",
      description: "Manage staff and tasks",
      icon: "👨‍🔧",
      path: "/admin/staff",
    },
    {
      title: "Complaints",
      description: "Review resident complaints",
      icon: "📋",
      path: "/admin/complaints",
    },
    {
    title: "Tasks",
    description: "Create and assign tasks to staff",
    icon: "✅",
    path: "/admin/task",
  },
    {
      title: "Payments",
      description: "Track maintenance payments",
      icon: "💳",
      path: "/admin/payments",
    },
    {
      title: "Visitors",
      description: "Monitor visitor activity",
      icon: "🚪",
      path: "/admin/visitors",
    },
    {
      title: "Amenities",
      description: "Manage society amenities",
      icon: "🏊",
      path: "/admin/amenities",
    },
    {
      title: "Notices",
      description: "Manage notices and events",
      icon: "📢",
      path: "/admin/notices",
    },
  ];

  return (
    <div className="admin-dashboard-content">

      {/* ================= HEADER ================= */}
      <header className="admin-header">
        <div className="admin-header-content">
          <span className="admin-overline">
            ADMIN PANEL
          </span>

          <h1>Dashboard</h1>

          <p>
            Welcome back, {adminName}. Manage your society from one place.
          </p>
        </div>

        <div className="admin-header-actions">

          <button
            className="admin-notification"
            onClick={() => navigate("/admin/notifications")}
            title="Notifications"
          >
            🔔
            <span className="notification-dot"></span>
          </button>

          <div className="admin-header-profile">
            <div className="admin-header-avatar">
              {adminName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{adminName}</strong>
              <span>Administrator</span>
            </div>
          </div>

        </div>
      </header>

      {error && (
        <div className="dashboard-load-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {/* ================= WELCOME ================= */}
      <section className="admin-welcome-card">

        <div className="welcome-text">

          <span>
            SMART APARTMENT MANAGEMENT
          </span>

          <h2>
            Manage your society
            <br />
            efficiently and securely.
          </h2>

          <p>
            Manage residents, security, complaints, payments,
            visitors and community services from your dashboard.
          </p>

        </div>

      </section>

      {/* ================= STATISTICS ================= */}
      <section className="admin-section">

        <div className="admin-section-header">

          <div>
            <span>OVERVIEW</span>
            <h2>Society Statistics</h2>
          </div>

        </div>

        <div className="stats-grid">

          {stats.map((stat, index) => (
            <button
              className="stat-card"
              key={index}
              onClick={() => navigate(stat.path)}
            >

              <div className="stat-card-top">

                <div className="stat-icon">
                  {stat.icon}
                </div>

                <span className="stat-arrow">
                  →
                </span>

              </div>

              <div className="stat-content">

                <span className="stat-title">
                  {stat.title}
                </span>

                <h3>
                  {stat.value}
                </h3>

                <span className="stat-change">
                  {stat.change}
                </span>

              </div>

            </button>
          ))}

        </div>

      </section>

      {/* ================= QUICK ACCESS ================= */}
      <section className="admin-section">

        <div className="admin-section-header">

          <div>
            <span>SHORTCUTS</span>
            <h2>Quick Access</h2>
          </div>

        </div>

        <div className="admin-card-grid">

          {quickAccess.map((item, index) => (
            <button
              className="admin-management-card"
              key={index}
              onClick={() => navigate(item.path)}
            >

              <div className="management-icon">
                {item.icon}
              </div>

              <div className="management-content">

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.description}
                </p>

              </div>

              <span className="management-arrow">
                →
              </span>

            </button>
          ))}

        </div>

      </section>

      {/* ================= RECENT ACTIVITY ================= */}
      <section className="admin-section">

        <div className="admin-section-header activity-header">

          <div>
            <span>ACTIVITY</span>
            <h2>Recent Activity</h2>
          </div>

          <button
            className="view-all-button"
            onClick={() => navigate("/admin/notifications")}
          >
            View All →
          </button>

        </div>

        <div className="activity-card">

          {loading ? (
            <div className="dashboard-empty-state">Loading recent activity from database...</div>
          ) : recentActivities.length === 0 ? (
            <div className="dashboard-empty-state">No recent activity found.</div>
          ) : recentActivities.map((activity, index) => (
            <div
              className="activity-row"
              key={index}
            >

              <div className="activity-icon">
                {activity.icon}
              </div>

              <div className="activity-details">

                <strong>
                  {activity.type}
                </strong>

                <p>
                  {activity.description}
                </p>

                <span>{formatActivityTime(activity.time)}</span>

              </div>

              <div
                className={`activity-status status-${activity.status
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {activity.status}
              </div>

            </div>
          ))}

        </div>

      </section>

      {/* ================= COMMUNITY OVERVIEW ================= */}
      <section className="admin-overview">

        <div className="overview-header">

          <div>
            <span>COMMUNITY</span>
            <h2>Community Overview</h2>
          </div>

          <button
            onClick={() => navigate("/admin/residents")}
          >
            View Residents →
          </button>

        </div>

        <div className="community-grid">

          <div className="community-item">
            <span className="community-icon">🏠</span>

            <div>
              <strong>{community.residents ?? "—"}</strong>
              <p>Total Residents</p>
            </div>
          </div>

          <div className="community-item">
            <span className="community-icon">🏢</span>

            <div>
              <strong>{community.flats ?? "—"}</strong>
              <p>Total Flats</p>
            </div>
          </div>

          <div className="community-item">
            <span className="community-icon">👨‍🔧</span>

            <div>
              <strong>{community.staff ?? "—"}</strong>
              <p>Active Staff</p>
            </div>
          </div>

          <div className="community-item">
            <span className="community-icon">🎯</span>

            <div>
              <strong>{community.amenities ?? "—"}</strong>
              <p>Active Amenities</p>
            </div>
          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="admin-footer">

        <span>
          © 2026 Smart Apartment Management System
        </span>

        <span>
          Admin Panel
        </span>

      </footer>

    </div>
  );
};

export default AdminDashboard;
