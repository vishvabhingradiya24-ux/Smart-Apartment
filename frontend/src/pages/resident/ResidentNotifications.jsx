import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BellRing, DoorOpen, Info, Megaphone, Sparkles, Vote } from "lucide-react";
import "../../css/resident/resident_shared.css";

const API = "http://localhost:5000/api";
const DAY = 24 * 60 * 60 * 1000;
const REFRESH_MS = 30000;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "notice", label: "Notices" },
  { key: "poll", label: "Polls" },
  { key: "visitor", label: "Visitors" },
];

const TYPE_ICON = { notice: Megaphone, poll: Vote, visitor: DoorOpen };

const toTime = (value) => {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(time) ? 0 : time;
};

const formatWhen = (time) =>
  time
    ? new Date(time).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";

const formatDay = (value) => {
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "soon"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// Visitor requests added by Security (and older records without that field) need
// the resident's decision; visitors the resident registered themselves do not.
const isSecurityRequest = (visitor) =>
  visitor.registered_by_staff_id === undefined || visitor.registered_by_staff_id != null;

// Turns the three data sources into one list of updates.
const buildItems = ({ notices, polls, visitors }) => [
  ...notices.map((notice) => ({
    id: `notice-${notice.notice_id}`,
    type: "notice",
    label: notice.notice_type || "Notice",
    title: notice.title,
    message: notice.description,
    time: toTime(notice.publish_date),
    by: notice.posted_by_name,
    link: "/resident/notices",
    action: "Open notice",
    attention: false,
  })),
  ...polls
    .filter((poll) => poll.status === "Active" && poll.my_vote_option_id === null)
    .map((poll) => ({
      id: `poll-${poll.poll_id}`,
      type: "poll",
      label: "Poll",
      title: `Vote needed: ${poll.question}`,
      message: `Voting ends on ${formatDay(poll.end_date)}. Choose an answer before then.`,
      time: toTime(poll.created_at),
      link: "/resident/polls",
      action: "Vote now",
      attention: true,
    })),
  ...visitors.filter(isSecurityRequest).map((visitor) => {
    const pending = visitor.status === "Pending";
    const name = visitor.visitor_name || "A visitor";
    const time = visitor.expected_time ? String(visitor.expected_time).slice(0, 5) : "";
    const details = [visitor.purpose, time && `Visit time ${time}`].filter(Boolean).join(" · ");

    return {
      id: `visitor-${visitor.visitor_id}`,
      type: "visitor",
      label: pending ? "Visitor approval" : `Visitor ${String(visitor.status || "").toLowerCase()}`,
      title: pending ? `${name} is waiting for your approval` : `Visitor request for ${name}`,
      message: details || (pending ? "Approve or reject this visitor request." : ""),
      time: toTime(visitor.created_at || visitor.visit_date),
      link: "/resident/visitors",
      action: pending ? "Review" : "View visitors",
      attention: pending,
    };
  }),
];

function ResidentNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [now] = useState(() => Date.now());

  const loadNotifications = useCallback(async (signal) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Your session has expired. Please log in again.");

      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
      const read = async (path) => {
        const response = await fetch(`${API}${path}`, { headers, signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load notifications.");
        return data;
      };

      const [noticeResult, pollResult, visitorResult] = await Promise.allSettled([
        read("/notices/active"),
        read("/resident/polls"),
        read("/resident/visitors"),
      ]);

      if (signal?.aborted) return;

      // Notices are the main feed, so a failure there is an error; polls and visitors are extras.
      if (noticeResult.status === "rejected") throw noticeResult.reason;

      const noticeData = noticeResult.value;

      setItems(
        buildItems({
          notices: Array.isArray(noticeData.data) ? noticeData.data : Array.isArray(noticeData) ? noticeData : [],
          polls: pollResult.status === "fulfilled" ? pollResult.value.polls || [] : [],
          visitors: visitorResult.status === "fulfilled" ? visitorResult.value.visitors || [] : [],
        })
      );
      setError("");
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to load notifications.");
      setItems([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // Load once, then refresh every 30 seconds so new visitor requests show up.
  useEffect(() => {
    let controller = new AbortController();

    const load = async () => {
      await loadNotifications(controller.signal);
    };

    load();

    const refreshTimer = window.setInterval(() => {
      controller.abort();
      controller = new AbortController();
      loadNotifications(controller.signal);
    }, REFRESH_MS);

    return () => {
      window.clearInterval(refreshTimer);
      controller.abort();
    };
  }, [loadNotifications]);

  const counts = useMemo(
    () => ({
      all: items.length,
      notice: items.filter((item) => item.type === "notice").length,
      poll: items.filter((item) => item.type === "poll").length,
      visitor: items.filter((item) => item.type === "visitor").length,
    }),
    [items]
  );

  const attentionCount = items.filter((item) => item.attention).length;
  const todayCount = items.filter((item) => item.time && now - item.time < DAY).length;

  // Items that need an answer come first, then the rest by date.
  const visible = useMemo(
    () =>
      items
        .filter((item) => filter === "all" || item.type === filter)
        .sort((a, b) => Number(b.attention) - Number(a.attention) || b.time - a.time),
    [items, filter]
  );

  const groupOf = (item) => {
    if (item.attention) return "Needs your attention";
    const age = now - item.time;
    if (age < DAY) return "Today";
    if (age < 7 * DAY) return "This week";
    return "Earlier";
  };

  return (
    <div className="rp-page">
      <header className="rp-banner">
        <div className="rp-banner-text">
          <span className="rp-banner-eyebrow">RESIDENT UPDATES</span>
          <h1>Notifications</h1>
          <p>Announcements, polls and visitor approval requests that need your attention, in one place.</p>
        </div>
        <span className="rp-banner-icon" aria-hidden="true"><BellRing size={28} strokeWidth={1.6} /></span>
      </header>

      <section className="rp-stats is-three" aria-label="Notification summary">
        <div className="rp-stat">
          <span className="rp-stat-icon"><Bell size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>All updates</small><strong>{loading ? "—" : items.length}</strong></div>
        </div>
        <div className={`rp-stat${attentionCount > 0 ? " is-warn" : ""}`}>
          <span className="rp-stat-icon"><BellRing size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>Need your action</small><strong>{loading ? "—" : attentionCount}</strong></div>
        </div>
        <div className="rp-stat">
          <span className="rp-stat-icon"><Sparkles size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>New today</small><strong>{loading ? "—" : todayCount}</strong></div>
        </div>
      </section>

      <section className="rp-section">
        <div className="rp-section-head">
          <div>
            <span className="rp-eyebrow">YOUR FEED</span>
            <h2>Recent updates</h2>
          </div>
          <span className="rp-chip">{visible.length} update{visible.length === 1 ? "" : "s"}</span>
        </div>

        {items.length > 0 && (
          <div className="rp-filters" role="group" aria-label="Filter updates by type">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`rp-filter${filter === key ? " is-active" : ""}`}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              >
                {label}
                <small>{counts[key]}</small>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="rp-loading">
            <span className="rp-spinner" aria-hidden="true" />
            Loading notifications...
          </div>
        ) : error ? (
          <div className="rp-empty is-error">
            <span className="rp-empty-icon" aria-hidden="true"><Info size={24} strokeWidth={1.7} /></span>
            <h3>Notifications could not be loaded</h3>
            <p>{error}</p>
            <button type="button" className="rp-btn" onClick={() => loadNotifications()}>Try again</button>
          </div>
        ) : visible.length === 0 ? (
          <div className="rp-empty">
            <span className="rp-empty-icon" aria-hidden="true"><Bell size={24} strokeWidth={1.7} /></span>
            <h3>{items.length === 0 ? "You’re all caught up" : "Nothing in this list"}</h3>
            <p>
              {items.length === 0
                ? "New announcements, polls and visitor requests will appear here."
                : "Try another filter to see the rest of your updates."}
            </p>
          </div>
        ) : (
          <div className="rp-feed">
            {visible.map((item, index) => {
              const Icon = TYPE_ICON[item.type] || Bell;
              const group = groupOf(item);
              const showGroup = index === 0 || groupOf(visible[index - 1]) !== group;
              const isNew = item.time && now - item.time < 3 * DAY;

              return (
                <Fragment key={item.id}>
                  {showGroup && <p className="rp-feed-group">{group}</p>}

                  <article className={`rp-feed-item${item.attention ? " is-warn" : ""}`}>
                    <span className="rp-feed-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.7} /></span>

                    <div className="rp-feed-body">
                      <div className="rp-feed-meta">
                        <span className={`rp-pill${item.attention ? " is-warn" : ""}`}>{item.label}</span>
                        {isNew && !item.attention && <span className="rp-pill is-warn">New</span>}
                        {item.time > 0 && <time>{formatWhen(item.time)}</time>}
                        {item.by && <span>· Posted by {item.by}</span>}
                      </div>

                      <h3>{item.title}</h3>
                      {item.message && <p>{item.message}</p>}
                    </div>

                    <Link to={item.link} className={`rp-btn rp-feed-action${item.attention ? "" : " is-ghost"}`}>
                      {item.action}
                    </Link>
                  </article>
                </Fragment>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ResidentNotifications;
