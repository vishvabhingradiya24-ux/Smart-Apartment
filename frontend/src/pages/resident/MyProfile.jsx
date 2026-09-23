import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/profile.css";

function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login again.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/resident/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load profile"
          );
        }

        setUser(data);
      } catch (err) {
        console.error("Profile Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-loader"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <div className="error-icon">!</div>
          <h2>Unable to Load Profile</h2>
          <p>{error}</p>

          <Link to="/resident" className="profile-back-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";

  const fullName =
    `${firstName} ${lastName}`.trim() || "Resident";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`
      .toUpperCase() || "R";

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="profile-page">

      <div className="profile-topbar">
        <div>
          <span className="profile-overline">
            RESIDENT SPACE
          </span>

          <h1>My Profile</h1>

          <p>
            Manage and view your residential account information.
          </p>
        </div>

        <Link
          to="/resident"
          className="profile-dashboard-btn"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="profile-container">

        <div className="profile-main-card">

          <div className="profile-cover">
            <div className="cover-pattern"></div>
          </div>

          <div className="profile-card-content">

            <div className="profile-avatar">
              {initials}
            </div>

            <div className="profile-heading">

              <div>
                <h2>{fullName}</h2>

                <p>{user?.email}</p>
              </div>

              <span className="resident-badge">
                <span className="badge-dot"></span>
                {user?.user_type || "Resident"}
              </span>

            </div>

            <div className="profile-divider"></div>

            <div className="profile-stats">

              <div className="profile-stat">
                <span>BLOCK / WING</span>
                <strong>
                  {user?.block_wing || "Not assigned"}
                </strong>
              </div>

              <div className="stat-separator"></div>

              <div className="profile-stat">
                <span>FLAT NUMBER</span>
                <strong>
                  {user?.flat_number || "Not assigned"}
                </strong>
              </div>

              <div className="stat-separator"></div>

              <div className="profile-stat">
                <span>MEMBER SINCE</span>
                <strong>
                  {formatDate(user?.created_at)}
                </strong>
              </div>

            </div>

          </div>

        </div>

        <div className="profile-info-grid">

          <div className="info-card">

            <div className="info-card-header">
              <div className="info-icon blue">
                👤
              </div>

              <div>
                <span>PERSONAL DETAILS</span>
                <h3>Personal Information</h3>
              </div>
            </div>

            <div className="info-fields">

              <div className="info-field">
                <label>First Name</label>
                <div>{user?.first_name || "Not available"}</div>
              </div>

              <div className="info-field">
                <label>Last Name</label>
                <div>{user?.last_name || "Not available"}</div>
              </div>

              <div className="info-field full">
                <label>Email Address</label>
                <div>{user?.email || "Not available"}</div>
              </div>

              <div className="info-field">
                <label>Phone Number</label>
                <div>{user?.phone || "Not available"}</div>
              </div>

              <div className="info-field">
                <label>Account Type</label>
                <div>{user?.user_type || "Resident"}</div>
              </div>

            </div>

          </div>

          <div className="info-card">

            <div className="info-card-header">
              <div className="info-icon green">
                🏠
              </div>

              <div>
                <span>RESIDENCE DETAILS</span>
                <h3>My Residence</h3>
              </div>
            </div>

            <div className="residence-profile">

              <div className="residence-row">
                <div className="residence-symbol">
                  B
                </div>

                <div>
                  <span>BLOCK / WING</span>
                  <strong>
                    {user?.block_wing || "Not assigned"}
                  </strong>
                </div>
              </div>

              <div className="residence-row">
                <div className="residence-symbol">
                  F
                </div>

                <div>
                  <span>FLAT NUMBER</span>
                  <strong>
                    {user?.flat_number || "Not assigned"}
                  </strong>
                </div>
              </div>

              <div className="residence-row">
                <div className="residence-symbol">
                  R
                </div>

                <div>
                  <span>RESIDENT TYPE</span>
                  <strong>
                    {user?.user_type || "Resident"}
                  </strong>
                </div>
              </div>

            </div>

          </div>

        </div>

        <div className="profile-security-card">

          <div className="security-icon">
            ✓
          </div>

          <div>
            <span>ACCOUNT STATUS</span>

            <h3>Your account is active</h3>

            <p>
              Your resident account is securely connected
              to the Smart Apartment management system.
            </p>
          </div>

          <div className="active-pill">
            Active
          </div>

        </div>

      </div>

    </div>
  );
}

export default MyProfile;