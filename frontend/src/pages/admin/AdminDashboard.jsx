import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/admin.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userData);

      if (user.user_type !== "Admin") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      setAdmin(user);
      setCheckingAuth(false);
    } catch (error) {
      console.error("Admin authentication error:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  if (checkingAuth) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const adminName = admin.name || "Admin";

  const initials =
    adminName
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  return (
    <div className="admin-page">

      <aside className="admin-sidebar">

        <div className="admin-brand">

          <div className="admin-brand-icon">
            🏢
          </div>

          <div>
            <h2>Smart Apartment</h2>
            <span>Management System</span>
          </div>

        </div>

        <div className="admin-menu-label">
          MAIN MENU
        </div>

        <nav className="admin-nav">

          <button
            className="admin-nav-item active"
            onClick={() => navigate("/admin")}
          >
            <span>⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/residents")}
          >
            <span>👥</span>
            <span>Residents</span>
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/security")}
          >
            <span>🛡</span>
            <span>Security</span>
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/staff")}
          >
            <span>🔧</span>
            <span>Staff</span>
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/complaints")}
          >
            <span>📋</span>
            <span>Complaints</span>
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/payments")}
          >
            <span>💳</span>
            <span>Payments</span>
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/visitors")}
          >
            <span>🚪</span>
            <span>Visitors</span>
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/amenities")}
          >
            <span>📅</span>
            <span>Amenities</span>
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/notices")}
          >
            <span>📢</span>
            <span>Notices</span>
          </button>

        </nav>

        <div className="admin-menu-label system-label">
          SYSTEM
        </div>

        <nav className="admin-nav">

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/settings")}
          >
            <span>⚙</span>
            <span>Settings</span>
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/notifications")}
          >
            <span>🔔</span>
            <span>Notifications</span>
          </button>

        </nav>

        <div className="admin-sidebar-bottom">

          <div className="admin-user">

            <div className="admin-user-avatar">
              {initials}
            </div>

            <div>
              <strong>{adminName}</strong>
              <span>Administrator</span>
            </div>

          </div>

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      <main className="admin-main">

        <header className="admin-header">

          <div className="admin-header-content">

            <span className="admin-overline">
              ADMIN PANEL
            </span>

            <h1>
              Dashboard
            </h1>

            <p>
              Welcome back, {adminName}. Manage your society from one place.
            </p>

          </div>

          <div className="admin-header-actions">

            <button
              className="admin-notification"
              onClick={() => navigate("/admin/notifications")}
            >
              🔔
            </button>

            <div className="admin-header-profile">

              <div className="admin-header-avatar">
                {initials}
              </div>

              <div>
                <strong>{adminName}</strong>
                <span>Administrator</span>
              </div>

            </div>

          </div>

        </header>

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

        <section className="admin-section">

          <div className="admin-section-header">

            <div>
              <span>MANAGEMENT</span>
              <h2>Quick Access</h2>
              <p>
                Manage the important areas of your apartment community.
              </p>
            </div>

          </div>

          <div className="admin-card-grid">

            <button
              className="admin-management-card"
              onClick={() => navigate("/admin/residents")}
            >
              <div className="management-icon">
                👥
              </div>

              <div className="management-content">
                <h3>Residents</h3>
                <p>Manage registered residents</p>
              </div>

              <span className="management-arrow">
                →
              </span>
            </button>

            <button
              className="admin-management-card"
              onClick={() => navigate("/admin/security")}
            >
              <div className="management-icon">
                🛡
              </div>

              <div className="management-content">
                <h3>Security</h3>
                <p>Manage security operations</p>
              </div>

              <span className="management-arrow">
                →
              </span>
            </button>

            <button
              className="admin-management-card"
              onClick={() => navigate("/admin/staff")}
            >
              <div className="management-icon">
                🔧
              </div>

              <div className="management-content">
                <h3>Staff</h3>
                <p>Manage apartment staff</p>
              </div>

              <span className="management-arrow">
                →
              </span>
            </button>

            <button
              className="admin-management-card"
              onClick={() => navigate("/admin/complaints")}
            >
              <div className="management-icon">
                📋
              </div>

              <div className="management-content">
                <h3>Complaints</h3>
                <p>Review resident complaints</p>
              </div>

              <span className="management-arrow">
                →
              </span>
            </button>

            <button
              className="admin-management-card"
              onClick={() => navigate("/admin/payments")}
            >
              <div className="management-icon">
                💳
              </div>

              <div className="management-content">
                <h3>Payments</h3>
                <p>Manage maintenance payments</p>
              </div>

              <span className="management-arrow">
                →
              </span>
            </button>

            <button
              className="admin-management-card"
              onClick={() => navigate("/admin/visitors")}
            >
              <div className="management-icon">
                🚪
              </div>

              <div className="management-content">
                <h3>Visitors</h3>
                <p>Monitor visitor activities</p>
              </div>

              <span className="management-arrow">
                →
              </span>
            </button>

            <button
              className="admin-management-card"
              onClick={() => navigate("/admin/amenities")}
            >
              <div className="management-icon">
                📅
              </div>

              <div className="management-content">
                <h3>Amenities</h3>
                <p>Manage facilities and bookings</p>
              </div>

              <span className="management-arrow">
                →
              </span>
            </button>

            <button
              className="admin-management-card"
              onClick={() => navigate("/admin/notices")}
            >
              <div className="management-icon">
                📢
              </div>

              <div className="management-content">
                <h3>Notices</h3>
                <p>Publish community notices</p>
              </div>

              <span className="management-arrow">
                →
              </span>
            </button>

          </div>

        </section>

        <section className="admin-overview">

          <div className="overview-header">

            <div>
              <span>OVERVIEW</span>
              <h2>Community Overview</h2>
            </div>

            <button
              onClick={() => navigate("/admin")}
            >
              View Dashboard
            </button>

          </div>

          <div className="overview-placeholder">

            <div className="overview-icon">
              ◫
            </div>

            <div>
              <h3>
                Community information will appear here
              </h3>

              <p>
                Real-time information from residents, payments,
                complaints, visitors and other modules will be
                displayed here when those modules are connected.
              </p>
            </div>

          </div>

        </section>

        <footer className="admin-footer">

          <span>
            © 2026 Smart Apartment Management System
          </span>

          <span>
            Admin Panel
          </span>

        </footer>

      </main>

    </div>
  );
}

export default AdminDashboard;