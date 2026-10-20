import { useLocation } from "react-router-dom";
import { staffMenuFor } from "../constants/staffMenu";
import { useStaffDepartment } from "../hooks/useStaffDepartment";

// A few staff routes have a second URL.
const ALIASES = {
  "/staff": "/staff/dashboard",
  "/staff/inventory": "/staff/assets"
};

// Sidebar menu for every staff page. The items depend on the staff type
// (see constants/staffMenu.js). `variant="complaints"` keeps the markup and
// class names of the Assigned Complaints page.
function StaffNav({ onNavigate, variant = "default" }) {
  const department = useStaffDepartment();
  const { pathname } = useLocation();

  const current = ALIASES[pathname] || pathname;
  const complaintsStyle = variant === "complaints";

  return (
    <nav className={complaintsStyle ? "complaints-sidebar-nav" : "sidebar-nav"}>
      {staffMenuFor(department).map((item) => {
        const buttonClass = complaintsStyle ? "complaints-nav-btn" : "nav-btn";

        return (
          <button
            key={item.key}
            type="button"
            className={`${buttonClass} ${current === item.path ? "active" : ""}`.trim()}
            onClick={() => onNavigate(item.path)}
          >
            {complaintsStyle ? (
              <>
                <span>{item.icon}</span>
                {item.label}
              </>
            ) : (
              <>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default StaffNav;
