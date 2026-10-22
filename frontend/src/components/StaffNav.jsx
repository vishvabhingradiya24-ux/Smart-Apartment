import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { staffMenuFor } from "../constants/staffMenu";
import { useStaffDepartment } from "../hooks/useStaffDepartment";

// A few staff routes have a second URL.
const ALIASES = {
  "/staff": "/staff/dashboard",
  "/staff/inventory": "/staff/assets"
};

// Number of unread notifications, refreshed every minute and whenever
// the notifications page tells us it changed.
function useUnreadNotifications() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) return undefined;

    let cancelled = false;

    const load = () => {
      fetch("http://localhost:5000/api/staff/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!cancelled && data) setUnread(Number(data.unread) || 0);
        })
        .catch(() => {
          // The badge is optional; ignore network errors.
        });
    };

    load();

    const timer = setInterval(load, 60000);

    window.addEventListener("staff-notifications-changed", load);

    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener("staff-notifications-changed", load);
    };
  }, []);

  return unread;
}

// Sidebar menu for every staff page. The items depend on the staff type
// (see constants/staffMenu.js). `variant="complaints"` keeps the markup and
// class names of the Assigned Complaints page.
function StaffNav({ onNavigate, variant = "default" }) {
  const department = useStaffDepartment();
  const unread = useUnreadNotifications();
  const { pathname } = useLocation();

  const current = ALIASES[pathname] || pathname;
  const complaintsStyle = variant === "complaints";

  return (
    <nav className={complaintsStyle ? "complaints-sidebar-nav" : "sidebar-nav"}>
      {staffMenuFor(department).map((item) => {
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
