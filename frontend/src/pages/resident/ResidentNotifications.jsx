import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/resident/residentNotifications.css";

function ResidentNotifications() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired. Please log in again.");

      const response = await fetch("http://localhost:5000/api/notices/active", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load notifications.");
      setNotices(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to load notifications.");
      setNotices([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadNotifications(controller.signal);
    return () => controller.abort();
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
          <p>Stay up to date with announcements from your apartment management.</p>
        </div>
        <button type="button" onClick={() => loadNotifications()} disabled={loading}>
          ↻ Refresh
        </button>
      </header>

      <div className="resident-notifications-summary">
        <span className="resident-notifications-summary-icon">🔔</span>
        <div>
          <strong>{notices.length} current update{notices.length === 1 ? "" : "s"}</strong>
          <p>Active announcements and notices for residents</p>
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
      ) : notices.length === 0 ? (
        <div className="resident-notifications-state">
          <span>🔔</span>
          <strong>You’re all caught up</strong>
          <p>New apartment announcements will appear here.</p>
        </div>
      ) : (
        <div className="resident-notifications-list">
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
