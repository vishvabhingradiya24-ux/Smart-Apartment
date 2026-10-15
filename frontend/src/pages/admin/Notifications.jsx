import { useEffect, useMemo, useState } from "react";
import "../../css/notifications.css";

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  : "—";
const formatTime = (value) => value
  ? new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  : "—";

const Notifications = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Notifications could not be loaded");
        setNotifications(data.notifications || []);
      } catch (err) {
        setError(err.message || "Notifications could not be loaded");
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [token]);

  const filtered = useMemo(() => notifications.filter((item) => {
    const searchValue = search.toLowerCase();
    const matchesSearch = [item.title, item.message, String(item.userId || ""), item.actorName]
      .some((value) => String(value || "").toLowerCase().includes(searchValue));
    return matchesSearch && (typeFilter === "All" || item.type === typeFilter);
  }), [notifications, search, typeFilter]);
  const types = [...new Set(notifications.map((item) => item.type))];
  const todayCount = notifications.filter((item) => item.date && new Date(item.date).toDateString() === new Date().toDateString()).length;
  const getIcon = (type) => ({ Payment: "💳", Complaint: "📝", Booking: "🏊", Notice: "📢", Visitor: "🚪", Task: "🔧" }[type] || "🔔");

  const toggleRead = async (notification) => {
    const isRead = !notification.isRead;
    setUpdatingId(notification.id);
    setError("");
    try {
      const response = await fetch(`http://localhost:5000/api/admin/notifications/${encodeURIComponent(notification.id)}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Notification status could not be updated");
      setNotifications((current) => current.map((item) =>
        item.id === notification.id ? { ...item, isRead: data.isRead } : item
      ));
    } catch (err) {
      setError(err.message || "Notification status could not be updated");
    } finally {
      setUpdatingId(null);
    }
  };

  return <div className="notifications-page">
    <header className="notifications-header">
      <div>
        <span className="notifications-overline">ADMIN PANEL <span> / </span> ACTIVITY CENTER</span>
        <h1>Notifications</h1>
        <p>Stay up to date with the latest activity across your community.</p>
      </div>
      <div className="notifications-live"><span /> Live activity feed</div>
    </header>
    <div className="notification-stats">
      <div className="notification-stat-card stat-total"><div className="notification-stat-icon">🔔</div><div><span>Total Activity</span><strong>{notifications.length}</strong></div></div>
      <div className="notification-stat-card stat-today"><div className="notification-stat-icon">📅</div><div><span>Today</span><strong>{todayCount}</strong></div></div>
      <div className="notification-stat-card stat-types"><div className="notification-stat-icon">📂</div><div><span>Activity Types</span><strong>{types.length}</strong></div></div>
      <div className="notification-stat-card stat-showing"><div className="notification-stat-icon">🗂️</div><div><span>Matching Results</span><strong>{filtered.length}</strong></div></div>
    </div>
    <div className="notification-filter-card">
      <div className="notification-filter-heading"><div><strong>Activity feed</strong><span>Find an update by keyword or type</span></div></div>
      <div className="notification-search"><span>⌕</span><input aria-label="Search activity" placeholder="Search title, details, resident or staff..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      <select aria-label="Filter by activity type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="All">All activity types</option>{types.map((type) => <option key={type}>{type}</option>)}</select>
    </div>
    {error && <p className="page-error" role="alert">{error}</p>}
    <div className="notification-section">
      <div className="notification-section-header">
        <div><span className="notification-section-kicker">YOUR COMMUNITY</span><h2>Recent activity</h2><p>Showing {filtered.length} of up to 30 latest updates</p></div>
        <span className="notification-count">{filtered.length} <small>items</small></span>
      </div>
      <div className="notification-list">
        <table className="notification-table">
          <thead><tr><th>Icon</th><th>Notification title</th><th>Category</th><th>Date</th><th>Time</th><th>Read</th><th>Resident / Staff</th></tr></thead>
          <tbody>{loading
            ? <tr><td colSpan="7" className="notification-table-empty">Loading activity…</td></tr>
            : filtered.length === 0
              ? <tr><td colSpan="7" className="notification-table-empty">No matching activity found.</td></tr>
              : filtered.map((item) => <tr className={item.isRead ? "notification-row-read" : "notification-row-unread"} key={item.id}>
                <td><span className={`notification-icon type-${String(item.type || "activity").toLowerCase()}`}>{getIcon(item.type)}</span></td>
                <td><div className="notification-table-title" title={item.title}>{item.title}</div><div className="notification-table-message" title={item.message}>{item.message}</div></td>
                <td><span className={`notification-type-badge type-${String(item.type || "activity").toLowerCase()}`}>{item.type}</span></td>
                <td className="notification-date">{formatDate(item.date)}</td>
                <td className="notification-time">{formatTime(item.date)}</td>
                <td><button className={`notification-read-button ${item.isRead ? "is-read" : ""}`} type="button" disabled={updatingId === item.id} onClick={() => toggleRead(item)}>{updatingId === item.id ? "Saving…" : item.isRead ? "Mark unread" : "Mark read"}</button></td>
                <td><div className="notification-actor-name">{item.actorName || "—"}</div><div className="notification-actor-type">{item.actorType || "—"}</div></td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>
    <div className="notification-info-grid">
      <div className="notification-info-card"><div className="info-icon">📌</div><div><h3>Activity sources</h3><p>Updates come from notices, payments, complaints, visitors, staff tasks, and amenity bookings.</p></div></div>
      <div className="notification-info-card"><div className="info-icon">🗄️</div><div><h3>Database-backed</h3><p>This feed reflects saved database activity. Read status is saved for your admin account.</p></div></div>
      <div className="notification-info-card"><div className="info-icon">🔄</div><div><h3>Stay current</h3><p>Reopen or refresh this page to load the newest activity records.</p></div></div>
    </div>
  </div>;
};

export default Notifications;
