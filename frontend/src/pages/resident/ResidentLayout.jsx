import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  DoorOpen,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  PhoneCall,
  UserRound,
  Vote,
  Waves,
  Wrench,
  X,
} from "lucide-react";
import "../../css/resident/resident_dashboard.css";

function ResidentLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser?.user || parsedUser?.data?.user || parsedUser || {};
      }
    } catch (error) {
      console.error("User data error:", error);
    }
    return {};
  });

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

  const getGreeting = () => {
    const parts = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).formatToParts(new Date());

    const hour = Number(
      parts.find((part) => part.type === "hour")?.value || 0
    );

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    }

    if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    }

    return "Good Evening";
  };

  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const timer = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("authUser");
    localStorage.removeItem("currentUser");

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
            {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>


          <div className="resident-menu-label sidebar-section-label">
            MAIN MENU
          </div>


          <nav
            id="resident-navigation"
            className={`resident-navigation resident-nav ${mobileMenuOpen ? "mobile-open" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >

            <NavLink
              to="/resident"
              end
              className={({ isActive }) => `resident-nav-item nav-item ${isActive ? "active" : ""}`}
              title="Dashboard"
            >
              <span className="resident-nav-icon nav-icon">
                <LayoutDashboard size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span>
                Dashboard
              </span>
            </NavLink>


            <NavLink
              to="/resident/profile"
              className={({ isActive }) => `resident-nav-item nav-item ${isActive ? "active" : ""}`}
              title="My Profile"
            >
              <span className="resident-nav-icon nav-icon">
                <UserRound size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span>
                My Profile
              </span>
            </NavLink>


            <NavLink
              to="/resident/flat-details"
              className={({ isActive }) => `resident-nav-item nav-item ${isActive ? "active" : ""}`}
              title="Flat Details"
            >
              <span className="resident-nav-icon nav-icon">
                <Building2 size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span>
                Flat Details
              </span>
            </NavLink>


            <NavLink
              to="/resident/payment"
              className={({ isActive }) => `resident-nav-item nav-item ${isActive ? "active" : ""}`}
              title="Payments"
            >
              <span className="resident-nav-icon nav-icon">
                <CreditCard size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span>
                Payments
              </span>
            </NavLink>


            <NavLink
              to="/resident/complaints"
              className={({ isActive }) => `resident-nav-item nav-item ${isActive ? "active" : ""}`}
              title="Complaints"
            >
              <span className="resident-nav-icon nav-icon">
                <ClipboardList size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span>
                Complaints
              </span>
            </NavLink>


            <NavLink
              to="/resident/requests"
              className={({ isActive }) => `resident-nav-item nav-item ${isActive ? "active" : ""}`}
              title="Service Requests"
            >
              <span className="resident-nav-icon nav-icon">
                <Wrench size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span>
                Service Requests
              </span>
            </NavLink>


            <NavLink
              to="/resident/visitors"
              className={({ isActive }) => `resident-nav-item nav-item ${isActive ? "active" : ""}`}
              title="Visitors"
            >
              <span className="resident-nav-icon nav-icon">
                <DoorOpen size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span>
                Visitors
              </span>
            </NavLink>


            <NavLink
              to="/resident/facilities"
              className={({ isActive }) => `resident-nav-item nav-item ${isActive ? "active" : ""}`}
              title="Amenity Booking"
            >
              <span className="resident-nav-icon nav-icon">
                <Waves size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span>
                Amenity Booking
              </span>
            </NavLink>


            <NavLink
              to="/resident/notices"
              className={({ isActive }) => `resident-nav-item nav-item ${isActive ? "active" : ""}`}
              title="Notices & Events"
            >
              <span className="resident-nav-icon nav-icon">
                <Megaphone size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span>
                Notices & Events
              </span>
            </NavLink>


            <NavLink
              to="/resident/polls"
              className={({ isActive }) => `resident-nav-item nav-item ${isActive ? "active" : ""}`}
              title="Polls & Voting"
            >
              <span className="resident-nav-icon nav-icon">
                <Vote size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span>
                Polls & Voting
              </span>
            </NavLink>

            <NavLink
              to="/resident/notifications"
              className={({ isActive }) => `resident-nav-item nav-item ${isActive ? "active" : ""}`}
              title="Notifications"
            >
              <span className="resident-nav-icon nav-icon">
                <Bell size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span>
                Notifications
              </span>
            </NavLink>

            <NavLink
              to="/resident/emergency"
              className={({ isActive }) => `resident-nav-item nav-item emergency-nav ${isActive ? "active" : ""}`}
              title="Emergency Contacts"
            >
              <span className="resident-nav-icon nav-icon">
                <PhoneCall size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <span>
                Emergency Contacts
              </span>
            </NavLink>

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

        <header className="resident-header">

          <div className="resident-header-left header-left">

            <span className="resident-header-label header-overline">
              RESIDENT SPACE
            </span>

            <h1>
              {greeting}, {fullName}
            </h1>

            <p>
              Everything you need for a smarter,
              more connected residential experience.
            </p>

          </div>


          <div className="resident-header-right header-right">

            <Link
              to="/resident/notifications"
              className="header-notification"
              aria-label="Notifications"
            >
              <Bell size={17} strokeWidth={1.8} aria-hidden="true" />
            </Link>

            <Link
              to="/resident/profile"
              className="resident-header-profile header-profile"
            >

              <div className="resident-header-avatar header-avatar">
                {initials}
              </div>

              <div className="resident-header-user header-profile-info">

                <strong>
                  {fullName}
                </strong>

                <span>
                  {blockWing && flatNumber
                    ? `${blockWing} • ${flatNumber}`
                    : userType}
                </span>

              </div>

            </Link>

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
