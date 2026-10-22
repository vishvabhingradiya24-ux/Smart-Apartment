import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/StaffLayout";
import { timeAgo } from "../../utils/time";

const ICONS = {
  assignment: "📌",
  verification: "🔍",
  reopened: "↩️",
  approved: "✅",
  incident: "🚨"
};

const API = "http://localhost:5000/api/staff/notifications";

function StaffNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const tellMenu = () => window.dispatchEvent(new Event("staff-notifications-changed"));

  const openNotification = async (item) => {
    if (!item.is_read) {
      await fetch(`${API}/${item.id}/read`, { method: "PUT", headers: headers() }).catch(() => {});
      tellMenu();
    }

    if (item.link) navigate(item.link);
    else reload();
  };

  const markAllRead = async () => {
    await fetch(`${API}/read-all`, { method: "PUT", headers: headers() }).catch(() => {});
    tellMenu();
    reload();
  };

  return (
    <StaffLayout
      badge="NOTIFICATIONS"
      title="Notifications"
      subtitle="New assignments and important updates about your work."
      actions={
        <button
          type="button"
          className="sx-btn sx-btn-ghost"
          onClick={markAllRead}
          disabled={unread === 0}
        >
          Mark all as read
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
            You will be notified here when work is assigned to you.
          </div>
        ) : (
          <ul className="sx-list">
            {notifications.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sx-notification ${item.is_read ? "" : "is-unread"}`.trim()}
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
