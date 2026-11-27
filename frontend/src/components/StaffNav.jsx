import { useLocation } from "react-router-dom";
import { staffSidebarMenuFor } from "../constants/staffMenu";
import { useStaffDepartment } from "../hooks/useStaffDepartment";
import useStaffUnreadNotifications from "../hooks/useStaffUnreadNotifications";

// A few staff routes have a second URL.
const ALIASES = {
  "/staff": "/staff/dashboard",
  "/staff/inventory": "/staff/assets"
};

// Sidebar menu for every staff page. The items depend on the staff type
// (see constants/staffMenu.js). `variant="complaints"` keeps the markup and
// class names of the Assigned Complaints page.
function StaffNav({ onNavigate, variant = "default", unreadCount }) {
  const department = useStaffDepartment();
  const ownUnread = useStaffUnreadNotifications(unreadCount === undefined);
  const unread = unreadCount ?? ownUnread;
  const { pathname } = useLocation();

  const current = ALIASES[pathname] || pathname;
  const complaintsStyle = variant === "complaints";

  return (
    <nav className={complaintsStyle ? "complaints-sidebar-nav" : "sidebar-nav"}>
      {staffSidebarMenuFor(department).map((item) => {
        const buttonClass = complaintsStyle ? "complaints-nav-btn" : "nav-btn";
        const badge =
          item.key === "notifications" && unread > 0 ? (
            <span className="nav-badge" aria-label={`${unread} unread`}>
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null;

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
                {badge}
              </>
            ) : (
              <>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {badge}
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default StaffNav;
