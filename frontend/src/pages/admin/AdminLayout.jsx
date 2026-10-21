
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  CreditCard,
  DoorOpen,
  LayoutDashboard,
  LogOut,
  Megaphone,
  PackageOpen,
  Settings2,
  ShieldAlert,
  UsersRound,
  Waves,
  Wrench,
} from "lucide-react";
import "../../css/admin.css";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      label: "Residents",
      icon: UsersRound,
      path: "/admin/residents",
    },
    {
      label: "Staff",
      icon: BriefcaseBusiness,
      path: "/admin/staff",
    },
    {
      label: "Incident Reports",
      icon: ShieldAlert,
      path: "/admin/incident-reports",
    },
    {
      label: "Complaints",
      icon: ClipboardList,
      path: "/admin/complaints",
    },
    {
      label: "Service Requests",
      icon: Wrench,
      path: "/admin/service-requests",
    },
    {
      label: "Tasks",
      icon: ClipboardList,
      path: "/admin/task",
    },
    {
      label: "Assets & Inventory",
      icon: PackageOpen,
      path: "/admin/assets",
    },
    {
      label: "Payments",
      icon: CreditCard,
      path: "/admin/payments",
    },
    {
      label: "Visitors",
      icon: DoorOpen,
      path: "/admin/visitors",
    },
    {
      label: "Amenities",
      icon: Waves,
      path: "/admin/amenities",
    },
    {
      label: "Notices",
      icon: Megaphone,
      path: "/admin/notices",
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/admin/notifications",
    },
    {
      label: "Settings",
      icon: Settings2,
      path: "/admin/settings",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("staffToken");
    localStorage.removeItem("residentToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon"><Building2 size={21} strokeWidth={1.8} /></div>

          <div className="admin-logo-text">
            <h2>Smart Apartment</h2>
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
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
              >
                <item.icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span className="admin-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
          <span className="admin-logout-label">Logout</span>
        </button>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
};

export default AdminLayout;