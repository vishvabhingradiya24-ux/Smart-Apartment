import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  DoorOpen,
  Megaphone,
  UserRound,
  Vote,
  Waves,
} from "lucide-react";
import "../../css/resident/resident_dashboard.css";
import "../../css/resident/resident_shared.css";

const API = "http://localhost:5000/api";

const QUICK_ACCESS = [
  { title: "Payments", description: "Pay maintenance dues and see your history.", icon: CreditCard, path: "/resident/payment" },
  { title: "Complaints", description: "Raise a complaint and track its progress.", icon: ClipboardList, path: "/resident/complaints" },
  { title: "Visitors", description: "Approve or reject visitors at the gate.", icon: DoorOpen, path: "/resident/visitors" },
  { title: "Amenity Booking", description: "Book the clubhouse, gym, pool and more.", icon: Waves, path: "/resident/facilities" },
  { title: "Notices & Events", description: "Read society announcements and events.", icon: Megaphone, path: "/resident/notices" },
  { title: "Polls & Voting", description: "Have your say in community decisions.", icon: Vote, path: "/resident/polls" },
  { title: "Notifications", description: "Everything that needs your attention.", icon: Bell, path: "/resident/notifications" },
];

const formatDate = (value) => {
  const date = new Date(String(value).length <= 10 ? `${value}T00:00:00` : value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

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

  // Live numbers for the cards below the hero. Each source is optional.
  const [summary, setSummary] = useState({ loading: true });

  useEffect(() => {
    const controller = new AbortController();

    const loadSummary = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setSummary({ loading: false });
        return;
      }

      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
      const read = async (path) => {
        const response = await fetch(`${API}${path}`, { headers, signal: controller.signal });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return response.json();
      };

      const [payment, complaints, visitors, polls, notices] = await Promise.allSettled([
        read("/resident/payments/current"),
        read("/resident/complaints/my"),
        read("/resident/visitors"),
        read("/resident/polls"),
        read("/notices/active"),
      ]);

      if (controller.signal.aborted) return;

      const value = (result, pick) => (result.status === "fulfilled" ? pick(result.value) : null);

      setSummary({
        loading: false,
        payment: value(payment, (data) => data.payment || null),
        paymentLoaded: payment.status === "fulfilled",
        complaints: value(complaints, (data) => (Array.isArray(data) ? data : data.complaints || [])),
        visitors: value(visitors, (data) => data.visitors || []),
        polls: value(polls, (data) => data.polls || []),
        notices: value(notices, (data) => (Array.isArray(data.data) ? data.data : [])),
      });
    };

    loadSummary();

    return () => controller.abort();
  }, []);

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

  const { loading } = summary;
  const dash = (text) => (loading || text === null ? "—" : text);

  const duePayment = summary.payment?.status === "Pending" ? summary.payment : null;
  const openComplaints = summary.complaints
    ? summary.complaints.filter((item) => !["completed", "resolved", "rejected"].includes(String(item.status || "").toLowerCase())).length
    : null;
  const pendingVisitors = summary.visitors ? summary.visitors.filter((item) => item.status === "Pending") : null;
  const pollsToVote = summary.polls
    ? summary.polls.filter((poll) => poll.status === "Active" && poll.my_vote_option_id === null)
    : null;

  const attention = [
    ...(duePayment
      ? [{
          key: "payment",
          icon: CreditCard,
          title: "Maintenance payment is due",
          sub: `${formatMoney(duePayment.amount)}${Number(duePayment.penalty_amount) > 0 ? ` (incl. ${formatMoney(duePayment.penalty_amount)} late fee)` : ""}${duePayment.due_date ? ` · due ${formatDate(duePayment.due_date)}` : ""}`,
          path: "/resident/payment",
        }]
      : []),
    ...(pendingVisitors || []).map((visitor) => ({
      key: `visitor-${visitor.visitor_id}`,
      icon: DoorOpen,
      title: `${visitor.visitor_name || "A visitor"} is waiting for approval`,
      sub: visitor.purpose || "Approve or reject this request",
      path: "/resident/visitors",
    })),
    ...(pollsToVote || []).map((poll) => ({
      key: `poll-${poll.poll_id}`,
      icon: Vote,
      title: poll.question,
      sub: `Vote before ${formatDate(poll.end_date)}`,
      path: "/resident/polls",
    })),
  ].slice(0, 4);

  const latestNotices = (summary.notices || []).slice(0, 3);

  return (
    <div className="resident-dashboard-content rp-page">
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

        <section className="rp-stats" aria-label="Your account at a glance">
          <Link to="/resident/payment" className={`rp-stat${duePayment ? " is-warn" : ""}`}>
            <span className="rp-stat-icon"><CreditCard size={19} strokeWidth={1.8} aria-hidden="true" /></span>
            <div className="rp-stat-body">
              <small>Maintenance due</small>
              <strong>{loading || !summary.paymentLoaded ? "—" : duePayment ? formatMoney(duePayment.amount) : "All paid"}</strong>
            </div>
          </Link>

          <Link to="/resident/complaints" className="rp-stat">
            <span className="rp-stat-icon"><ClipboardList size={19} strokeWidth={1.8} aria-hidden="true" /></span>
            <div className="rp-stat-body"><small>Open complaints</small><strong>{dash(openComplaints)}</strong></div>
          </Link>

          <Link to="/resident/visitors" className={`rp-stat${pendingVisitors?.length ? " is-warn" : ""}`}>
            <span className="rp-stat-icon"><DoorOpen size={19} strokeWidth={1.8} aria-hidden="true" /></span>
            <div className="rp-stat-body"><small>Visitors to approve</small><strong>{dash(pendingVisitors ? pendingVisitors.length : null)}</strong></div>
          </Link>

          <Link to="/resident/polls" className={`rp-stat${pollsToVote?.length ? " is-warn" : ""}`}>
            <span className="rp-stat-icon"><Vote size={19} strokeWidth={1.8} aria-hidden="true" /></span>
            <div className="rp-stat-body"><small>Polls to vote in</small><strong>{dash(pollsToVote ? pollsToVote.length : null)}</strong></div>
          </Link>
        </section>

        <section className="rp-two-col">
          <div className="rp-panel">
            <div className="rp-panel-head">
              <h2>Needs your attention</h2>
              <Link to="/resident/notifications">View all</Link>
            </div>

            {attention.length === 0 ? (
              <div className="rp-panel-empty">
                <CheckCircle2 size={30} strokeWidth={1.5} aria-hidden="true" />
                <strong>{loading ? "Checking for updates…" : "You’re all caught up"}</strong>
                {!loading && <span>No payments, visitors or polls are waiting for you.</span>}
              </div>
            ) : (
              attention.map(({ key, icon: Icon, title, sub, path }) => (
                <Link to={path} className="rp-row" key={key}>
                  <span className="rp-row-icon"><Icon size={18} strokeWidth={1.7} aria-hidden="true" /></span>
                  <span className="rp-row-body">
                    <span className="rp-row-title">{title}</span>
                    <span className="rp-row-sub">{sub}</span>
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))
            )}
          </div>

          <div className="rp-panel">
            <div className="rp-panel-head">
              <h2>Latest notices</h2>
              <Link to="/resident/notices">View all</Link>
            </div>

            {latestNotices.length === 0 ? (
              <div className="rp-panel-empty">
                <Megaphone size={30} strokeWidth={1.5} aria-hidden="true" />
                <strong>{loading ? "Loading notices…" : "No notices right now"}</strong>
                {!loading && <span>Announcements from the administration will show up here.</span>}
              </div>
            ) : (
              latestNotices.map((notice) => (
                <Link to="/resident/notices" className="rp-row" key={notice.notice_id}>
                  <span className="rp-row-icon"><Megaphone size={18} strokeWidth={1.7} aria-hidden="true" /></span>
                  <span className="rp-row-body">
                    <span className="rp-row-title">{notice.title}</span>
                    <span className="rp-row-sub">
                      {notice.notice_type || "Notice"} · {formatDate(notice.publish_date)}
                    </span>
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rp-section">
          <div className="rp-section-head">
            <div>
              <span className="rp-eyebrow">RESIDENT SERVICES</span>
              <h2>Quick access</h2>
            </div>
          </div>

          <div className="rp-tiles">
            {QUICK_ACCESS.map(({ title, description, icon: Icon, path }) => (
              <Link to={path} className="rp-tile" key={path}>
                <span className="rp-tile-icon"><Icon size={21} strokeWidth={1.7} aria-hidden="true" /></span>
                <span className="rp-tile-body">
                  <strong>{title}</strong>
                  <span>{description}</span>
                </span>
                <ArrowRight size={17} className="rp-tile-arrow" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
    </div>
  );
}

export default ResidentDashboard;
