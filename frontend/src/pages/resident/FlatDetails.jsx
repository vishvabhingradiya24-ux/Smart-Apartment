import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/flatDetails.css";

function FlatDetails() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFlatDetails = async () => {
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
            data.message || "Unable to load flat details"
          );
        }

        setUser(data);
      } catch (err) {
        console.error("Flat Details Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlatDetails();
  }, []);

  if (loading) {
    return (
      <div className="flat-page">
        <div className="flat-loading">
          <div className="flat-loader"></div>
          <p>Loading flat details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flat-page">
        <div className="flat-error">
          <div className="flat-error-icon">!</div>

          <h2>Unable to Load Flat Details</h2>

          <p>{error}</p>

          <Link to="/resident" className="flat-back-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const fullName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "Resident";

  const initials =
    `${user?.first_name?.charAt(0) || ""}${
      user?.last_name?.charAt(0) || ""
    }`.toUpperCase() || "R";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  return (
    <div className="flat-page">

      {/* TOP BAR */}
      <div className="flat-topbar">

        <div>
          <span className="flat-overline">
            RESIDENT SPACE
          </span>

          <h1>Flat Details</h1>

          <p>
            View your apartment and residence information.
          </p>
        </div>

        <Link
          to="/resident"
          className="flat-dashboard-btn"
        >
          ← Dashboard
        </Link>

      </div>

      <div className="flat-container">

        {/* MAIN FLAT OVERVIEW */}
        <div className="flat-overview">

          <div className="flat-overview-left">

            <div className="flat-home-icon">
              🏠
            </div>

            <div>
              <span className="flat-label">
                YOUR RESIDENCE
              </span>

              <h2>
                {user?.flat_number || "Not assigned"}
              </h2>

              <p>
                {user?.block_wing || "Block/Wing not assigned"}
              </p>
            </div>

          </div>

          <div className="flat-status">
            <span className="status-dot"></span>
            Active Residence
          </div>

        </div>

        {/* QUICK DETAILS */}
        <div className="flat-quick-grid">

          <div className="flat-quick-card">

            <div className="quick-icon">
              B
            </div>

            <div>
              <span>BLOCK / WING</span>
              <strong>
                {user?.block_wing || "Not assigned"}
              </strong>
            </div>

          </div>

          <div className="flat-quick-card">

            <div className="quick-icon">
              F
            </div>

            <div>
              <span>FLAT NUMBER</span>
              <strong>
                {user?.flat_number || "Not assigned"}
              </strong>
            </div>

          </div>

          <div className="flat-quick-card">

            <div className="quick-icon">
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

        {/* CONTENT GRID */}
        <div className="flat-content-grid">

          {/* RESIDENCE INFORMATION */}
          <div className="flat-card">

            <div className="flat-card-header">

              <div className="flat-card-icon">
                🏠
              </div>

              <div>
                <span>APARTMENT INFORMATION</span>
                <h3>Residence Details</h3>
              </div>

            </div>

            <div className="flat-details-list">

              <div className="flat-detail-row">

                <div className="detail-symbol">
                  B
                </div>

                <div>
                  <span>Block / Wing</span>
                  <strong>
                    {user?.block_wing || "Not assigned"}
                  </strong>
                </div>

              </div>

              <div className="flat-detail-row">

                <div className="detail-symbol">
                  #
                </div>

                <div>
                  <span>Flat Number</span>
                  <strong>
                    {user?.flat_number || "Not assigned"}
                  </strong>
                </div>

              </div>

              <div className="flat-detail-row">

                <div className="detail-symbol">
                  R
                </div>

                <div>
                  <span>Resident Type</span>
                  <strong>
                    {user?.user_type || "Resident"}
                  </strong>
                </div>

              </div>

            </div>

          </div>

          {/* RESIDENT INFORMATION */}
          <div className="flat-card">

            <div className="flat-card-header">

              <div className="flat-card-icon">
                👤
              </div>

              <div>
                <span>RESIDENT INFORMATION</span>
                <h3>Primary Resident</h3>
              </div>

            </div>

            <div className="resident-summary">

              <div className="resident-avatar">
                {initials}
              </div>

              <div className="resident-summary-info">

                <h3>{fullName}</h3>

                <span>
                  {user?.user_type || "Resident"}
                </span>

              </div>

            </div>

            <div className="resident-contact">

              <div className="contact-row">

                <span>Email</span>

                <strong>
                  {user?.email || "Not available"}
                </strong>

              </div>

              <div className="contact-row">

                <span>Phone</span>

                <strong>
                  {user?.phone || "Not available"}
                </strong>

              </div>

            </div>

          </div>

        </div>

        {/* MEMBER INFORMATION */}
        <div className="flat-member-card">

          <div className="member-icon">
            ✓
          </div>

          <div className="member-content">

            <span>MEMBERSHIP INFORMATION</span>

            <h3>Resident since {memberSince}</h3>

            <p>
              This residence is linked to your Smart Apartment
              resident account.
            </p>

          </div>

          <div className="member-badge">
            Verified
          </div>

        </div>

      </div>

    </div>
  );
}

export default FlatDetails;