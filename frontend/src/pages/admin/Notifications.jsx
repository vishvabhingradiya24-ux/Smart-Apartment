import { useState } from "react";
import "../../css/notifications.css";

const Notifications = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [notifications, setNotifications] = useState([
    {
      id: 2201,
      userId: 201,
      title: "Maintenance Payment Reminder",
      message: "Your maintenance payment is due on 30 September.",
      type: "Payment",
      date: "23 Sep 2026, 10:30 AM",
      status: "Unread",
      priority: "High",
    },
    {
      id: 2202,
      userId: 205,
      title: "New Complaint Assigned",
      message: "A new complaint has been assigned to maintenance staff.",
      type: "Complaint",
      date: "23 Sep 2026, 09:45 AM",
      status: "Unread",
      priority: "Medium",
    },
    {
      id: 2203,
      userId: 212,
      title: "Amenity Booking Confirmed",
      message: "Your Club House booking has been confirmed.",
      type: "Booking",
      date: "23 Sep 2026, 09:15 AM",
      status: "Read",
      priority: "Normal",
    },
    {
      id: 2204,
      userId: 201,
      title: "Important Society Notice",
      message: "Water supply will be interrupted tomorrow from 10 AM to 1 PM.",
      type: "Notice",
      date: "22 Sep 2026, 05:30 PM",
      status: "Unread",
      priority: "High",
    },
    {
      id: 2205,
      userId: 310,
      title: "Visitor Verification Required",
      message: "A visitor is waiting for verification at Gate 1.",
      type: "Security",
      date: "22 Sep 2026, 04:20 PM",
      status: "Read",
      priority: "High",
    },
    {
      id: 2206,
      userId: 401,
      title: "Maintenance Task Updated",
      message: "Your assigned maintenance task status has been updated.",
      type: "Task",
      date: "22 Sep 2026, 02:10 PM",
      status: "Read",
      priority: "Normal",
    },
    {
      id: 2207,
      userId: 201,
      title: "Community Event",
      message: "Annual society meeting will be held this Sunday.",
      type: "Event",
      date: "21 Sep 2026, 06:00 PM",
      status: "Unread",
      priority: "Medium",
    },
  ]);

  const getIcon = (type) => {
    switch (type) {
      case "Payment":
        return "💳";
      case "Complaint":
        return "📝";
      case "Booking":
        return "🏊";
      case "Notice":
        return "📢";
      case "Security":
        return "🛡️";
      case "Task":
        return "🔧";
      case "Event":
        return "📅";
      default:
        return "🔔";
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, status: "Read" }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        status: "Read",
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(search.toLowerCase()) ||
      notification.message.toLowerCase().includes(search.toLowerCase()) ||
      notification.userId.toString().includes(search);

    const matchesType =
      typeFilter === "All" || notification.type === typeFilter;

    const matchesStatus =
      statusFilter === "All" || notification.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = notifications.filter(
    (item) => item.status === "Unread"
  ).length;

  const readCount = notifications.filter(
    (item) => item.status === "Read"
  ).length;

  const highPriorityCount = notifications.filter(
    (item) => item.priority === "High"
  ).length;

  return (
    <div className="notifications-page">

      {/* HEADER */}
      <div className="notifications-header">
        <div>
          <span className="notifications-overline">
            ADMIN PANEL
          </span>

          <h1>Notifications</h1>

          <p>
            Manage and monitor system notifications for society users.
          </p>
        </div>

        <button
          className="mark-all-button"
          onClick={markAllAsRead}
        >
          ✓ Mark All as Read
        </button>
      </div>

      {/* STATS */}
      <div className="notification-stats">

        <div className="notification-stat-card">
          <div className="notification-stat-icon">🔔</div>
          <div>
            <span>Total Notifications</span>
            <strong>{notifications.length}</strong>
          </div>
        </div>

        <div className="notification-stat-card unread">
          <div className="notification-stat-icon">📩</div>
          <div>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div className="notification-stat-card read">
          <div className="notification-stat-icon">✓</div>
          <div>
            <span>Read</span>
            <strong>{readCount}</strong>
          </div>
        </div>

        <div className="notification-stat-card priority">
          <div className="notification-stat-icon">⚠️</div>
          <div>
            <span>High Priority</span>
            <strong>{highPriorityCount}</strong>
          </div>
        </div>

      </div>

      {/* FILTERS */}
      <div className="notification-filter-card">

        <div className="notification-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Payment">Payment</option>
          <option value="Complaint">Complaint</option>
          <option value="Booking">Booking</option>
          <option value="Notice">Notice</option>
          <option value="Security">Security</option>
          <option value="Task">Task</option>
          <option value="Event">Event</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Unread">Unread</option>
          <option value="Read">Read</option>
        </select>

      </div>

      {/* NOTIFICATION LIST */}
      <div className="notification-section">

        <div className="notification-section-header">
          <div>
            <h2>Notification Records</h2>
            <p>
              {filteredNotifications.length} notifications found
            </p>
          </div>
        </div>

        <div className="notification-list">

          {filteredNotifications.length === 0 ? (
            <div className="empty-notification">
              <span>🔔</span>
              <h3>No notifications found</h3>
              <p>
                Try changing your search or filter options.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                className={`notification-item ${
                  notification.status === "Unread"
                    ? "notification-unread"
                    : ""
                }`}
                key={notification.id}
              >

                <div className="notification-icon">
                  {getIcon(notification.type)}
                </div>

                <div className="notification-content">

                  <div className="notification-title-row">

                    <h3>{notification.title}</h3>

                    <span
                      className={`priority-badge priority-${notification.priority.toLowerCase()}`}
                    >
                      {notification.priority}
                    </span>

                  </div>

                  <p>{notification.message}</p>

                  <div className="notification-meta">

                    <span>
                      🔔 {notification.type}
                    </span>

                    <span>
                      👤 User ID: {notification.userId}
                    </span>

                    <span>
                      🕒 {notification.date}
                    </span>

                  </div>

                </div>

                <div className="notification-actions">

                  {notification.status === "Unread" && (
                    <button
                      className="read-button"
                      onClick={() => markAsRead(notification.id)}
                    >
                      ✓ Read
                    </button>
                  )}

                  <button
                    className="delete-notification-button"
                    onClick={() =>
                      deleteNotification(notification.id)
                    }
                  >
                    🗑️
                  </button>

                </div>

              </div>
            ))
          )}

        </div>
      </div>

      {/* INFORMATION CARDS */}
      <div className="notification-info-grid">

        <div className="notification-info-card">
          <div className="info-icon">📌</div>

          <div>
            <h3>Notification Types</h3>
            <p>
              Notifications can be generated for complaints,
              payments, bookings, notices, events and security
              activities.
            </p>
          </div>
        </div>

        <div className="notification-info-card">
          <div className="info-icon">👥</div>

          <div>
            <h3>User Notifications</h3>
            <p>
              Each notification is associated with the user who
              receives it through User ID.
            </p>
          </div>
        </div>

        <div className="notification-info-card">
          <div className="info-icon">🔐</div>

          <div>
            <h3>Role Based Access</h3>
            <p>
              Notifications should be visible only to authorized
              users according to their role and permissions.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Notifications;