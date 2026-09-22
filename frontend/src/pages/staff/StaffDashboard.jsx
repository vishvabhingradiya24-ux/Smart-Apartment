import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/staff.css";

function StaffDashboard() {
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

  const staffType = staff?.staff_type || "Staff Member";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`
      .toUpperCase() || "S";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("staff");
    navigate("/login");
  };

  return (
    <div className="staff-dashboard">

      <aside className="staff-sidebar">

        <div className="staff-brand">
          <div className="staff-brand-mark">
            ⌂
          </div>

          <div className="staff-brand-text">
            <h2>Smart Apartment</h2>
            <span>Staff Portal</span>
          </div>
        </div>

        <div className="staff-menu-label">
          MAIN MENU
        </div>

        <nav className="staff-nav">

          <button className="staff-nav-item active">
            <span className="staff-nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button className="staff-nav-item">
            <span className="staff-nav-icon">⚒</span>
            <span>Assigned Complaints</span>
          </button>

          <button className="staff-nav-item">
            <span className="staff-nav-icon">≡</span>
            <span>Service Requests</span>
          </button>

          <button className="staff-nav-item">
            <span className="staff-nav-icon">✓</span>
            <span>Tasks</span>
          </button>

          <button className="staff-nav-item">
            <span className="staff-nav-icon">▤</span>
            <span>Maintenance</span>
          </button>

          <button className="staff-nav-item">
            <span className="staff-nav-icon">▦</span>
            <span>Assets & Inventory</span>
          </button>

          <button className="staff-nav-item">
            <span className="staff-nav-icon">↻</span>
            <span>Work History</span>
          </button>

          <button className="staff-nav-item">
            <span className="staff-nav-icon">◯</span>
            <span>My Profile</span>
          </button>

        </nav>

        <div className="staff-sidebar-bottom">

          <div className="staff-sidebar-user">

            <div className="staff-sidebar-avatar">
              {initials}
            </div>

            <div className="staff-sidebar-user-info">
              <strong>{fullName}</strong>
              <span>{staffType}</span>
            </div>

          </div>

          <button
            className="staff-logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      <main className="staff-main">

        <header className="staff-header">

          <div className="staff-header-left">

            <span className="staff-header-overline">
              STAFF SPACE
            </span>

            <h1>
              Welcome, {fullName}
            </h1>

            <p>
              Manage your assigned work and society services.
            </p>

          </div>

          <div className="staff-header-right">

            <button className="staff-notification">
              ○
            </button>

            <div className="staff-header-profile">

              <div className="staff-header-avatar">
                {initials}
              </div>

              <div className="staff-header-profile-info">
                <strong>{fullName}</strong>
                <span>{staffType}</span>
              </div>

            </div>

          </div>

        </header>

        <section className="staff-residence-hero">

          <div className="staff-photo"></div>

          <div className="staff-photo-overlay"></div>

          <div className="staff-hero-content">

            <span className="staff-section-eyebrow">
              STAFF WORKSPACE
            </span>

            <h2>
              Keep the community,
              <br />
              running smoothly.
            </h2>

            <p>
              Manage complaints, service requests,
              tasks, maintenance activities and
              society resources from one place.
            </p>

          </div>

          <div className="staff-hero-info">

            <div className="staff-hero-user">

              <div className="staff-large-avatar">
                {initials}
              </div>

              <div>
                <span>STAFF MEMBER</span>
                <h3>{fullName}</h3>
              </div>

            </div>

            <div className="staff-hero-details">

              <div>
                <span>STAFF TYPE</span>
                <strong>{staffType}</strong>
              </div>

              <div>
                <span>ROLE</span>
                <strong>Staff</strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong>Active</strong>
              </div>

            </div>

          </div>

        </section>

        <section className="staff-services-section">

          <div className="staff-section-heading">

            <div>
              <span>STAFF SERVICES</span>

              <h2>
                What would you like to manage?
              </h2>
            </div>

            <p>
              Quick access to your assigned society work.
            </p>

          </div>

          <div className="staff-services-grid">

            <div className="staff-service-card staff-service-primary">

              <div className="staff-service-top">
                <div className="staff-service-icon">
                  ⚒
                </div>

                <span>↗</span>
              </div>

              <div>
                <h3>Assigned Complaints</h3>

                <p>
                  View and handle complaints assigned
                  to staff members.
                </p>
              </div>

            </div>

            <div className="staff-service-card">

              <div className="staff-service-top">
                <div className="staff-service-icon">
                  ≡
                </div>

                <span>↗</span>
              </div>

              <div>
                <h3>Service Requests</h3>

                <p>
                  Manage resident service requests
                  and update their progress.
                </p>
              </div>

            </div>

            <div className="staff-service-card">

              <div className="staff-service-top">
                <div className="staff-service-icon">
                  ✓
                </div>

                <span>↗</span>
              </div>

              <div>
                <h3>Tasks</h3>

                <p>
                  Manage assigned tasks and update
                  their current status.
                </p>
              </div>

            </div>

            <div className="staff-service-card">

              <div className="staff-service-top">
                <div className="staff-service-icon">
                  ▤
                </div>

                <span>↗</span>
              </div>

              <div>
                <h3>Maintenance</h3>

                <p>
                  Handle maintenance requests and
                  scheduled maintenance activities.
                </p>
              </div>

            </div>

            <div className="staff-service-card">

              <div className="staff-service-top">
                <div className="staff-service-icon">
                  ▦
                </div>

                <span>↗</span>
              </div>

              <div>
                <h3>Assets & Inventory</h3>

                <p>
                  View asset information and manage
                  inventory-related work.
                </p>
              </div>

            </div>

            <div className="staff-service-card">

              <div className="staff-service-top">
                <div className="staff-service-icon">
                  ↻
                </div>

                <span>↗</span>
              </div>

              <div>
                <h3>Work History</h3>

                <p>
                  Review completed work and previous
                  staff activities.
                </p>
              </div>

            </div>

          </div>

        </section>

        <section className="staff-lower-grid">

          <div className="staff-panel">

            <div className="staff-panel-heading">

              <div>
                <span>TASK MANAGEMENT</span>

                <h2>
                  Task Status
                </h2>
              </div>

            </div>

            <div className="staff-status-list">

              <div className="staff-status-item">
                <span className="status-dot pending"></span>
                <span>Pending</span>
              </div>

              <div className="staff-status-item">
                <span className="status-dot progress"></span>
                <span>In Progress</span>
              </div>

              <div className="staff-status-item">
                <span className="status-dot completed"></span>
                <span>Completed</span>
              </div>

              <div className="staff-status-item">
                <span className="status-dot unable"></span>
                <span>Unable to Complete</span>
              </div>

            </div>

          </div>

          <div className="staff-panel staff-empty-panel">

            <div className="staff-empty-icon">
              +
            </div>

            <h3>
              No assigned activities yet
            </h3>

            <p>
              Assigned complaints, service requests
              and tasks will appear here when available.
            </p>

          </div>

        </section>

        <section className="staff-activity-section">

          <div className="staff-panel-heading">

            <div>
              <span>YOUR WORKSPACE</span>

              <h2>
                Recent Work Activity
              </h2>
            </div>

          </div>

          <div className="staff-activity-empty">

            <div className="staff-activity-icon">
              •
            </div>

            <div>
              <h3>
                No recent activity
              </h3>

              <p>
                Your assigned work and completed
                activities will appear here.
              </p>
            </div>

          </div>

        </section>

        <footer className="staff-footer">

          <span>
            Smart Apartment
          </span>

          <span>
            Staff Management Portal
          </span>

        </footer>

      </main>

    </div>
  );
}

export default StaffDashboard;