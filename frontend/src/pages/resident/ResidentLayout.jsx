import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Clock3,
  CreditCard,
  DoorOpen,
  House,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Search,
  Sun,
  Sunrise,
  Sunset,
  UserRound,
  Vote,
  Waves,
  X,
} from "lucide-react";
import "../../css/resident/resident_dashboard.css";
import "../../css/resident/resident_header.css";

const API = "http://localhost:5000/api";
const IST = "Asia/Kolkata";

const MENU_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/resident" },
  { label: "Payments", icon: CreditCard, path: "/resident/payment" },
  { label: "Complaints", icon: ClipboardList, path: "/resident/complaints" },
  { label: "Visitors", icon: DoorOpen, path: "/resident/visitors" },
  { label: "Amenity Booking", icon: Waves, path: "/resident/facilities" },
  { label: "Notices & Events", icon: Megaphone, path: "/resident/notices" },
  { label: "Polls & Voting", icon: Vote, path: "/resident/polls" },
  { label: "Notifications", icon: Bell, path: "/resident/notifications" },
  { label: "My Profile", icon: UserRound, path: "/resident/profile" },
];

const readResidentUser = () => {
  try {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser?.user || parsedUser?.data?.user || parsedUser || {};
    }
  } catch (error) {
    console.error("User data error:", error);
  }
  return {};
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
  item.path === "/resident" ? pathname === "/resident" : pathname.startsWith(item.path);

function ResidentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(readResidentUser);
  const [clock, setClock] = useState(readClock);
  const [attention, setAttention] = useState(0);

  const [jumpQuery, setJumpQuery] = useState("");
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpIndex, setJumpIndex] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const jumpRef = useRef(null);
  const jumpInputRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const updateResidentUser = () => setUser(readResidentUser());
    window.addEventListener("resident-profile-updated", updateResidentUser);
    return () => window.removeEventListener("resident-profile-updated", updateResidentUser);
  }, []);

  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";

  const fullName =
    `${firstName} ${lastName}`.trim() || "Resident";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`
      .toUpperCase() || "R";

  const blockWing = user?.block_wing || "";
  const flatNumber = user?.flat_number || "";
  const userType = user?.user_type || "Resident";
  const flatLabel = blockWing && flatNumber ? `Block ${blockWing} · Flat ${flatNumber}` : "";

  const currentPage = MENU_ITEMS.find((item) => isMenuActive(item, location.pathname));
  const GreetingIcon = clock.icon;

  // Keep the greeting, date and time current.
  useEffect(() => {
    const timer = setInterval(() => setClock(readClock()), 15000);
    return () => clearInterval(timer);
  }, []);

  // The bell counts what needs the resident: visitors to approve, polls to vote
  // in and a payment that is due. Each source is optional, so failures stay silent.
  useEffect(() => {
    let cancelled = false;

    const loadAttention = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
      const read = async (path) => {
        const response = await fetch(`${API}${path}`, { headers });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return response.json();
      };

      const [visitors, polls, payment] = await Promise.allSettled([
        read("/resident/visitors"),
        read("/resident/polls"),
        read("/resident/payments/current"),
      ]);

      if (cancelled) return;

      let count = 0;
      if (visitors.status === "fulfilled") {
        count += (visitors.value.visitors || []).filter((visitor) => visitor.status === "Pending").length;
      }
      if (polls.status === "fulfilled") {
        count += (polls.value.polls || []).filter((poll) => poll.status === "Active" && poll.my_vote_option_id === null).length;
      }
      if (payment.status === "fulfilled" && payment.value.payment?.status === "Pending") count += 1;

      setAttention(count);
    };

    loadAttention();
    const timer = setInterval(loadAttention, 60000);

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
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("staffToken");
    sessionStorage.removeItem("residentToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("authUser");
    sessionStorage.removeItem("currentUser");

    navigate("/login");
  };

  return (
    <div className="resident-layout resident-dashboard">

      <aside className="resident-sidebar">

        <div className="resident-sidebar-top">

          <Link
            to="/resident"
            className="resident-brand sidebar-brand"
          >
            <div className="resident-brand-icon brand-mark">
              <Building2 size={21} strokeWidth={1.8} aria-hidden="true" />
            </div>

            <div className="resident-brand-text brand-text">
              <strong>
                Smart Apartment Mulsha
              </strong>

              <span>
                Resident Portal
              </span>
            </div>
          </Link>

          <button
            type="button"
            className="resident-mobile-menu-toggle"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="resident-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={21} strokeWidth={2} aria-hidden="true" /> : <Menu size={21} strokeWidth={2} aria-hidden="true" />}
          </button>


          <div className="resident-menu-label sidebar-section-label">
            MAIN MENU
          </div>


          <nav
            id="resident-navigation"
            className={`resident-navigation resident-nav ${mobileMenuOpen ? "mobile-open" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {MENU_ITEMS.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/resident"}
                className={({ isActive }) => `resident-nav-item nav-item ${isActive ? "active" : ""}`}
                title={label}
              >
                <span className="resident-nav-icon nav-icon">
                  <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                </span>

                <span>
                  {label}
                </span>
              </NavLink>
            ))}
          </nav>

        </div>


        <div className="resident-sidebar-bottom sidebar-bottom">

          <div className="resident-sidebar-user sidebar-user">

            <div className="resident-sidebar-avatar sidebar-avatar">
              {initials}
            </div>

            <div className="resident-sidebar-user-info sidebar-user-info">

              <strong>
                {fullName}
              </strong>

              <span>
                {userType}
              </span>

            </div>

          </div>


          <button
            type="button"
            className="resident-logout logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} strokeWidth={1.8} aria-hidden="true" />
            Logout
          </button>

        </div>

      </aside>


      <main className="resident-main">

        <header className="rh-header" data-period={clock.name}>
          <div className="rh-intro">
            <span className="rh-sun" aria-hidden="true">
              <GreetingIcon size={26} strokeWidth={1.7} />
            </span>

            <div className="rh-text">
              <span className="rh-label">
                RESIDENT SPACE{currentPage ? <> <b>/</b> {currentPage.label.toUpperCase()}</> : null}
              </span>
              <h1>{clock.greeting}, {fullName}</h1>
              <div className="rh-chips">
                <span><CalendarDays size={13} aria-hidden="true" /> {clock.date}</span>
                <span><Clock3 size={13} aria-hidden="true" /> {clock.time}</span>
                {flatLabel && <span className="rh-chip-home"><House size={13} aria-hidden="true" /> {flatLabel}</span>}
              </div>
            </div>
          </div>

          <div className="rh-tools">
            <div className="rh-jump" ref={jumpRef}>
              <label className="rh-jump-field">
                <Search size={15} aria-hidden="true" />
                <input
                  ref={jumpInputRef}
                  className="rh-jump-input"
                  type="text"
                  role="combobox"
                  aria-expanded={jumpOpen}
                  aria-controls="rh-jump-list"
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
                <div className="rh-menu rh-jump-menu" id="rh-jump-list" role="listbox">
                  {jumpResults.length === 0 ? (
                    <p className="rh-jump-empty">No page matches “{jumpQuery.trim()}”.</p>
                  ) : (
                    jumpResults.map((item, index) => (
                      <button
                        key={item.path}
                        type="button"
                        role="option"
                        aria-selected={index === jumpIndex}
                        className={`rh-jump-option${index === jumpIndex ? " is-active" : ""}`}
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
              to="/resident/notifications"
              className="rh-bell"
              aria-label={attention ? `Notifications, ${attention} need your attention` : "Notifications"}
              title={attention ? `${attention} need your attention` : "Notifications"}
            >
              <Bell size={18} strokeWidth={1.8} aria-hidden="true" />
              {attention > 0 && <span className="rh-badge">{attention > 9 ? "9+" : attention}</span>}
            </Link>

            <div className="rh-profile-menu" ref={profileRef}>
              <button
                type="button"
                className="rh-profile"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
              >
                <span className="rh-avatar">{initials}</span>
                <span className="rh-user">
                  <strong>{fullName}</strong>
                  <small>{flatLabel || userType}</small>
                </span>
                <ChevronDown size={15} className="rh-chevron" aria-hidden="true" />
              </button>

              {profileOpen && (
                <div className="rh-menu rh-dropdown" role="menu">
                  <div className="rh-dropdown-head">
                    <strong>{fullName}</strong>
                    <small>{flatLabel || user?.email || userType}</small>
                  </div>
                  <Link to="/resident/profile" role="menuitem" onClick={() => setProfileOpen(false)}>
                    <UserRound size={16} aria-hidden="true" /> My profile
                  </Link>
                  <Link to="/resident/notifications" role="menuitem" onClick={() => setProfileOpen(false)}>
                    <Bell size={16} aria-hidden="true" /> Notifications
                    {attention > 0 && <span className="rh-dropdown-count">{attention}</span>}
                  </Link>
                  <button type="button" role="menuitem" className="is-danger" onClick={handleLogout}>
                    <LogOut size={16} aria-hidden="true" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>


        <div className="resident-content">
          <Outlet />
        </div>


        <footer className="resident-footer">

          <span>
            Smart Apartment
          </span>

          <span>
            Residential Management System
          </span>

        </footer>

      </main>

    </div>
  );
}

export default ResidentLayout;
