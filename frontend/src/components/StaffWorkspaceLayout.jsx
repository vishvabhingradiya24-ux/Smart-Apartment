import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import StaffNav from "./StaffNav";
import { useStaffDepartment } from "../hooks/useStaffDepartment";

const readStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}") || {};
  } catch {
    return {};
  }
};

const getGreeting = () => {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false })
      .formatToParts(new Date())
      .find((part) => part.type === "hour")?.value || 0
  );
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
};

function StaffWorkspaceLayout() {
  const navigate = useNavigate();
  const department = useStaffDepartment();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const staff = readStoredUser();
  const firstName = staff.first_name || staff.name || "Staff";
  const lastName = staff.last_name || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "S";

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("staffToken");
    sessionStorage.removeItem("residentToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("staff");
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="staff-workspace-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="staff-workspace-overlay"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
        />
      )}

      <aside
        id="staff-workspace-navigation"
        className={`modern-sidebar staff-workspace-sidebar${sidebarOpen ? " is-open" : ""}`}
      >
        <div className="brand-header">
          <div className="brand-icon">🏢</div>
          <div className="brand-info">
            <h3>Smart Apartment</h3>
            <span>Staff Portal</span>
          </div>
        </div>

        <div className="sidebar-section-title">MAIN MENU</div>
        <StaffNav onNavigate={(path) => {
          navigate(path);
          closeSidebar();
        }} />

        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="avatar-circle">{initials}</div>
            <div className="user-details">
              <strong>{`${firstName} ${lastName}`.trim()}</strong>
              <small>{department || "Staff Member"}</small>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="staff-workspace-main">
        <button
          type="button"
          className="staff-workspace-menu-toggle"
          aria-expanded={sidebarOpen}
          aria-controls="staff-workspace-navigation"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          ☰ <span>Menu</span>
        </button>
        <header className="staff-workspace-header">
          <div className="staff-workspace-header-left">
            <span className="staff-workspace-header-label">STAFF SPACE</span>
            <h1>{getGreeting()}, {`${firstName} ${lastName}`.trim()}</h1>
            <p>Everything you need to manage your work, tasks and requests in one place.</p>
          </div>
          <div className="staff-workspace-header-right">
            <Link to="/staff/notifications" className="staff-workspace-header-bell" aria-label="Notifications">🔔</Link>
            <Link to="/staff/profile" className="staff-workspace-header-profile">
              <span className="staff-workspace-header-avatar">{initials}</span>
              <span className="staff-workspace-header-user">
                <strong>{`${firstName} ${lastName}`.trim()}</strong>
                <small>{department || "Staff Member"}</small>
              </span>
            </Link>
          </div>
        </header>

        <div className="staff-workspace-route">
          <Outlet />
        </div>

        <footer className="staff-workspace-footer">
          <span>Smart Apartment</span>
          <span>Residential Management System</span>
        </footer>
      </main>
    </div>
  );
}

export default StaffWorkspaceLayout;
