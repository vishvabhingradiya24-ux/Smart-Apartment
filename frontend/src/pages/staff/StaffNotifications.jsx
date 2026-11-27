import { API_BASE_URL } from "../../utils/apiBase.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/StaffLayout";
import { timeAgo } from "../../utils/time";

const ICONS = {
  assignment: "📌",
  verification: "🔍",
  reopened: "↩️",
  approved: "✅",
  incident: "🚨",
  visitor: "🚪"
};

const API = API_BASE_URL + "/api/staff/notifications";

function StaffNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  const headers = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    "Content-Type": "application/json"
  });

  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;

    fetch(API, { headers: headers() })
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => {
        if (cancelled) return;

        if (!ok) throw new Error(data.message || "Unable to load notifications.");

        setNotifications(data.notifications || []);
        setUnread(Number(data.unread) || 0);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Unable to load notifications.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setReloadKey((key) => key + 1);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  const tellMenu = (detail) => window.dispatchEvent(new CustomEvent("staff-notifications-changed", { detail }));

  const openNotification = async (item) => {
    if (markingAll || updatingId !== null) return;
    if (!item.is_read) {
      setUpdatingId(item.id);
      setError("");
      try {
        const response = await fetch(`${API}/${item.id}/read`, { method: "PUT", headers: headers() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to mark notification as read.");

        setNotifications((current) => current.map((notification) =>
          notification.id === item.id ? { ...notification, is_read: 1 } : notification
        ));
        setUnread((current) => Math.max(0, current - 1));
        tellMenu({ unreadDelta: -1 });
      } catch (err) {
        setError(err.message || "Unable to mark notification as read.");
        return;
      } finally {
        setUpdatingId(null);
      }
    }

    if (item.link) navigate(item.link);
    else reload();
  };

  const markAllRead = async () => {
    if (markingAll || unread === 0) return;
    setMarkingAll(true);
    setError("");
    try {
      const response = await fetch(`${API}/read-all`, { method: "PUT", headers: headers() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to mark notifications as read.");

      setNotifications((current) => current.map((notification) => ({ ...notification, is_read: 1 })));
      setUnread(0);
      tellMenu({ unreadCount: 0 });
    } catch (err) {
      setError(err.message || "Unable to mark notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <StaffLayout
      badge="NOTIFICATIONS"
      title="Notifications"
      subtitle="New assignments, visitor pre-registrations, and important work updates."
      actions={
        <button
          type="button"
          className="sx-btn sx-btn-ghost"
          onClick={markAllRead}
          disabled={unread === 0 || markingAll || updatingId !== null}
        >
          {markingAll ? "Saving..." : "Mark all as read"}
        </button>
      }
    >
      <section className="sx-card">
        <div className="sx-card-head">
          <div>
            <h2>Latest updates</h2>
            <p>
              {unread > 0
                ? `${unread} unread notification${unread === 1 ? "" : "s"}`
                : "You are all caught up."}
            </p>
          </div>
        </div>

        {error && <p className="sx-alert sx-alert-error">{error}</p>}

        {loading ? (
          <div className="sx-empty">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="sx-empty">
            <strong>No notifications yet</strong>
            Security staff will be notified here about resident visitor pre-registrations, along with assignments and work updates.
          </div>
        ) : (
          <ul className="sx-list">
            {notifications.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sx-notification ${item.is_read ? "" : "is-unread"}`.trim()}
                  disabled={updatingId !== null || markingAll}
                  onClick={() => openNotification(item)}
                >
                  <span className="sx-notification-icon" aria-hidden="true">
                    {ICONS[item.type] || "🔔"}
                  </span>

                  <span>
                    <strong>{item.title}</strong>
                    {item.message && <p>{item.message}</p>}
                    <small>{timeAgo(item.created_at)}</small>
                  </span>

                  {!item.is_read && <span className="sx-dot" aria-label="Unread" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </StaffLayout>
  );
}

export default StaffNotifications;
