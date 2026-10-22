import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  Vote,
  Waves,
  Wrench,
} from "lucide-react";
import "../../css/admin.css";

const readAdminUser = () => {
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

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin] = useState(readAdminUser);
  const [greeting, setGreeting] = useState(getGreeting);

  useEffect(() => {
    const timer = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(timer);
  }, []);

  const adminName = (admin.name || "").trim() || "Admin";
  const adminInitial = adminName.charAt(0).toUpperCase();

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
      label: "Polls & Voting",
      icon: Vote,
      path: "/admin/polls",
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
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("staffToken");
    sessionStorage.removeItem("residentToken");
    sessionStorage.removeItem("user");
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

      <main className="admin-main">
        <header className="admin-layout-header">
          <div className="admin-layout-header-left">
            <span className="admin-layout-header-label">ADMIN SPACE</span>
            <h1>{greeting}, {adminName}</h1>
            <p>Manage residents, staff, payments and community services from one place.</p>
          </div>

          <div className="admin-layout-header-right">
            <Link
              to="/admin/notifications"
              className="admin-layout-header-bell"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={17} strokeWidth={1.8} aria-hidden="true" />
            </Link>

            <Link
              to="/admin/settings?tab=profile"
              className="admin-layout-header-profile"
              aria-label="Open administrator profile"
              title="Open administrator profile"
            >
              <span className="admin-layout-header-avatar">{adminInitial}</span>
              <span className="admin-layout-header-user">
                <strong>{adminName}</strong>
                <small>Administrator</small>
              </span>
            </Link>
          </div>
        </header>

        {children}

        <footer className="admin-layout-footer">
          <span>Smart Apartment</span>
          <span>Residential Management System</span>
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;