import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, UserRound } from "lucide-react";
import "../../css/resident/resident_dashboard.css";

function ResidentDashboard() {
  const [user] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) return {};
      const parsedUser = JSON.parse(storedUser);
      return parsedUser?.user || parsedUser?.data?.user || parsedUser || {};
    } catch (error) {
      console.error("User data error:", error);
      return {};
    }
  });

  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";

  const fullName = `${firstName} ${lastName}`.trim() || "Resident";

  const initials =
    firstName && lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      : firstName
        ? firstName.charAt(0).toUpperCase()
        : "R";

  const blockWing = user?.block_wing || "";
  const flatNumber = user?.flat_number || "";
  const userType = user?.user_type || "Resident";

  return (
    <div className="resident-dashboard-content">
        <section className="residence-hero">
          <div className="residence-photo"></div>
          <div className="residence-photo-overlay"></div>

          <div className="residence-content">
            <span className="section-eyebrow">YOUR APARTMENT</span>
            <h2>
              Home,
              <br />
              made easier.
            </h2>
            <p className="residence-description">
              Manage everyday services, stay connected with your community, and
              keep your residence details close at hand.
            </p>
            <div className="residence-actions">
              <Link to="/resident/payment" className="residence-button">
                <CreditCard size={16} aria-hidden="true" />
                Open payments
              </Link>
              <Link to="/resident/profile" className="residence-secondary-button">
                View profile
              </Link>
            </div>
          </div>

          <div className="residence-info">
            <div className="residence-user">
              <div className="large-avatar">{initials}</div>
              <div>
                <span>RESIDENT PROFILE</span>
                <h3>{fullName}</h3>
              </div>
            </div>

            <div className="residence-details">
              <div className="residence-detail">
                <span>BLOCK / WING</span>
                <strong>{blockWing || "—"}</strong>
              </div>

              <div className="residence-detail">
                <span>FLAT NUMBER</span>
                <strong>{flatNumber || "—"}</strong>
              </div>

              <div className="residence-detail">
                <span>USER TYPE</span>
                <strong>{userType}</strong>
              </div>
            </div>
            <Link to="/resident/profile" className="residence-profile-link">
              <UserRound size={15} aria-hidden="true" />
              Manage profile
            </Link>
          </div>
        </section>

    </div>
  );
}

export default ResidentDashboard;