import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  ClipboardList,
  CreditCard,
  DoorOpen,
  Megaphone,
  UserRound,
  Vote,
  Waves,
  Wrench,
} from "lucide-react";
import "../../css/resident/resident_dashboard.css";

function ResidentDashboard() {
  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
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
  const services = [
    { title: "Payments", description: "Manage maintenance payments and payment history.", icon: CreditCard, path: "/resident/payment" },
    { title: "Complaints", description: "Report and track apartment issues.", icon: ClipboardList, path: "/resident/complaints" },
    { title: "Service Requests", description: "Request and track residential services.", icon: Wrench, path: "/resident/requests" },
    { title: "Visitors", description: "Manage visitor approvals and entries.", icon: DoorOpen, path: "/resident/visitors" },
    { title: "Amenity Booking", description: "Reserve community facilities and amenities.", icon: Waves, path: "/resident/facilities" },
    { title: "Notices & Events", description: "Read community updates and announcements.", icon: Megaphone, path: "/resident/notices" },
    { title: "Polls & Voting", description: "Share your opinion on community decisions.", icon: Vote, path: "/resident/polls" },
    { title: "Notifications", description: "Check the latest updates for your account.", icon: Bell, path: "/resident/notifications" },
    { title: "My Profile", description: "View and update your resident information.", icon: UserRound, path: "/resident/profile" },
  ];

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

        <section className="services-section" id="resident-services">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">RESIDENT SERVICES</span>
              <h2>Quick Access</h2>
            </div>
          </div>

          <div className="services-grid">
            {services.map(({ title, description, icon: Icon, path }, index) => (
              <Link to={path} className={`service-card${index === 0 ? " service-primary" : ""}`} key={path}>
                <div className="service-icon"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></div>
                <div className="service-content">
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <span className="service-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
    </div>
  );
}

export default ResidentDashboard;