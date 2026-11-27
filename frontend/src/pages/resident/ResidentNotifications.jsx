import { Fragment, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Bell, BellRing, DoorOpen, Info, Megaphone, Sparkles, Vote } from "lucide-react";
import "../../css/resident/resident_shared.css";

const DAY = 24 * 60 * 60 * 1000;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "notice", label: "Notices" },
  { key: "poll", label: "Polls" },
  { key: "visitor", label: "Visitors" },
];

const TYPE_ICON = { notice: Megaphone, poll: Vote, visitor: DoorOpen };

const formatWhen = (time) =>
  time
    ? new Date(time).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";

function ResidentNotifications() {
  const {
    notifications: items,
    notificationLoading: loading,
    notificationError: error,
    notificationWarning,
    loadNotifications,
    markNotificationRead,
  } = useOutletContext();
  const [filter, setFilter] = useState("all");
  const [now] = useState(() => Date.now());
  const [markingId, setMarkingId] = useState("");
  const [actionError, setActionError] = useState("");

  const handleMarkRead = async (id) => {
    setMarkingId(id);
    setActionError("");
    try {
      await markNotificationRead(id);
    } catch (err) {
      setActionError(err.message || "Unable to update notification status.");
    } finally {
      setMarkingId("");
    }
  };

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

        {actionError && <p className="rp-notification-error" role="alert">{actionError}</p>}
        {notificationWarning && <p className="rp-notification-warning" role="status">{notificationWarning}</p>}

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
            <h3>{items.length === 0 ? "No notifications right now" : "Nothing in this list"}</h3>
            <p>
              {items.length === 0
                ? "You’re all caught up. New announcements, polls and visitor requests will appear here."
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

                  <article className={`rp-feed-item${item.attention ? " is-warn" : ""}${item.isRead ? " is-read" : ""}`}>
                    <span className="rp-feed-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.7} /></span>

                    <div className="rp-feed-body">
                      <div className="rp-feed-meta">
                        <span className={`rp-pill${item.attention ? " is-warn" : ""}`}>{item.label}</span>
                        <span className={`rp-pill${item.isRead ? " is-muted" : " is-unread"}`}>
                          {item.isRead ? "Read" : "Unread"}
                        </span>
                        {isNew && !item.attention && !item.isRead && <span className="rp-pill is-warn">New</span>}
                        {item.time > 0 && <time>{formatWhen(item.time)}</time>}
                        {item.by && <span>· Posted by {item.by}</span>}
                      </div>

                      <h3>{item.title}</h3>
                      {item.message && <p>{item.message}</p>}
                    </div>

                    <div className="rp-feed-actions">
                      {!item.isRead && (
                        <button
                          type="button"
                          className="rp-mark-read"
                          onClick={() => handleMarkRead(item.id)}
                          disabled={markingId === item.id}
                        >
                          {markingId === item.id ? "Saving..." : "Mark as read"}
                        </button>
                      )}
                      <Link
                        to={item.link}
                        className={`rp-btn rp-feed-action${item.attention ? "" : " is-ghost"}`}
                        onClick={() => {
                          if (!item.isRead) {
                            markNotificationRead(item.id).catch((err) => {
                              console.error("Mark Resident Notification Read Error:", err);
                            });
                          }
                        }}
                      >
                        {item.action}
                      </Link>
                    </div>
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
