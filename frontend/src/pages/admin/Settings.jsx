import { useState } from "react";
import "../../css/settings.css";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("society");

  const [societyData, setSocietyData] = useState({
    name: "Green Valley Apartment",
    address: "Ahmedabad, Gujarat",
    email: "admin@greenvalley.com",
    phone: "+91 98765 43210",
    totalBlocks: "4",
    totalFlats: "240",
  });

  const [adminData, setAdminData] = useState({
    name: "Administrator",
    email: "admin@gmail.com",
    phone: "+91 98765 43210",
  });

  const [notifications, setNotifications] = useState({
    complaints: true,
    payments: true,
    bookings: true,
    notices: true,
    security: true,
    events: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30",
    loginAlerts: true,
  });

  const handleSocietyChange = (e) => {
    setSocietyData({
      ...societyData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdminChange = (e) => {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  const handleSecurityChange = (key) => {
    setSecurity({
      ...security,
      [key]: !security[key],
    });
  };

  const handleSave = () => {
    alert("Settings saved successfully.");
  };

  const renderSocietySettings = () => (
    <div className="settings-content">

      <div className="settings-content-header">
        <div>
          <h2>Society Profile</h2>
          <p>
            Manage basic information of your apartment society.
          </p>
        </div>

        <span className="settings-status">
          ● Active
        </span>
      </div>

      <div className="settings-form-grid">

        <div className="settings-field">
          <label>Society Name</label>
          <input
            type="text"
            name="name"
            value={societyData.name}
            onChange={handleSocietyChange}
          />
        </div>

        <div className="settings-field">
          <label>Contact Email</label>
          <input
            type="email"
            name="email"
            value={societyData.email}
            onChange={handleSocietyChange}
          />
        </div>

        <div className="settings-field full-width">
          <label>Address</label>
          <textarea
            name="address"
            value={societyData.address}
            onChange={handleSocietyChange}
            rows="3"
          />
        </div>

        <div className="settings-field">
          <label>Contact Phone</label>
          <input
            type="text"
            name="phone"
            value={societyData.phone}
            onChange={handleSocietyChange}
          />
        </div>

        <div className="settings-field">
          <label>Total Blocks</label>
          <input
            type="text"
            name="totalBlocks"
            value={societyData.totalBlocks}
            onChange={handleSocietyChange}
          />
        </div>

        <div className="settings-field">
          <label>Total Flats</label>
          <input
            type="text"
            name="totalFlats"
            value={societyData.totalFlats}
            onChange={handleSocietyChange}
          />
        </div>

      </div>

      <div className="settings-actions">
        <button
          className="primary-settings-button"
          onClick={handleSave}
        >
          ✓ Save Changes
        </button>
      </div>

    </div>
  );

  const renderAdminProfile = () => (
    <div className="settings-content">

      <div className="settings-content-header">
        <div>
          <h2>Administrator Profile</h2>
          <p>
            Manage your administrator account information.
          </p>
        </div>
      </div>

      <div className="admin-profile-preview">
        <div className="large-admin-avatar">
          A
        </div>

        <div>
          <h3>{adminData.name}</h3>
          <span>Administrator</span>
        </div>
      </div>

      <div className="settings-form-grid">

        <div className="settings-field">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={adminData.name}
            onChange={handleAdminChange}
          />
        </div>

        <div className="settings-field">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={adminData.email}
            onChange={handleAdminChange}
          />
        </div>

        <div className="settings-field">
          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={adminData.phone}
            onChange={handleAdminChange}
          />
        </div>

        <div className="settings-field">
          <label>Role</label>
          <input
            type="text"
            value="Administrator"
            disabled
          />
        </div>

      </div>

      <div className="settings-actions">
        <button
          className="primary-settings-button"
          onClick={handleSave}
        >
          ✓ Update Profile
        </button>
      </div>

    </div>
  );

  const renderNotifications = () => (
    <div className="settings-content">

      <div className="settings-content-header">
        <div>
          <h2>Notification Preferences</h2>
          <p>
            Configure which system notifications should be enabled.
          </p>
        </div>
      </div>

      <div className="settings-options">

        <div className="setting-option">
          <div>
            <strong>Complaint Notifications</strong>
            <span>
              Receive updates about resident complaints.
            </span>
          </div>

          <button
            className={`toggle ${
              notifications.complaints ? "active" : ""
            }`}
            onClick={() =>
              handleNotificationChange("complaints")
            }
          >
            <span></span>
          </button>
        </div>

        <div className="setting-option">
          <div>
            <strong>Payment Notifications</strong>
            <span>
              Receive maintenance payment updates.
            </span>
          </div>

          <button
            className={`toggle ${
              notifications.payments ? "active" : ""
            }`}
            onClick={() =>
              handleNotificationChange("payments")
            }
          >
            <span></span>
          </button>
        </div>

        <div className="setting-option">
          <div>
            <strong>Amenity Booking Notifications</strong>
            <span>
              Receive facility booking related updates.
            </span>
          </div>

          <button
            className={`toggle ${
              notifications.bookings ? "active" : ""
            }`}
            onClick={() =>
              handleNotificationChange("bookings")
            }
          >
            <span></span>
          </button>
        </div>

        <div className="setting-option">
          <div>
            <strong>Notice Notifications</strong>
            <span>
              Receive important society notice updates.
            </span>
          </div>

          <button
            className={`toggle ${
              notifications.notices ? "active" : ""
            }`}
            onClick={() =>
              handleNotificationChange("notices")
            }
          >
            <span></span>
          </button>
        </div>

        <div className="setting-option">
          <div>
            <strong>Security Notifications</strong>
            <span>
              Receive visitor and security related alerts.
            </span>
          </div>

          <button
            className={`toggle ${
              notifications.security ? "active" : ""
            }`}
            onClick={() =>
              handleNotificationChange("security")
            }
          >
            <span></span>
          </button>
        </div>

        <div className="setting-option">
          <div>
            <strong>Event Notifications</strong>
            <span>
              Receive community event updates.
            </span>
          </div>

          <button
            className={`toggle ${
              notifications.events ? "active" : ""
            }`}
            onClick={() =>
              handleNotificationChange("events")
            }
          >
            <span></span>
          </button>
        </div>

      </div>

      <div className="settings-actions">
        <button
          className="primary-settings-button"
          onClick={handleSave}
        >
          ✓ Save Preferences
        </button>
      </div>

    </div>
  );

  const renderSecurity = () => (
    <div className="settings-content">

      <div className="settings-content-header">
        <div>
          <h2>Security Settings</h2>
          <p>
            Manage authentication and account security preferences.
          </p>
        </div>
      </div>

      <div className="security-info-card">
        <div className="security-icon">
          🔐
        </div>

        <div>
          <h3>Account Security</h3>
          <p>
            Security settings help protect the society management
            system from unauthorized access.
          </p>
        </div>
      </div>

      <div className="settings-options">

        <div className="setting-option">
          <div>
            <strong>Two-Factor Authentication</strong>
            <span>
              Add an additional verification step during login.
            </span>
          </div>

          <button
            className={`toggle ${
              security.twoFactor ? "active" : ""
            }`}
            onClick={() =>
              handleSecurityChange("twoFactor")
            }
          >
            <span></span>
          </button>
        </div>

        <div className="setting-option">
          <div>
            <strong>Login Alerts</strong>
            <span>
              Receive alerts when a new login occurs.
            </span>
          </div>

          <button
            className={`toggle ${
              security.loginAlerts ? "active" : ""
            }`}
            onClick={() =>
              handleSecurityChange("loginAlerts")
            }
          >
            <span></span>
          </button>
        </div>

        <div className="setting-option">

          <div>
            <strong>Session Timeout</strong>
            <span>
              Automatically end inactive sessions.
            </span>
          </div>

          <select
            className="session-select"
            value={security.sessionTimeout}
            onChange={(e) =>
              setSecurity({
                ...security,
                sessionTimeout: e.target.value,
              })
            }
          >
            <option value="15">15 Minutes</option>
            <option value="30">30 Minutes</option>
            <option value="60">60 Minutes</option>
            <option value="120">120 Minutes</option>
          </select>

        </div>

      </div>

      <div className="settings-password-card">

        <div>
          <h3>Password</h3>
          <p>
            Change your administrator account password regularly
            to maintain security.
          </p>
        </div>

        <button
          className="secondary-settings-button"
          onClick={() => alert("Change password feature coming soon.")}
        >
          🔑 Change Password
        </button>

      </div>

      <div className="settings-actions">
        <button
          className="primary-settings-button"
          onClick={handleSave}
        >
          ✓ Save Security Settings
        </button>
      </div>

    </div>
  );

  const renderBackup = () => (
    <div className="settings-content">

      <div className="settings-content-header">
        <div>
          <h2>System & Backup</h2>
          <p>
            Monitor system information and database backup status.
          </p>
        </div>
      </div>

      <div className="backup-grid">

        <div className="backup-card">
          <div className="backup-card-icon">
            💾
          </div>

          <div>
            <span>Last Backup</span>
            <strong>23 September 2026</strong>
            <small>02:00 AM</small>
          </div>

          <span className="backup-success">
            ● Completed
          </span>
        </div>

        <div className="backup-card">
          <div className="backup-card-icon">
            🗄️
          </div>

          <div>
            <span>Database Status</span>
            <strong>MySQL</strong>
            <small>Connection Active</small>
          </div>

          <span className="backup-success">
            ● Healthy
          </span>
        </div>

      </div>

      <div className="system-status-card">

        <h3>System Status</h3>

        <div className="system-status-list">

          <div>
            <span>Frontend</span>
            <strong>● Online</strong>
          </div>

          <div>
            <span>Backend API</span>
            <strong>● Online</strong>
          </div>

          <div>
            <span>Database</span>
            <strong>● Connected</strong>
          </div>

          <div>
            <span>Authentication</span>
            <strong>● Active</strong>
          </div>

        </div>

      </div>

      <div className="backup-note">
        <span>ℹ️</span>

        <p>
          Regular database backups are required to reduce the risk
          of losing important apartment records.
        </p>
      </div>

    </div>
  );

  return (
    <div className="settings-page">

      {/* HEADER */}
      <div className="settings-header">

        <div>
          <span className="settings-overline">
            ADMIN PANEL
          </span>

          <h1>Settings</h1>

          <p>
            Configure your society management system.
          </p>
        </div>

        <div className="settings-header-status">
          ⚙️ System Settings
        </div>

      </div>

      {/* SETTINGS LAYOUT */}
      <div className="settings-layout">

        {/* SIDEBAR */}
        <aside className="settings-menu">

          <button
            className={
              activeTab === "society" ? "active" : ""
            }
            onClick={() => setActiveTab("society")}
          >
            <span>🏢</span>
            Society Profile
          </button>

          <button
            className={
              activeTab === "profile" ? "active" : ""
            }
            onClick={() => setActiveTab("profile")}
          >
            <span>👤</span>
            Admin Profile
          </button>

          <button
            className={
              activeTab === "notifications" ? "active" : ""
            }
            onClick={() => setActiveTab("notifications")}
          >
            <span>🔔</span>
            Notifications
          </button>

          <button
            className={
              activeTab === "security" ? "active" : ""
            }
            onClick={() => setActiveTab("security")}
          >
            <span>🔐</span>
            Security
          </button>

          <button
            className={
              activeTab === "backup" ? "active" : ""
            }
            onClick={() => setActiveTab("backup")}
          >
            <span>💾</span>
            System & Backup
          </button>

        </aside>

        {/* CONTENT */}
        <main className="settings-main">

          {activeTab === "society" &&
            renderSocietySettings()}

          {activeTab === "profile" &&
            renderAdminProfile()}

          {activeTab === "notifications" &&
            renderNotifications()}

          {activeTab === "security" &&
            renderSecurity()}

          {activeTab === "backup" &&
            renderBackup()}

        </main>

      </div>

    </div>
  );
};

export default Settings;