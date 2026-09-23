import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/resident.css";

const ResidentDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("Good Morning");
  const [loading, setLoading] = useState(true);

  // ==========================================
  // GET USER FROM LOCAL STORAGE
  // ==========================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("User data error:", error);
      }
    }

    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    setLoading(false);
  }, []);

  // ==========================================
  // USER DETAILS
  // ==========================================
  const firstName =
    user?.first_name ||
    user?.firstName ||
    user?.name?.split(" ")[0] ||
    "Resident";

  const lastName =
    user?.last_name ||
    user?.lastName ||
    "";

  const fullName = `${firstName} ${lastName}`.trim();

  const flatNumber =
    user?.flat_number ||
    user?.flatNumber ||
    "Not Available";

  const blockWing =
    user?.block_wing ||
    user?.blockWing ||
    "Not Available";

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="resident-dashboard">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="resident-sidebar">

        {/* BRAND */}

        <div className="sidebar-brand">

          <div className="brand-mark">
            SA
          </div>

          <div className="brand-text">
            <h2>SmartApartment</h2>
            <span>Society Management</span>
          </div>

        </div>


        {/* SECTION LABEL */}

        <div className="sidebar-section-label">
          MAIN MENU
        </div>


        {/* NAVIGATION */}

        <nav className="resident-nav">

          <Link
            to="/resident"
            className="nav-item active"
          >
            <span className="nav-icon">▦</span>
            <span>Dashboard</span>
          </Link>


          <Link
            to="/resident/profile"
            className="nav-item"
          >
            <span className="nav-icon">◉</span>
            <span>My Profile</span>
          </Link>


          <Link
            to="/resident/flat-details"
            className="nav-item"
          >
            <span className="nav-icon">⌂</span>
            <span>Flat Details</span>
          </Link>


          <Link
            to="/resident/payment"
            className="nav-item"
          >
            <span className="nav-icon">₹</span>
            <span>Payments</span>
          </Link>


          <Link
            to="/resident/complaints"
            className="nav-item"
          >
            <span className="nav-icon">!</span>
            <span>Complaints</span>
          </Link>


          <Link
            to="/resident/requests"
            className="nav-item"
          >
            <span className="nav-icon">☷</span>
            <span>Service Requests</span>
          </Link>


          <Link
            to="/resident/visitors"
            className="nav-item"
          >
            <span className="nav-icon">♙</span>
            <span>Visitors</span>
          </Link>


          <Link
            to="/resident/facilities"
            className="nav-item"
          >
            <span className="nav-icon">▣</span>
            <span>Facilities</span>
          </Link>


          <Link
            to="/resident/notices"
            className="nav-item"
          >
            <span className="nav-icon">▤</span>
            <span>Notices</span>
          </Link>


          <Link
            to="/resident/polls"
            className="nav-item"
          >
            <span className="nav-icon">✓</span>
            <span>Polls & Voting</span>
          </Link>


          <Link
            to="/resident/notifications"
            className="nav-item"
          >
            <span className="nav-icon">🔔</span>
            <span>Notifications</span>
          </Link>


          <Link
            to="/resident/emergency"
            className="nav-item emergency-nav"
          >
            <span className="nav-icon">!</span>
            <span>Emergency & Help</span>
          </Link>

        </nav>


        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="sidebar-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div className="sidebar-user-info">

              <strong>
                {fullName}
              </strong>

              <span>
                Resident
              </span>

            </div>

          </div>


          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="resident-main">

        {/* =========================================
            HEADER
        ========================================= */}

        <header className="resident-header">

          <div className="header-left">

            <span className="header-overline">
              RESIDENT PORTAL
            </span>

            <h1>
              {greeting}, {firstName}!
            </h1>

            <p>
              Welcome back to your SmartApartment dashboard.
            </p>

          </div>


          <div className="header-right">

            <Link
              to="/resident/notifications"
              className="header-notification"
              title="Notifications"
            >
              <span>🔔</span>
            </Link>


            <Link
              to="/resident/profile"
              className="header-profile"
            >

              <div className="header-avatar">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="header-profile-info">

                <strong>
                  {fullName}
                </strong>

                <span>
                  Resident
                </span>

              </div>

            </Link>

          </div>

        </header>


        {/* =========================================
            RESIDENCE HERO
        ========================================= */}

        <section className="residence-hero">

          {/* Background Image */}

          <div className="residence-photo"></div>

          <div className="residence-photo-overlay"></div>


          {/* LEFT CONTENT */}

          <div className="residence-content">

            <span className="section-eyebrow">
              YOUR RESIDENCE
            </span>

            <h2>
              Welcome to SmartApartment
            </h2>

            <p className="residence-description">
              Manage your apartment services, payments,
              complaints, visitors and facility bookings
              from one place.
            </p>


            <Link
              to="/resident/flat-details"
              className="residence-button"
            >
              View Flat Details
              <span>→</span>
            </Link>

          </div>


          {/* RIGHT INFORMATION CARD */}

          <div className="residence-info">

            <div className="residence-user">

              <div className="large-avatar">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div>

                <span>
                  RESIDENT
                </span>

                <h3>
                  {fullName}
                </h3>

              </div>

            </div>


            <div className="residence-details">

              <div className="residence-detail">

                <span>
                  FLAT NUMBER
                </span>

                <strong>
                  {flatNumber}
                </strong>

              </div>


              <div className="residence-detail">

                <span>
                  BLOCK / WING
                </span>

                <strong>
                  {blockWing}
                </strong>

              </div>


              <div className="residence-detail">

                <span>
                  ROLE
                </span>

                <strong>
                  Resident
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =========================================
            SERVICES
        ========================================= */}

        <section className="services-section">

          <div className="section-heading">

            <div>

              <span className="section-eyebrow">
                RESIDENT SERVICES
              </span>

              <h2>
                What would you like to do?
              </h2>

            </div>

            <p>
              Access your apartment services
              quickly from one place.
            </p>

          </div>


          <div className="services-grid">

            {/* PAYMENT */}

            <Link
              to="/resident/payment"
              className="service-card service-primary"
            >

              <div className="service-top">

                <div className="service-icon">
                  ₹
                </div>

                <span className="service-arrow">
                  ↗
                </span>

              </div>

              <div className="service-content">

                <h3>
                  Maintenance & Payments
                </h3>

                <p>
                  View dues, payment status
                  and payment history.
                </p>

              </div>

            </Link>


            {/* COMPLAINTS */}

            <Link
              to="/resident/complaints"
              className="service-card"
            >

              <div className="service-top">

                <div className="service-icon">
                  !
                </div>

                <span className="service-arrow">
                  ↗
                </span>

              </div>

              <div className="service-content">

                <h3>
                  Complaints
                </h3>

                <p>
                  Submit complaints and
                  track their status.
                </p>

              </div>

            </Link>


            {/* SERVICE REQUESTS */}

            <Link
              to="/resident/requests"
              className="service-card"
            >

              <div className="service-top">

                <div className="service-icon">
                  ☷
                </div>

                <span className="service-arrow">
                  ↗
                </span>

              </div>

              <div className="service-content">

                <h3>
                  Service Requests
                </h3>

                <p>
                  Request electrician, plumber,
                  cleaning and other services.
                </p>

              </div>

            </Link>


            {/* VISITORS */}

            <Link
              to="/resident/visitors"
              className="service-card"
            >

              <div className="service-top">

                <div className="service-icon">
                  ♙
                </div>

                <span className="service-arrow">
                  ↗
                </span>

              </div>

              <div className="service-content">

                <h3>
                  Visitors
                </h3>

                <p>
                  Pre-approve visitors and
                  view visitor history.
                </p>

              </div>

            </Link>


            {/* FACILITIES */}

            <Link
              to="/resident/facilities"
              className="service-card"
            >

              <div className="service-top">

                <div className="service-icon">
                  ▣
                </div>

                <span className="service-arrow">
                  ↗
                </span>

              </div>

              <div className="service-content">

                <h3>
                  Facilities Booking
                </h3>

                <p>
                  View available facilities
                  and submit booking requests.
                </p>

              </div>

            </Link>


            {/* NOTICES */}

            <Link
              to="/resident/notices"
              className="service-card"
            >

              <div className="service-top">

                <div className="service-icon">
                  ▤
                </div>

                <span className="service-arrow">
                  ↗
                </span>

              </div>

              <div className="service-content">

                <h3>
                  Notices & Events
                </h3>

                <p>
                  View society notices
                  and upcoming events.
                </p>

              </div>

            </Link>


            {/* POLLS */}

            <Link
              to="/resident/polls"
              className="service-card"
            >

              <div className="service-top">

                <div className="service-icon">
                  ✓
                </div>

                <span className="service-arrow">
                  ↗
                </span>

              </div>

              <div className="service-content">

                <h3>
                  Polls & Voting
                </h3>

                <p>
                  Participate in society
                  polls and voting.
                </p>

              </div>

            </Link>


            {/* PROFILE */}

            <Link
              to="/resident/profile"
              className="service-card"
            >

              <div className="service-top">

                <div className="service-icon">
                  ◉
                </div>

                <span className="service-arrow">
                  ↗
                </span>

              </div>

              <div className="service-content">

                <h3>
                  My Profile
                </h3>

                <p>
                  View your personal and
                  apartment information.
                </p>

              </div>

            </Link>

          </div>

        </section>


        {/* =========================================
            LOWER GRID
        ========================================= */}

        <section className="dashboard-lower-grid">

          {/* COMMUNITY / NOTICES */}

          <div className="dashboard-section-panel">

            <div className="panel-heading">

              <div>

                <span className="section-eyebrow">
                  COMMUNITY
                </span>

                <h2>
                  Notices & Events
                </h2>

              </div>

              <Link to="/resident/notices">
                View all →
              </Link>

            </div>


            <div className="empty-community">

              <div className="empty-icon">
                ▤
              </div>

              <h3>
                No community updates
              </h3>

              <p>
                New society notices and events
                will appear here.
              </p>

            </div>

          </div>


          {/* PAYMENT */}

          <div className="dashboard-section-panel">

            <div className="panel-heading">

              <div>

                <span className="section-eyebrow">
                  FINANCE
                </span>

                <h2>
                  Maintenance Payment
                </h2>

              </div>

              <Link to="/resident/payment">
                Open →
              </Link>

            </div>


            <div className="payment-empty">

              <div className="payment-symbol">
                ₹
              </div>

              <div>

                <h3>
                  Payment information
                </h3>

                <p>
                  View your maintenance dues,
                  payment status and history.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =========================================
            ACTIVITY
        ========================================= */}

        <section className="activity-section">

          <div className="panel-heading">

            <div>

              <span className="section-eyebrow">
                RECENT ACTIVITY
              </span>

              <h2>
                Your Activity
              </h2>

            </div>

          </div>


          <div className="activity-empty">

            <div className="activity-line"></div>

            <div className="activity-empty-content">

              <div className="activity-empty-icon">
                ✓
              </div>

              <div>

                <h3>
                  No recent activity
                </h3>

                <p>
                  Your latest requests, payments
                  and bookings will appear here.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =========================================
            FOOTER
        ========================================= */}

        <footer className="resident-footer">

          <span>
            © 2026 SmartApartment
          </span>

          <span>
            Society Management System
          </span>

        </footer>

      </main>

    </div>
  );
};

export default ResidentDashboard;