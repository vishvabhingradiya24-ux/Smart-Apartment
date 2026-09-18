import React from "react";
import { Link } from "react-router-dom";
import "../../css/resident.css";

function ResidentDashboard() {
  return (
    <div className="resident-dashboard">

      <aside className="resident-sidebar">
        <div className="resident-brand">
          <div className="resident-logo">🏠</div>
          <div>
            <h2>Smart Apartment</h2>
            <span>Resident Portal</span>
          </div>
        </div>

        <nav className="resident-nav">
          <Link to="/resident" className="active">
            <span>📊</span> Dashboard
          </Link>

          <Link to="/resident/profile">
            <span>👤</span> My Profile
          </Link>

          <Link to="/resident/flat">
            <span>🏢</span> Flat Details
          </Link>

          <Link to="/resident/payments">
            <span>💳</span> Payments
          </Link>

          <Link to="/resident/complaints">
            <span>🛠️</span> Complaints
          </Link>

          <Link to="/resident/requests">
            <span>📋</span> Service Requests
          </Link>

          <Link to="/resident/visitors">
            <span>👥</span> Visitors
          </Link>

          <Link to="/resident/amenities">
            <span>📅</span> Amenity Booking
          </Link>

          <Link to="/resident/notices">
            <span>📢</span> Notices & Events
          </Link>

          <Link to="/resident/polls">
            <span>🗳️</span> Polls & Voting
          </Link>

          <Link to="/resident/notifications">
            <span>🔔</span> Notifications
          </Link>

          <Link to="/resident/emergency">
            <span>🚨</span> Emergency Contacts
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <Link to="/login" className="logout-link">
            <span>↪</span> Logout
          </Link>
        </div>
      </aside>

      <main className="resident-main">

        <header className="resident-header">
          <div>
            <p className="welcome-small">Welcome back,</p>
            <h1>Resident Dashboard</h1>
            <p className="header-description">
              Manage your apartment and stay connected with your community.
            </p>
          </div>

          <div className="header-actions">
            <button className="notification-btn">🔔</button>

            <div className="resident-profile">
              <div className="profile-avatar">V</div>
              <div>
                <strong>Resident</strong>
                <span>Flat A-101</span>
              </div>
            </div>
          </div>
        </header>

        <section className="dashboard-cards">

          <div className="dashboard-card">
            <div className="card-icon">🏢</div>
            <div>
              <span>My Flat</span>
              <h3>A-101</h3>
              <p>Block A</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon payment-icon">💳</div>
            <div>
              <span>Maintenance</span>
              <h3>₹ 2,500</h3>
              <p>Current month</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon complaint-icon">🛠️</div>
            <div>
              <span>Complaints</span>
              <h3>02</h3>
              <p>Open complaints</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon visitor-icon">👥</div>
            <div>
              <span>Visitors</span>
              <h3>03</h3>
              <p>Today's visitors</p>
            </div>
          </div>

        </section>

        <section className="dashboard-grid">

          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h2>Quick Actions</h2>
                <p>Common resident activities</p>
              </div>
            </div>

            <div className="quick-actions">

              <Link to="/resident/payments" className="quick-action">
                <div>💳</div>
                <span>Pay Maintenance</span>
              </Link>

              <Link to="/resident/complaints" className="quick-action">
                <div>🛠️</div>
                <span>Raise Complaint</span>
              </Link>

              <Link to="/resident/visitors" className="quick-action">
                <div>👥</div>
                <span>Add Visitor</span>
              </Link>

              <Link to="/resident/amenities" className="quick-action">
                <div>📅</div>
                <span>Book Amenity</span>
              </Link>

            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h2>Recent Notices</h2>
                <p>Latest society updates</p>
              </div>

              <Link to="/resident/notices">View All</Link>
            </div>

            <div className="notice-list">

              <div className="notice-item">
                <div className="notice-icon">📢</div>
                <div>
                  <h4>Society Maintenance Notice</h4>
                  <p>Monthly maintenance payment reminder</p>
                  <span>Today</span>
                </div>
              </div>

              <div className="notice-item">
                <div className="notice-icon">🎉</div>
                <div>
                  <h4>Community Event</h4>
                  <p>Upcoming society community gathering</p>
                  <span>Yesterday</span>
                </div>
              </div>

              <div className="notice-item">
                <div className="notice-icon">🔧</div>
                <div>
                  <h4>Maintenance Update</h4>
                  <p>Common area maintenance scheduled</p>
                  <span>2 days ago</span>
                </div>
              </div>

            </div>
          </div>

        </section>

        <section className="dashboard-panel activity-panel">

          <div className="panel-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Your latest activities</p>
            </div>
          </div>

          <div className="activity-list">

            <div className="activity-item">
              <div className="activity-dot"></div>
              <div>
                <strong>Maintenance payment</strong>
                <p>Payment activity recorded</p>
              </div>
              <span>Today</span>
            </div>

            <div className="activity-item">
              <div className="activity-dot"></div>
              <div>
                <strong>Complaint submitted</strong>
                <p>Complaint is under review</p>
              </div>
              <span>Yesterday</span>
            </div>

            <div className="activity-item">
              <div className="activity-dot"></div>
              <div>
                <strong>Visitor pre-approved</strong>
                <p>Visitor entry request created</p>
              </div>
              <span>2 days ago</span>
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default ResidentDashboard;