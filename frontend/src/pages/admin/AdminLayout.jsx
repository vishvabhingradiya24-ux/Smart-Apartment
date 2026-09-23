
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/admin.css";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      icon: "📊",
      path: "/admin",
    },
    {
      label: "Residents",
      icon: "👥",
      path: "/admin/residents",
    },
    {
      label: "Security",
      icon: "🛡️",
      path: "/admin/security",
    },
    {
      label: "Staff",
      icon: "👨‍💼",
      path: "/admin/staff",
    },
    {
      label: "Complaints",
      icon: "📝",
      path: "/admin/complaints",
    },
    {
      label: "Payments",
      icon: "💳",
      path: "/admin/payments",
    },
    {
      label: "Visitors",
      icon: "🚪",
      path: "/admin/visitors",
    },
    {
      label: "Amenities",
      icon: "🏊",
      path: "/admin/amenities",
    },
    {
      label: "Notices",
      icon: "📢",
      path: "/admin/notices",
    },
    {
      label: "Notifications",
      icon: "🔔",
      path: "/admin/notifications",
    },
    {
      label: "Settings",
      icon: "⚙️",
      path: "/admin/settings",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* COMMON SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">🏢</div>

          <div>
            <h2>Society360</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => {
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                className={`admin-nav-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          <span>🚪</span>
          Logout
        </button>
      </aside>

      {/* PAGE CONTENT */}
      <main className="admin-main">{children}</main>
    </div>
  );
};

export default AdminLayout;