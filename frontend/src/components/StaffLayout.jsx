import { useNavigate } from "react-router-dom";
import StaffNav from "./StaffNav";
import { useStaffDepartment } from "../hooks/useStaffDepartment";
import "../css/staff/staff_inventory.css";
import "../css/staff/staff_shared_theme.css";
import "../css/staff/staff_extra.css";

const readStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}") || {};
  } catch {
    return {};
  }
};

// Page shell for the newer staff pages: the same dark sidebar and header the
// older staff pages use, with the role based menu (StaffNav).
function StaffLayout({ badge, title, subtitle, actions = null, children }) {
  const navigate = useNavigate();
  const department = useStaffDepartment();

  const staff = readStoredUser();

  const firstName = staff?.first_name || staff?.name || "Staff";
  const lastName = staff?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "S";

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("staffToken");
    sessionStorage.removeItem("residentToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("staff");

    navigate("/login");
  };

  return (
    <div className="modern-staff-layout">
      <aside className="modern-sidebar">
        <div className="brand-header">
          <div className="brand-icon">🏢</div>

          <div className="brand-info">
            <h3>Smart Apartment</h3>
            <span>Staff Portal</span>
          </div>
        </div>

        <div className="sidebar-section-title">MAIN MENU</div>

        <StaffNav onNavigate={navigate} />

        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="avatar-circle">{initials}</div>

            <div className="user-details">
              <strong>{fullName}</strong>
              <small>{department || "Staff Member"}</small>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="modern-main-content">
        <header className="top-header">
          <div className="header-title">
            {badge && <span className="badge-tag">{badge}</span>}

            <h1>{title}</h1>

            {subtitle && <p>{subtitle}</p>}
          </div>

          <div className="header-actions">
            {actions}

            <div
              className="profile-pill"
              onClick={() => navigate("/staff/profile")}
            >
              <div className="avatar-sm">{initials}</div>

              <span>{fullName}</span>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

export default StaffLayout;
