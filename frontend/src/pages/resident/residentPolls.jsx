import React from "react";
import { Link } from "react-router-dom";
import "../../css/resident/residentPolls.css";

const ResidentPolls = () => {
  const polls = [
    {
      id: 1,
      question: "Should the society organize a community cleanliness drive?",
      description:
        "Share your opinion about organizing a monthly cleanliness activity for the society.",
      endDate: "30 Sep 2026",
      options: [
        "Yes, I Agree",
        "No, Not Required",
        "Maybe Later",
      ],
    },
    {
      id: 2,
      question: "Which facility should be improved next?",
      description:
        "Select the facility that you think should receive improvement or additional facilities.",
      endDate: "05 Oct 2026",
      options: [
        "Garden",
        "Gym",
        "Community Hall",
        "Sports Area",
      ],
    },
  ];

  return (
    <div className="resident-polls-page">

      <aside className="resident-polls-sidebar">

        <div className="resident-polls-brand">
          <div className="resident-polls-brand-mark">
            ⌂
          </div>

          <div>
            <h2>Smart Apartment</h2>
            <span>Resident Portal</span>
          </div>
        </div>

        <div className="resident-polls-menu-title">
          MAIN MENU
        </div>

        <nav className="resident-polls-nav">

          <Link to="/resident" className="resident-polls-nav-item">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/resident/profile"
            className="resident-polls-nav-item"
          >
            <span>◯</span>
            My Profile
          </Link>

          <Link
            to="/resident/flat-details"
            className="resident-polls-nav-item"
          >
            <span>▦</span>
            Flat Details
          </Link>

          <Link
            to="/resident/payment"
            className="resident-polls-nav-item"
          >
            <span>₹</span>
            Payments
          </Link>

          <Link
            to="/resident/complaints"
            className="resident-polls-nav-item"
          >
            <span>⚒</span>
            Complaints
          </Link>

          <Link
            to="/resident/requests"
            className="resident-polls-nav-item"
          >
            <span>≡</span>
            Service Requests
          </Link>

          <Link
            to="/resident/visitors"
            className="resident-polls-nav-item"
          >
            <span>◉</span>
            Visitors
          </Link>

          <Link
            to="/resident/facilities"
            className="resident-polls-nav-item"
          >
            <span>□</span>
            Amenity Booking
          </Link>

          <Link
            to="/resident/notices"
            className="resident-polls-nav-item"
          >
            <span>!</span>
            Notices & Events
          </Link>

          <Link
            to="/resident/polls"
            className="resident-polls-nav-item active"
          >
            <span>✓</span>
            Polls & Voting
          </Link>

          <Link
            to="/resident/notifications"
            className="resident-polls-nav-item"
          >
            <span>○</span>
            Notifications
          </Link>

          <Link
            to="/resident/emergency"
            className="resident-polls-nav-item resident-polls-emergency"
          >
            <span>!</span>
            Emergency Contacts
          </Link>

        </nav>

        <div className="resident-polls-sidebar-bottom">

          <div className="resident-polls-user">
            <div className="resident-polls-avatar">
              R
            </div>

            <div>
              <strong>Resident</strong>
              <span>Resident</span>
            </div>
          </div>

          <button className="resident-polls-logout">
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      <main className="resident-polls-main">

        <header className="resident-polls-header">

          <div>
            <span className="resident-polls-overline">
              COMMUNITY
            </span>

            <h1>Polls & Voting</h1>

            <p>
              Share your opinion and participate in
              important community decisions.
            </p>
          </div>

          <div className="resident-polls-header-actions">

            <Link
              to="/resident/notifications"
              className="resident-polls-notification"
            >
              ○
            </Link>

            <Link
              to="/resident/profile"
              className="resident-polls-profile"
            >
              <div className="resident-polls-header-avatar">
                R
              </div>

              <div>
                <strong>Resident</strong>
                <span>Resident</span>
              </div>
            </Link>

          </div>

        </header>

        <section className="resident-polls-hero">

          <div className="resident-polls-hero-icon">
            ✓
          </div>

          <div>
            <span>YOUR VOICE MATTERS</span>

            <h2>
              Participate in your community
            </h2>

            <p>
              Vote on active community polls and
              help shape decisions in your society.
            </p>
          </div>

        </section>

        <section className="resident-polls-section">

          <div className="resident-polls-section-heading">

            <div>
              <span>ACTIVE POLLS</span>

              <h2>
                Community Polls
              </h2>
            </div>

            <div className="resident-polls-count">
              {polls.length} Active
            </div>

          </div>

          <div className="resident-polls-grid">

            {polls.map((poll) => (

              <div
                className="resident-poll-card"
                key={poll.id}
              >

                <div className="resident-poll-card-top">

                  <div className="resident-poll-icon">
                    ?
                  </div>

                  <span className="resident-poll-status">
                    ACTIVE
                  </span>

                </div>

                <h3>
                  {poll.question}
                </h3>

                <p className="resident-poll-description">
                  {poll.description}
                </p>

                <div className="resident-poll-meta">

                  <div>
                    <span>VOTING ENDS</span>
                    <strong>{poll.endDate}</strong>
                  </div>

                  <div>
                    <span>STATUS</span>
                    <strong>Open</strong>
                  </div>

                </div>

                <div className="resident-poll-options">

                  <span className="resident-poll-options-title">
                    Select your answer
                  </span>

                  {poll.options.map((option, index) => (

                    <label
                      className="resident-poll-option"
                      key={index}
                    >
                      <input
                        type="radio"
                        name={`poll-${poll.id}`}
                      />

                      <span className="resident-poll-radio"></span>

                      <span>
                        {option}
                      </span>

                    </label>

                  ))}

                </div>

                <button
                  className="resident-poll-vote-button"
                  type="button"
                >
                  Submit Vote
                  <span>→</span>
                </button>

              </div>

            ))}

          </div>

        </section>

        <section className="resident-polls-info">

          <div className="resident-polls-info-icon">
            i
          </div>

          <div>
            <h3>
              About Polls & Voting
            </h3>

            <p>
              Your vote helps the society understand
              residents' preferences and make community
              decisions. Each poll can be answered once.
            </p>
          </div>

        </section>

        <footer className="resident-polls-footer">

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
};

export default ResidentPolls;