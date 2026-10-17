import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bell, Building2, Database, HardDrive, Shield, UserRound } from "lucide-react";
import "../../css/settings.css";

const defaultNotifications = {
  complaints: true,
  payments: true,
  bookings: true,
  notices: true,
  security: true,
  events: false,
};
const defaultSecurity = { twoFactor: false, sessionTimeout: "30", loginAlerts: true };
const emptySociety = { name: "", address: "", email: "", phone: "", totalBlocks: "", totalFlats: "" };
const emptyAdmin = { name: "", email: "", phone: "" };
const emptyPassword = { currentPassword: "", newPassword: "", confirmPassword: "" };

const Settings = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    ["society", "profile", "notifications", "security", "backup"].includes(initialTab)
      ? initialTab
      : "society",
  );
  const [societyData, setSocietyData] = useState(emptySociety);
  const [adminData, setAdminData] = useState(emptyAdmin);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [security, setSecurity] = useState(defaultSecurity);
  const [password, setPassword] = useState(emptyPassword);
  const [databaseStatus, setDatabaseStatus] = useState("Checking");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  const request = useCallback((url, options = {}) => fetch(`http://localhost:5000${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  }), [token]);

  const loadSettings = useCallback(async () => {
    try {
      const response = await request("/api/admin/settings");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Settings could not be loaded");
      setSocietyData(data.society || emptySociety);
      setAdminData(data.admin || emptyAdmin);
      setNotifications({ ...defaultNotifications, ...(data.notifications || {}) });
      setSecurity({ ...defaultSecurity, ...(data.security || {}) });
      setDatabaseStatus(data.database?.status || "Unknown");
      setError("");
    } catch (err) {
      setError(err.message || "Settings could not be loaded");
      setDatabaseStatus("Unavailable");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    const load = async () => loadSettings();
    load();
  }, [loadSettings]);

  const saveSettings = async (url, body, key, message) => {
    setSaving(key);
    setError("");
    setSuccess("");
    try {
      const response = await request(url, { method: "PUT", body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Settings could not be saved");
      setSuccess(data.message || message);
      if (key === "password") setPassword(emptyPassword);
      if (key === "profile" || key === "society") await loadSettings();
    } catch (err) {
      setError(err.message || "Settings could not be saved");
    } finally {
      setSaving("");
    }
  };

  const renderSocietySettings = () => (
    <div className="settings-content">
      <div className="settings-content-header">
        <div><h2>Society Profile</h2><p>Manage the society details saved in the database.</p></div>
        <span className="settings-status">{societyData.status || "—"}</span>
      </div>
      <div className="settings-form-grid">
        <div className="settings-field"><label>Society Name</label><input type="text" name="name" value={societyData.name} onChange={(event) => setSocietyData({ ...societyData, name: event.target.value })} /></div>
        <div className="settings-field"><label>Contact Email</label><input type="email" name="email" value={societyData.email} onChange={(event) => setSocietyData({ ...societyData, email: event.target.value })} /></div>
        <div className="settings-field full-width"><label>Address</label><textarea name="address" value={societyData.address} onChange={(event) => setSocietyData({ ...societyData, address: event.target.value })} rows="3" /></div>
        <div className="settings-field"><label>Contact Phone</label><input type="text" name="phone" value={societyData.phone} onChange={(event) => setSocietyData({ ...societyData, phone: event.target.value })} /></div>
        <div className="settings-field"><label>Total Blocks</label><input type="number" min="0" step="1" name="totalBlocks" value={societyData.totalBlocks} onChange={(event) => setSocietyData({ ...societyData, totalBlocks: event.target.value })} /></div>
        <div className="settings-field"><label>Total Flats</label><input type="number" min="0" step="1" name="totalFlats" value={societyData.totalFlats} onChange={(event) => setSocietyData({ ...societyData, totalFlats: event.target.value })} /></div>
      </div>
      <div className="settings-actions"><button className="primary-settings-button" disabled={loading || Boolean(saving)} onClick={() => saveSettings("/api/admin/settings/society", societyData, "society", "Society settings saved")}>{saving === "society" ? "Saving…" : "✓ Save Changes"}</button></div>
    </div>
  );

  const renderAdminProfile = () => (
    <div className="settings-content">
      <div className="settings-content-header"><div><h2>Administrator Profile</h2><p>Manage your administrator account information.</p></div></div>
      <div className="admin-profile-preview"><div className="large-admin-avatar">{adminData.name.charAt(0).toUpperCase() || "A"}</div><div><h3>{adminData.name || "—"}</h3><span>Administrator</span></div></div>
      <div className="settings-form-grid">
        <div className="settings-field"><label>Full Name</label><input type="text" name="name" value={adminData.name} onChange={(event) => setAdminData({ ...adminData, name: event.target.value })} /></div>
        <div className="settings-field"><label>Email Address</label><input type="email" name="email" value={adminData.email} onChange={(event) => setAdminData({ ...adminData, email: event.target.value })} /></div>
        <div className="settings-field"><label>Phone Number</label><input type="text" name="phone" value={adminData.phone} onChange={(event) => setAdminData({ ...adminData, phone: event.target.value })} /></div>
        <div className="settings-field"><label>Role</label><input type="text" value="Administrator" disabled /></div>
      </div>
      <div className="settings-actions"><button className="primary-settings-button" disabled={loading || Boolean(saving)} onClick={() => saveSettings("/api/admin/settings/profile", adminData, "profile", "Admin profile updated")}>{saving === "profile" ? "Saving…" : "✓ Update Profile"}</button></div>
    </div>
  );

  const renderNotifications = () => {
    const options = [
      ["complaints", "Complaint Notifications", "Receive updates about resident complaints."],
      ["payments", "Payment Notifications", "Receive maintenance payment updates."],
      ["bookings", "Amenity Booking Notifications", "Receive facility booking related updates."],
      ["notices", "Notice Notifications", "Receive important society notice updates."],
      ["security", "Security Notifications", "Receive visitor and security related alerts."],
      ["events", "Event Notifications", "Receive community event updates."],
    ];
    return (
      <div className="settings-content">
        <div className="settings-content-header"><div><h2>Notification Preferences</h2><p>These preferences are saved to your admin account.</p></div></div>
        <div className="settings-options">
          {options.map(([key, title, description]) => <div className="setting-option" key={key}>
            <div><strong>{title}</strong><span>{description}</span></div>
            <button type="button" aria-label={`${notifications[key] ? "Disable" : "Enable"} ${title}`} aria-pressed={notifications[key]} className={`toggle ${notifications[key] ? "active" : ""}`} onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}><span /></button>
          </div>)}
        </div>
        <div className="settings-actions"><button className="primary-settings-button" disabled={loading || Boolean(saving)} onClick={() => saveSettings("/api/admin/settings/notifications", notifications, "notifications", "Notification preferences saved")}>{saving === "notifications" ? "Saving…" : "✓ Save Preferences"}</button></div>
      </div>
    );
  };

  const renderSecurity = () => (
    <div className="settings-content">
      <div className="settings-content-header"><div><h2>Security Settings</h2><p>Saved account preferences and password controls.</p></div></div>
      <div className="security-info-card"><div className="security-icon"><Shield size={19} strokeWidth={1.8} aria-hidden="true" /></div><div><h3>Account Security</h3><p>Security preferences are stored with your administrator account.</p></div></div>
      <div className="settings-options">
        <div className="setting-option"><div><strong>Two-Factor Authentication</strong><span>Save your preference for an additional verification step.</span></div><button type="button" aria-label="Toggle two-factor authentication preference" aria-pressed={security.twoFactor} className={`toggle ${security.twoFactor ? "active" : ""}`} onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}><span /></button></div>
        <div className="setting-option"><div><strong>Login Alerts</strong><span>Save your preference for new login alerts.</span></div><button type="button" aria-label="Toggle login alerts" aria-pressed={security.loginAlerts} className={`toggle ${security.loginAlerts ? "active" : ""}`} onClick={() => setSecurity({ ...security, loginAlerts: !security.loginAlerts })}><span /></button></div>
        <div className="setting-option"><div><strong>Session Timeout</strong><span>Preferred inactive session timeout.</span></div><select className="session-select" value={security.sessionTimeout} onChange={(event) => setSecurity({ ...security, sessionTimeout: event.target.value })}><option value="15">15 Minutes</option><option value="30">30 Minutes</option><option value="60">60 Minutes</option><option value="120">120 Minutes</option></select></div>
      </div>
      <div className="settings-actions"><button className="primary-settings-button" disabled={loading || Boolean(saving)} onClick={() => saveSettings("/api/admin/settings/security", security, "security", "Security preferences saved")}>{saving === "security" ? "Saving…" : "✓ Save Security Settings"}</button></div>
      <form className="settings-password-card" onSubmit={(event) => {
        event.preventDefault();
        if (password.newPassword !== password.confirmPassword) {
          setError("New password and confirmation do not match");
          return;
        }
        saveSettings("/api/admin/settings/password", {
          currentPassword: password.currentPassword,
          newPassword: password.newPassword,
        }, "password", "Admin password updated");
      }}>
        <div><h3>Change Password</h3><p>Set a new password for your admin account.</p></div>
        <div className="settings-password-fields">
          <input aria-label="Current password" autoComplete="current-password" minLength="6" required type="password" placeholder="Current password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} />
          <input aria-label="New password" autoComplete="new-password" minLength="6" required type="password" placeholder="New password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} />
          <input aria-label="Confirm new password" autoComplete="new-password" minLength="6" required type="password" placeholder="Confirm new password" value={password.confirmPassword} onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })} />
          <button className="secondary-settings-button" disabled={Boolean(saving)} type="submit">{saving === "password" ? "Updating…" : "Update Password"}</button>
        </div>
      </form>
    </div>
  );

  const renderSystem = () => (
    <div className="settings-content">
      <div className="settings-content-header"><div><h2>System & Backup</h2><p>Current database connectivity and backup configuration.</p></div></div>
      <div className="backup-grid">
        <div className="backup-card"><div className="backup-card-icon"><Database size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><span>Database</span><strong>MySQL</strong><small>Connection checked from the backend</small></div><span className={`backup-success ${databaseStatus !== "Connected" ? "backup-unavailable" : ""}`}>● {databaseStatus}</span></div>
        <div className="backup-card"><div className="backup-card-icon"><HardDrive size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><span>Database Backups</span><strong>Not configured</strong><small>This application does not run scheduled backups.</small></div></div>
      </div>
      <div className="backup-note"><span>ℹ️</span><p>Configure MySQL backups in your hosting or database environment; no backup completion is reported unless one is actually configured.</p></div>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div><span className="settings-overline">ADMIN PANEL</span><h1>Settings</h1><p>Manage society and administrator details stored in MySQL.</p></div>
        <div className="settings-header-status">{loading ? "Loading settings…" : `⚙️ ${societyData.name || "System Settings"}`}</div>
      </div>
      {error && <p className="settings-message error" role="alert">{error}</p>}
      {success && <p className="settings-message success" role="status">{success}</p>}
      <div className="settings-layout">
        <aside className="settings-menu">
          <button className={activeTab === "society" ? "active" : ""} onClick={() => setActiveTab("society")}><Building2 size={17} aria-hidden="true" />Society Profile</button>
          <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}><UserRound size={17} aria-hidden="true" />Admin Profile</button>
          <button className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}><Bell size={17} aria-hidden="true" />Notifications</button>
          <button className={activeTab === "security" ? "active" : ""} onClick={() => setActiveTab("security")}><Shield size={17} aria-hidden="true" />Security</button>
          <button className={activeTab === "backup" ? "active" : ""} onClick={() => setActiveTab("backup")}><HardDrive size={17} aria-hidden="true" />System & Backup</button>
        </aside>
        <main className="settings-main">
          {loading ? <div className="settings-content">Loading settings from database…</div> : <>
            {activeTab === "society" && renderSocietySettings()}
            {activeTab === "profile" && renderAdminProfile()}
            {activeTab === "notifications" && renderNotifications()}
            {activeTab === "security" && renderSecurity()}
            {activeTab === "backup" && renderSystem()}
          </>}
        </main>
      </div>
    </div>
  );
};

export default Settings;
