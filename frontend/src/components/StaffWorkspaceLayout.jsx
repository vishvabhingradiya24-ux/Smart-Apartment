import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import StaffNav from "./StaffNav";
import { useStaffDepartment } from "../hooks/useStaffDepartment";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") || {};
  } catch {
    return {};
  }
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
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("staffToken");
    localStorage.removeItem("residentToken");
    localStorage.removeItem("user");
    localStorage.removeItem("staff");
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
        <div className="staff-workspace-route">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default StaffWorkspaceLayout;
