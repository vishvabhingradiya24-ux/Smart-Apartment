import { useEffect, useMemo, useState } from "react";
import "../../css/notifications.css";

const Notifications = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/notifications", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Notifications load થઈ શક્યાં નહીં");
        setNotifications(data.notifications || []);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    loadNotifications();
  }, []);

  const filtered = useMemo(() => notifications.filter((item) => {
    const searchValue = search.toLowerCase();
    const matchesSearch = [item.title, item.message, String(item.userId || "")].some((value) => value.toLowerCase().includes(searchValue));
    return matchesSearch && (typeFilter === "All" || item.type === typeFilter);
  }), [notifications, search, typeFilter]);
  const types = [...new Set(notifications.map((item) => item.type))];
  const todayCount = notifications.filter((item) => item.date && new Date(item.date).toDateString() === new Date().toDateString()).length;
  const getIcon = (type) => ({ Payment: "💳", Complaint: "📝", Booking: "🏊", Notice: "📢", Visitor: "🚪", Task: "🔧" }[type] || "🔔");

  return <div className="notifications-page">
    <div className="notifications-header"><div><span className="notifications-overline">ADMIN PANEL</span><h1>Notifications</h1><p>Databaseમાંથી તાજેતરની notices અને system activity.</p></div></div>
    <div className="notification-stats"><div className="notification-stat-card"><div className="notification-stat-icon">🔔</div><div><span>Total Activity</span><strong>{notifications.length}</strong></div></div><div className="notification-stat-card unread"><div className="notification-stat-icon">📅</div><div><span>Today</span><strong>{todayCount}</strong></div></div><div className="notification-stat-card read"><div className="notification-stat-icon">📂</div><div><span>Activity Types</span><strong>{types.length}</strong></div></div><div className="notification-stat-card priority"><div className="notification-stat-icon">🗂️</div><div><span>Showing</span><strong>{filtered.length}</strong></div></div></div>
    <div className="notification-filter-card"><div className="notification-search"><span>🔍</span><input placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="All">All Types</option>{types.map((type) => <option key={type}>{type}</option>)}</select></div>
    {error && <p className="page-error" role="alert">{error}</p>}
    <div className="notification-section"><div className="notification-section-header"><div><h2>Recent System Activity</h2><p>{filtered.length} records · up to the latest 30 items</p></div></div><div className="notification-list">
      {loading ? <div className="empty-notification"><p>Loading activity…</p></div> : filtered.length === 0 ? <div className="empty-notification"><span>🔔</span><h3>No activity found</h3><p>Databaseમાં હાલ કોઈ matching record નથી.</p></div> : filtered.map((item) => <article className="notification-item" key={item.id}><div className="notification-icon">{getIcon(item.type)}</div><div className="notification-content"><div className="notification-title-row"><h3>{item.title}</h3><span className="priority-badge">{item.type}</span></div><p>{item.message}</p><div className="notification-meta"><span>🔔 {item.type}</span>{item.userId && <span>👤 Resident ID: {item.userId}</span>}<span>🕒 {item.date ? new Date(item.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}</span></div></div></article>)}
    </div></div>
    <div className="notification-info-grid"><div className="notification-info-card"><div className="info-icon">📌</div><div><h3>Activity Sources</h3><p>Notices, payments, complaints, visitors, staff tasks અને amenity bookingsમાંથી activity બને છે.</p></div></div><div className="notification-info-card"><div className="info-icon">🗄️</div><div><h3>Database Records</h3><p>આ feed database activity બતાવે છે; read/unread state અલગ tableમાં ઉપલબ્ધ નથી.</p></div></div><div className="notification-info-card"><div className="info-icon">🔄</div><div><h3>Latest Updates</h3><p>Page ફરી ખોલતાં અથવા refresh કરતાં તાજેતરના database records load થાય છે.</p></div></div></div>
  </div>;
};
export default Notifications;
