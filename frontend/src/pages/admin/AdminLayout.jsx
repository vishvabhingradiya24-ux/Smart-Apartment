import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Clock3,
  CreditCard,
  DoorOpen,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Moon,
  PackageOpen,
  Search,
  Settings2,
  ShieldAlert,
  Sun,
  Sunrise,
  Sunset,
  UserRound,
  UsersRound,
  Vote,
  Waves,
  Wrench,
} from "lucide-react";
import "../../css/admin.css";

const MENU_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Residents", icon: UsersRound, path: "/admin/residents" },
  { label: "Staff", icon: BriefcaseBusiness, path: "/admin/staff" },
  { label: "Incident Reports", icon: ShieldAlert, path: "/admin/incident-reports" },
  { label: "Complaints", icon: ClipboardList, path: "/admin/complaints" },
  { label: "Service Requests", icon: Wrench, path: "/admin/service-requests" },
  { label: "Tasks", icon: ClipboardList, path: "/admin/task" },
  { label: "Assets & Inventory", icon: PackageOpen, path: "/admin/assets" },
  { label: "Payments", icon: CreditCard, path: "/admin/payments" },
  { label: "Visitors", icon: DoorOpen, path: "/admin/visitors" },
  { label: "Amenities", icon: Waves, path: "/admin/amenities" },
  { label: "Notices", icon: Megaphone, path: "/admin/notices" },
  { label: "Polls & Voting", icon: Vote, path: "/admin/polls" },
  { label: "Notifications", icon: Bell, path: "/admin/notifications" },
  { label: "Settings", icon: Settings2, path: "/admin/settings" },
];

const IST = "Asia/Kolkata";

const readAdminUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}") || {};
  } catch {
    return {};
  }
};

// Greeting, icon and a live date / time, all in Indian Standard Time.
const readClock = () => {
  const now = new Date();
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", { timeZone: IST, hour: "numeric", hour12: false }).format(now)
  ) % 24;

  let period = { greeting: "Good Evening", icon: Sunset, name: "evening" };
  if (hour >= 5 && hour < 12) period = { greeting: "Good Morning", icon: Sunrise, name: "morning" };
  else if (hour >= 12 && hour < 17) period = { greeting: "Good Afternoon", icon: Sun, name: "afternoon" };
  else if (hour >= 21 || hour < 5) period = { greeting: "Good Evening", icon: Moon, name: "night" };

  return {
    ...period,
    date: new Intl.DateTimeFormat("en-IN", { timeZone: IST, weekday: "long", day: "numeric", month: "short" }).format(now),
    time: new Intl.DateTimeFormat("en-IN", { timeZone: IST, hour: "numeric", minute: "2-digit", hour12: true }).format(now),
  };
};

const isMenuActive = (item, pathname) =>
  item.path === "/admin" ? pathname === "/admin" : pathname.startsWith(item.path);

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin] = useState(readAdminUser);
  const [clock, setClock] = useState(readClock);
  const [unread, setUnread] = useState(0);

  const [jumpQuery, setJumpQuery] = useState("");
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpIndex, setJumpIndex] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const jumpRef = useRef(null);
  const jumpInputRef = useRef(null);
  const profileRef = useRef(null);

  const adminName = (admin.name || "").trim() || "Admin";
  const adminInitial = adminName.charAt(0).toUpperCase();
  const currentPage = MENU_ITEMS.find((item) => isMenuActive(item, location.pathname));
  const GreetingIcon = clock.icon;

  // Keep the greeting, date and time current.
  useEffect(() => {
    const timer = setInterval(() => setClock(readClock()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Unread notification count for the bell. Optional, so failures stay silent.
  useEffect(() => {
    let cancelled = false;

    const loadUnread = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5000/api/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setUnread((data.notifications || []).filter((item) => !item.isRead).length);
      } catch {
        /* the badge is only a convenience */
      }
    };

    loadUnread();
    const timer = setInterval(loadUnread, 60000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [location.pathname]);

  // Ctrl/Cmd + K jumps to the page search.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        jumpInputRef.current?.focus();
        setJumpOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close the open menus on an outside click.
  useEffect(() => {
    const onPointerDown = (event) => {
      if (jumpRef.current && !jumpRef.current.contains(event.target)) setJumpOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const jumpResults = useMemo(() => {
    const query = jumpQuery.trim().toLowerCase();
    return query ? MENU_ITEMS.filter((item) => item.label.toLowerCase().includes(query)) : MENU_ITEMS;
  }, [jumpQuery]);

  const goTo = useCallback((path) => {
    navigate(path);
    setJumpOpen(false);
    setJumpQuery("");
    setProfileOpen(false);
    jumpInputRef.current?.blur();
  }, [navigate]);

  const onJumpKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setJumpOpen(true);
      setJumpIndex((index) => Math.min(index + 1, jumpResults.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setJumpIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && jumpOpen && jumpResults[jumpIndex]) {
      event.preventDefault();
      goTo(jumpResults[jumpIndex].path);
    } else if (event.key === "Escape") {
      setJumpOpen(false);
      jumpInputRef.current?.blur();
    }
  };

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
          {MENU_ITEMS.map((item) => {
            const isActive = isMenuActive(item, location.pathname);

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
        <header className="admin-layout-header" data-period={clock.name}>
          <div className="admin-layout-header-intro">
            <span className="admin-layout-header-sun" aria-hidden="true">
              <GreetingIcon size={26} strokeWidth={1.7} />
            </span>

            <div className="admin-layout-header-text">
              <span className="admin-layout-header-label">
                ADMIN SPACE{currentPage ? <> <b>/</b> {currentPage.label.toUpperCase()}</> : null}
              </span>
              <h1>{clock.greeting}, {adminName}</h1>
              <div className="admin-layout-header-chips">
                <span><CalendarDays size={13} aria-hidden="true" /> {clock.date}</span>
                <span><Clock3 size={13} aria-hidden="true" /> {clock.time}</span>
              </div>
            </div>
          </div>

          <div className="admin-layout-header-tools">
            <div className="admin-jump" ref={jumpRef}>
              <label className="admin-jump-field">
                <Search size={15} aria-hidden="true" />
                <input
                  ref={jumpInputRef}
                  className="admin-jump-input"
                  type="text"
                  role="combobox"
                  aria-expanded={jumpOpen}
                  aria-controls="admin-jump-list"
                  aria-label="Jump to a page"
                  autoComplete="off"
                  placeholder="Jump to a page…"
                  value={jumpQuery}
                  onFocus={() => setJumpOpen(true)}
                  onChange={(event) => {
                    setJumpQuery(event.target.value);
                    setJumpIndex(0);
                    setJumpOpen(true);
                  }}
                  onKeyDown={onJumpKeyDown}
                />
                <kbd aria-hidden="true">Ctrl K</kbd>
              </label>

              {jumpOpen && (
                <div className="admin-jump-menu" id="admin-jump-list" role="listbox">
                  {jumpResults.length === 0 ? (
                    <p className="admin-jump-empty">No page matches “{jumpQuery.trim()}”.</p>
                  ) : (
                    jumpResults.map((item, index) => (
                      <button
                        key={item.path}
                        type="button"
                        role="option"
                        aria-selected={index === jumpIndex}
                        className={`admin-jump-option${index === jumpIndex ? " is-active" : ""}`}
                        onMouseEnter={() => setJumpIndex(index)}
                        onClick={() => goTo(item.path)}
                      >
                        <item.icon size={16} strokeWidth={1.8} aria-hidden="true" />
                        <span>{item.label}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link
              to="/admin/notifications"
              className="admin-layout-header-bell"
              aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
              title="Notifications"
            >
              <Bell size={18} strokeWidth={1.8} aria-hidden="true" />
              {unread > 0 && <span className="admin-layout-header-badge">{unread > 9 ? "9+" : unread}</span>}
            </Link>

            <div className="admin-profile-menu" ref={profileRef}>
              <button
                type="button"
                className="admin-layout-header-profile"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
              >
                <span className="admin-layout-header-avatar">{adminInitial}</span>
                <span className="admin-layout-header-user">
                  <strong>{adminName}</strong>
                  <small>Administrator</small>
                </span>
                <ChevronDown size={15} className="admin-layout-header-chevron" aria-hidden="true" />
              </button>

              {profileOpen && (
                <div className="admin-profile-dropdown" role="menu">
                  <div className="admin-profile-dropdown-head">
                    <strong>{adminName}</strong>
                    <small>{admin.email || "Administrator"}</small>
                  </div>
                  <Link to="/admin/settings?tab=profile" role="menuitem" onClick={() => setProfileOpen(false)}>
                    <UserRound size={16} aria-hidden="true" /> My profile
                  </Link>
                  <Link to="/admin/settings" role="menuitem" onClick={() => setProfileOpen(false)}>
                    <Settings2 size={16} aria-hidden="true" /> Settings
                  </Link>
                  <button type="button" role="menuitem" className="is-danger" onClick={handleLogout}>
                    <LogOut size={16} aria-hidden="true" /> Logout
                  </button>
                </div>
              )}
            </div>
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
