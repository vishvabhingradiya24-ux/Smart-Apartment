import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/resident.css";

function ResidentDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [greeting, setGreeting] = useState("Good Evening");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser?.user) {
          setUser(parsedUser.user);
        } else if (parsedUser?.data?.user) {
          setUser(parsedUser.data.user);
        } else {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error("User data error:", error);
      setUser({});
    }
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

  useEffect(() => {
    setGreeting(getGreeting());

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
    <div className="resident-dashboard">

      <aside className="resident-sidebar">

        <div className="sidebar-brand">

          <div className="brand-mark">
            ⌂
          </div>

          <div className="brand-text">
            <h2>Smart Apartment</h2>
            <span>Resident Portal</span>
          </div>

        </div>

        <div className="sidebar-section-label">
          MAIN MENU
        </div>

        <nav className="resident-nav">

          <Link
            to="/resident"
            className="nav-item active"
          >
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/resident/profile"
            className="nav-item"
          >
            <span className="nav-icon">◯</span>
            <span>My Profile</span>
          </Link>

          <Link
            to="/resident/flat-details"
            className="nav-item"
          >
            <span className="nav-icon">▦</span>
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
            <span className="nav-icon">⚒</span>
            <span>Complaints</span>
          </Link>

          <Link
            to="/resident/requests"
            className="nav-item"
          >
            <span className="nav-icon">≡</span>
            <span>Service Requests</span>
          </Link>

          <Link
            to="/resident/visitors"
            className="nav-item"
          >
            <span className="nav-icon">◉</span>
            <span>Visitors</span>
          </Link>

          <Link
            to="/resident/facilities"
            className="nav-item"
          >
            <span className="nav-icon">□</span>
            <span>Amenity Booking</span>
          </Link>

          <Link
            to="/resident/notices"
            className="nav-item"
          >
            <span className="nav-icon">!</span>
            <span>Notices & Events</span>
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
            <span className="nav-icon">○</span>
            <span>Notifications</span>
          </Link>

          <Link
            to="/resident/emergency"
            className="nav-item emergency-nav"
          >
            <span className="nav-icon">!</span>
            <span>Emergency Contacts</span>
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="sidebar-avatar">
              {initials}
            </div>

            <div className="sidebar-user-info">
              <strong>{fullName}</strong>
              <span>{userType}</span>
            </div>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      <main className="resident-main">

        <header className="resident-header">

          <div className="header-left">

            <span className="header-overline">
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


          <div className="header-right">

            <Link
              to="/resident/notifications"
              className="header-notification"
            >
              <span>○</span>
            </Link>


            <Link
              to="/resident/profile"
              className="header-profile"
            >

              <div className="header-avatar">
                {initials}
              </div>

              <div className="header-profile-info">

                <strong>{fullName}</strong>

                <span>
                  {blockWing && flatNumber
                    ? `${blockWing} • ${flatNumber}`
                    : userType}
                </span>

              </div>

            </Link>

          </div>

        </header>


        <section className="residence-hero">

          <div className="residence-photo"></div>

          <div className="residence-photo-overlay"></div>

          <div className="residence-content">

            <span className="section-eyebrow">
              MY RESIDENCE
            </span>

            <h2>
              Your home,
              <br />
              your community.
            </h2>

            <p className="residence-description">
              Keep your apartment services,
              community activities and residential
              information together in one place.
            </p>

            <Link
              to="/resident/flat-details"
              className="residence-button"
            >
              View Flat Details
              <span>→</span>
            </Link>

          </div>


          <div className="residence-info">

            <div className="residence-user">

              <div className="large-avatar">
                {initials}
              </div>

              <div>
                <span>RESIDENT</span>
                <h3>{fullName}</h3>
              </div>

            </div>


            <div className="residence-details">

              <div className="residence-detail">

                <span>BLOCK / WING</span>

                <strong>
                  {blockWing || "Not available"}
                </strong>

              </div>


              <div className="residence-detail">

                <span>FLAT NUMBER</span>

                <strong>
                  {flatNumber || "Not available"}
                </strong>

              </div>


              <div className="residence-detail">

                <span>USER TYPE</span>

                <strong>
                  {userType}
                </strong>

              </div>

            </div>

          </div>

        </section>


        <section className="services-section">

          <div className="section-heading">

            <div>

              <span className="section-eyebrow">
                RESIDENT SERVICES
              </span>

              <h2>
                What would you like to manage?
              </h2>

            </div>

            <p>
              Quick access to your most-used
              apartment services.
            </p>

          </div>


          <div className="services-grid">

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

                <h3>Payments</h3>

                <p>
                  Manage maintenance payments
                  and payment history.
                </p>

              </div>

            </Link>


            <Link
              to="/resident/complaints"
              className="service-card"
            >

              <div className="service-top">

                <div className="service-icon">
                  ⚒
                </div>

                <span className="service-arrow">
                  ↗
                </span>

              </div>

              <div className="service-content">

                <h3>Complaints</h3>

                <p>
                  Report and track apartment
                  issues.
                </p>

              </div>

            </Link>


            <Link
              to="/resident/requests"
              className="service-card"
            >

              <div className="service-top">

                <div className="service-icon">
                  ≡
                </div>

                <span className="service-arrow">
                  ↗
                </span>

              </div>

              <div className="service-content">

                <h3>Service Requests</h3>

                <p>
                  Request and track residential
                  services.
                </p>

              </div>

            </Link>


            <Link
              to="/resident/visitors"
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

                <h3>Visitors</h3>

                <p>
                  Manage visitor approvals
                  and entries.
                </p>

              </div>

            </Link>


            <Link
              to="/resident/facilities"
              className="service-card"
            >

              <div className="service-top">

                <div className="service-icon">
                  □
                </div>

                <span className="service-arrow">
                  ↗
                </span>

              </div>

              <div className="service-content">

                <h3>Amenity Booking</h3>

                <p>
                  Reserve community facilities
                  and amenities.
                </p>

              </div>

            </Link>

          </div>

        </section>


        <section className="dashboard-lower-grid">

          <div className="dashboard-section-panel">

            <div className="panel-heading">

              <div>

                <span className="section-eyebrow">
                  COMMUNITY
                </span>

                <h2>
                  Community Pulse
                </h2>

              </div>

              <Link to="/resident/notices">
                View All →
              </Link>

            </div>


            <div className="empty-community">

              <div className="empty-icon">
                +
              </div>

              <h3>
                No community updates yet
              </h3>

              <p>
                Notices, events and community
                announcements will appear here.
              </p>

            </div>

          </div>


          <div className="dashboard-section-panel">

            <div className="panel-heading">

              <div>

                <span className="section-eyebrow">
                  FINANCE
                </span>

                <h2>
                  Maintenance & Payments
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
                  No payment information
                </h3>

                <p>
                  Your maintenance and payment
                  information will appear here.
                </p>

              </div>

            </div>

          </div>

        </section>


        <section className="activity-section">

          <div className="panel-heading">

            <div>

              <span className="section-eyebrow">
                YOUR SPACE
              </span>

              <h2>
                Recent Activity
              </h2>

            </div>

          </div>


          <div className="activity-empty">

            <div className="activity-line"></div>

            <div className="activity-empty-content">

              <div className="activity-empty-icon">
                •
              </div>

              <div>

                <h3>
                  No recent activity
                </h3>

                <p>
                  Your apartment activities will
                  appear here as you use the system.
                </p>

              </div>

            </div>

          </div>

        </section>


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

export default ResidentDashboard;