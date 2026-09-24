import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/admin.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [admin] = useState({
    name: "Admin",
  });

  const adminName = admin.name;

  const stats = [
    {
      title: "Total Residents",
      value: "128",
      icon: "👥",
      change: "+8 this month",
      path: "/admin/residents",
    },
    {
      title: "Complaints",
      value: "12",
      icon: "📋",
      change: "4 pending",
      path: "/admin/complaints",
    },
    {
      title: "Payments",
      value: "₹45,600",
      icon: "💳",
      change: "8 pending",
      path: "/admin/payments",
    },
    {
      title: "Visitors Today",
      value: "24",
      icon: "🚪",
      change: "18 checked in",
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

  const recentActivities = [
    {
      type: "Complaint",
      description: "New complaint submitted by Flat A-203",
      time: "10 minutes ago",
      status: "Pending",
      icon: "📋",
    },
    {
      type: "Payment",
      description: "Maintenance payment received from Flat B-102",
      time: "35 minutes ago",
      status: "Paid",
      icon: "💳",
    },
    {
      type: "Visitor",
      description: "Visitor checked in for Flat C-301",
      time: "1 hour ago",
      status: "Checked In",
      icon: "🚪",
    },
    {
      type: "Resident",
      description: "New resident profile added",
      time: "2 hours ago",
      status: "New",
      icon: "👤",
    },
    {
      type: "Staff",
      description: "Maintenance task assigned to electrician",
      time: "3 hours ago",
      status: "Assigned",
      icon: "🔧",
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
              A
            </div>

            <div>
              <strong>{adminName}</strong>
              <span>Administrator</span>
            </div>
          </div>

        </div>
      </header>

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

        <div className="welcome-building">

          <div className="building-roof"></div>

          <div className="building-structure">

            <div className="building-row">
              <i></i>
              <i></i>
              <i></i>
            </div>

            <div className="building-row">
              <i></i>
              <i></i>
              <i></i>
            </div>

            <div className="building-row">
              <i></i>
              <i></i>
              <i></i>
            </div>

            <div className="building-row">
              <i></i>
              <i></i>
              <i></i>
            </div>

            <div className="building-entry"></div>

          </div>

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

          {recentActivities.map((activity, index) => (
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

                <span>
                  {activity.time}
                </span>

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
              <strong>128</strong>
              <p>Total Residents</p>
            </div>
          </div>

          <div className="community-item">
            <span className="community-icon">🏢</span>

            <div>
              <strong>64</strong>
              <p>Total Flats</p>
            </div>
          </div>

          <div className="community-item">
            <span className="community-icon">👨‍🔧</span>

            <div>
              <strong>18</strong>
              <p>Active Staff</p>
            </div>
          </div>

          <div className="community-item">
            <span className="community-icon">🎯</span>

            <div>
              <strong>6</strong>
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