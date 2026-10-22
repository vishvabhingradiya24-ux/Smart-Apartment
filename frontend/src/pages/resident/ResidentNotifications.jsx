import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/resident/residentNotifications.css";

const VISITORS_API_URL = "http://localhost:5000/api/resident/visitors";

function ResidentNotifications() {
  const [notices, setNotices] = useState([]);
  const [visitorRequests, setVisitorRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async (signal) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Your session has expired. Please log in again.");

      const response = await fetch("http://localhost:5000/api/notices/active", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load notifications.");
      setNotices(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);

      const visitorsResponse = await fetch(VISITORS_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        signal,
      });
      const visitorsData = await visitorsResponse.json();
      if (!visitorsResponse.ok) {
        throw new Error(visitorsData.message || "Unable to load visitor requests.");
      }
      const visitors = Array.isArray(visitorsData.visitors) ? visitorsData.visitors : [];
      setVisitorRequests(visitors.filter(
        (visitor) => visitor.registered_by_staff_id === undefined || visitor.registered_by_staff_id != null
      ));
      setError("");
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to load notifications.");
      setNotices([]);
      setVisitorRequests([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let controller = new AbortController();
    const load = async (signal) => {
      await loadNotifications(signal);
    };
    load(controller.signal);
    const refreshTimer = window.setInterval(() => {
      controller.abort();
      controller = new AbortController();
      loadNotifications(controller.signal);
    }, 30000);

    return () => {
      window.clearInterval(refreshTimer);
      controller.abort();
    };
  }, [loadNotifications]);

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <section className="resident-notifications-page">
      <header className="resident-notifications-header">
        <div>
          <span className="resident-notifications-eyebrow">RESIDENT UPDATES</span>
          <h1>Notifications</h1>
          <p>Stay up to date with apartment announcements and visitor approval requests.</p>
        </div>
      </header>

      <div className="resident-notifications-summary">
        <span className="resident-notifications-summary-icon">🔔</span>
        <div>
          <strong>
            {notices.length} current update{notices.length === 1 ? "" : "s"}
            {visitorRequests.length > 0 && ` · ${visitorRequests.length} visitor request${visitorRequests.length === 1 ? "" : "s"}`}
          </strong>
          <p>Active announcements and visitor requests with their approval status</p>
        </div>
      </div>

      {loading ? (
        <div className="resident-notifications-state">Loading notifications...</div>
      ) : error ? (
        <div className="resident-notifications-state error">
          <strong>Notifications could not be loaded</strong>
          <p>{error}</p>
          <button type="button" onClick={() => loadNotifications()}>Try again</button>
        </div>
      ) : notices.length === 0 && visitorRequests.length === 0 ? (
        <div className="resident-notifications-state">
          <span>🔔</span>
          <strong>You’re all caught up</strong>
          <p>New apartment announcements and visitor requests will appear here.</p>
        </div>
      ) : (
        <div className="resident-notifications-list">
          {visitorRequests.map((visitor) => (
            <article className="resident-notification-card visitor-request-notification" key={`visitor-${visitor.visitor_id}`}>
              <div className="resident-notification-icon">🚪</div>
              <div className="resident-notification-content">
                <div className="resident-notification-meta">
                  <span>
                    {visitor.status === "Pending" ? "Visitor approval required" : `Visitor ${visitor.status.toLowerCase()}`}
                  </span>
                  <time>{formatDate(visitor.created_at || visitor.visit_date)}</time>
                </div>
                <h2>
                  {visitor.status === "Pending"
                    ? `${visitor.visitor_name} is waiting for your approval`
                    : `Visitor request for ${visitor.visitor_name}`}
                </h2>
                <p>{visitor.purpose} · Visit time {String(visitor.expected_time || "").slice(0, 5) || "not specified"}</p>
                <Link className="visitor-request-link" to="/resident/visitors">
                  {visitor.status === "Pending" ? "Review visitor request" : "View visitor records"}
                </Link>
              </div>
            </article>
          ))}
          {notices.map((notice) => (
            <article className="resident-notification-card" key={notice.notice_id}>
              <div className="resident-notification-icon">{notice.notice_type === "Event" ? "📅" : "📣"}</div>
              <div className="resident-notification-content">
                <div className="resident-notification-meta">
                  <span>{notice.notice_type || "Notice"}</span>
                  <time>{formatDate(notice.publish_date)}</time>
                </div>
                <h2>{notice.title}</h2>
                <p>{notice.description}</p>
                {notice.posted_by_name && <small>Posted by {notice.posted_by_name}</small>}
              </div>
            </article>
          ))}
        </div>
      )}

      <footer className="resident-notifications-footer">
        <span>Need to revisit an announcement?</span>
        <Link to="/resident/notices">Open Notices &amp; Events →</Link>
      </footer>
    </section>
  );
}

export default ResidentNotifications;
