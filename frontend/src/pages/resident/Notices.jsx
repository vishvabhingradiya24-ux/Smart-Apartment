import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Info, Megaphone, Sparkles } from "lucide-react";
import "../../css/resident/resident_shared.css";

const DAY = 24 * 60 * 60 * 1000;
const LONG_TEXT = 220;

const toTime = (value) => {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(time) ? null : time;
};

const formatDate = (value) => {
  const time = toTime(value);
  if (time === null) return "Not available";

  return new Date(time).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// "Expires today", "Expires in 3 days" or "No expiry".
const expiryLabel = (value, now) => {
  const time = toTime(value);
  if (time === null) return { text: "No expiry", soon: false };

  const days = Math.ceil((time - now) / DAY);
  if (days <= 0) return { text: "Expires today", soon: true };
  if (days === 1) return { text: "Expires tomorrow", soon: true };

  return { text: `Expires in ${days} days`, soon: days <= 3 };
};

function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    const loadNotices = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          throw new Error("Login session not found. Please log in again.");
        }

        const response = await fetch(
          "http://localhost:5000/api/notices/active",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const responseText = await response.text();

        let data = {};

        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          throw new Error("Server returned an invalid response.");
        }

        if (!response.ok) {
          throw new Error(
            data.message || `Request failed (${response.status})`
          );
        }

        const noticeList = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];

        if (!cancelled) {
          setNotices(noticeList);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.error("Notice fetch error:", err);

        if (!cancelled) {
          setNotices([]);
          setError(err.message || "Unable to load notices.");
          setLoading(false);
        }
      }
    };

    loadNotices();

    return () => {
      cancelled = true;
    };
  }, []);

  const retryNotices = () => {
    window.location.reload();
  };

  const types = useMemo(
    () => [...new Set(notices.map((notice) => notice.notice_type || "General"))],
    [notices]
  );

  const visibleNotices = notices.filter(
    (notice) => typeFilter === "All" || (notice.notice_type || "General") === typeFilter
  );

  const isNew = (notice) => {
    const time = toTime(notice.publish_date);
    return time !== null && now - time <= 3 * DAY;
  };

  const newCount = notices.filter(isNew).length;
  const expiringCount = notices.filter((notice) => expiryLabel(notice.expiry_date, now).soon && notice.expiry_date).length;

  return (
    <div className="rp-page">
      <header className="rp-banner">
        <div className="rp-banner-text">
          <span className="rp-banner-eyebrow">COMMUNITY INFORMATION</span>
          <h1>Notices &amp; Events</h1>
          <p>
            Stay updated with important apartment announcements,
            maintenance information and community updates.
          </p>
        </div>
        <span className="rp-banner-icon" aria-hidden="true"><Megaphone size={28} strokeWidth={1.6} /></span>
      </header>

      <section className="rp-stats is-three" aria-label="Notice summary">
        <div className="rp-stat">
          <span className="rp-stat-icon"><Megaphone size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>Active notices</small><strong>{loading ? "—" : notices.length}</strong></div>
        </div>
        <div className="rp-stat">
          <span className="rp-stat-icon"><Sparkles size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>New in the last 3 days</small><strong>{loading ? "—" : newCount}</strong></div>
        </div>
        <div className={`rp-stat${expiringCount > 0 ? " is-warn" : ""}`}>
          <span className="rp-stat-icon"><CalendarClock size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>Expiring soon</small><strong>{loading ? "—" : expiringCount}</strong></div>
        </div>
      </section>

      <section className="rp-section">
        <div className="rp-section-head">
          <div>
            <span className="rp-eyebrow">SOCIETY NOTICES</span>
            <h2>Latest announcements</h2>
          </div>

          <span className="rp-chip">
            {visibleNotices.length} Notice
            {visibleNotices.length !== 1 ? "s" : ""}
          </span>
        </div>

        {types.length > 1 && (
          <div className="rp-filters" role="group" aria-label="Filter notices by type">
            {["All", ...types].map((item) => (
              <button
                key={item}
                type="button"
                className={`rp-filter${typeFilter === item ? " is-active" : ""}`}
                aria-pressed={typeFilter === item}
                onClick={() => setTypeFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="rp-loading">
            <span className="rp-spinner" aria-hidden="true" />
            Loading the latest announcements...
          </div>
        )}

        {!loading && error && (
          <div className="rp-empty is-error">
            <span className="rp-empty-icon" aria-hidden="true"><Info size={24} strokeWidth={1.7} /></span>
            <h3>Unable to load notices</h3>
            <p>{error}</p>
            <button type="button" onClick={retryNotices} className="rp-btn">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && notices.length === 0 && (
          <div className="rp-empty">
            <span className="rp-empty-icon" aria-hidden="true"><Megaphone size={24} strokeWidth={1.7} /></span>
            <h3>No notices available</h3>
            <p>
              New society notices and announcements will appear
              here when published by the administration.
            </p>
          </div>
        )}

        {!loading && !error && notices.length > 0 && (
          <div className="rp-grid is-wide">
            {visibleNotices.map((notice, index) => {
              const id = notice.notice_id ?? notice.id ?? index;
              const text = notice.description || "No description provided.";
              const isLong = text.length > LONG_TEXT;
              const isOpen = Boolean(expanded[id]);
              const expiry = expiryLabel(notice.expiry_date, now);

              return (
                <article className="rp-card" key={id}>
                  <div className="rp-card-top">
                    <span className="rp-pill">{notice.notice_type || "General"}</span>

                    {isNew(notice) ? (
                      <span className="rp-pill is-warn"><Sparkles size={12} aria-hidden="true" /> New</span>
                    ) : (
                      <span className="rp-pill is-muted">Active</span>
                    )}
                  </div>

                  <h3>{notice.title || "Untitled notice"}</h3>

                  <p className={`rp-card-text${isLong && !isOpen ? " is-clamped" : ""}`}>{text}</p>

                  {isLong && (
                    <button
                      type="button"
                      className="rp-link-button"
                      aria-expanded={isOpen}
                      onClick={() => setExpanded((current) => ({ ...current, [id]: !isOpen }))}
                    >
                      {isOpen ? "Show less" : "Read more"}
                    </button>
                  )}

                  <div className="rp-meta">
                    <div><small>Published</small><strong>{formatDate(notice.publish_date)}</strong></div>
                    <div>
                      <small>Expires</small>
                      <strong>{notice.expiry_date ? formatDate(notice.expiry_date) : "No expiry"}</strong>
                    </div>
                  </div>

                  <div className="rp-card-foot">
                    <span>{notice.posted_by_name ? `Posted by ${notice.posted_by_name}` : "Posted by the administration"}</span>
                    <span className={`rp-pill ${expiry.soon && notice.expiry_date ? "is-warn" : "is-muted"}`}>{expiry.text}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Notices;
