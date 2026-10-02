import React, { useState } from "react";
import "../../css/staff/staff_profile.css";
import { useNavigate } from "react-router-dom";

function StaffProfile() {
  const navigate = useNavigate();

  const [staff, setStaff] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const firstName = staff?.first_name || staff?.name || "Staff";
  const lastName = staff?.last_name || "";

  const fullName = `${firstName} ${lastName}`.trim();

  const staffType = staff?.staff_type || "Maintenance Staff";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "S";

  const [isEditing, setIsEditing] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    first_name: staff?.first_name || firstName,
    last_name: staff?.last_name || lastName,
    email: staff?.email || "",
    phone: staff?.phone || staff?.mobile || "",
    staff_type: staff?.staff_type || "Maintenance Staff",
    department: staff?.department || "Maintenance",
    employee_id: staff?.employee_id || staff?.staff_id || "STF-001",
    address: staff?.address || "",
    joining_date: staff?.joining_date || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("staff");

    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    const updatedStaff = {
      ...staff,
      ...profileData,
    };

    localStorage.setItem("user", JSON.stringify(updatedStaff));

    setStaff(updatedStaff);

    setIsEditing(false);

    alert("Profile updated successfully!");
  };

  const handleCancelEdit = () => {
    setProfileData({
      first_name: staff?.first_name || firstName,
      last_name: staff?.last_name || lastName,
      email: staff?.email || "",
      phone: staff?.phone || staff?.mobile || "",
      staff_type: staff?.staff_type || "Maintenance Staff",
      department: staff?.department || "Maintenance",
      employee_id: staff?.employee_id || staff?.staff_id || "STF-001",
      address: staff?.address || "",
      joining_date: staff?.joining_date || "",
    });

    setIsEditing(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      alert("Please fill all password fields.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("New password must contain at least 6 characters.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    alert("Password changed successfully!");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="modern-staff-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="modern-sidebar">

        <div className="brand-header">

          <div className="brand-icon">
            🏢
          </div>

          <div className="brand-info">
            <h3>Smart Apartment</h3>
            <span>Staff Portal</span>
          </div>

        </div>

        <div className="sidebar-section-title">
          MAIN MENU
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/dashboard")}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/complaints")}
          >
            <span className="nav-icon">🛠️</span>
            <span>Assigned Complaints</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/service-requests")}
          >
            <span className="nav-icon">📋</span>
            <span>Service Requests</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/tasks")}
          >
            <span className="nav-icon">✅</span>
            <span>Tasks</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/maintenance")}
          >
            <span className="nav-icon">⚙️</span>
            <span>Maintenance</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/assets")}
          >
            <span className="nav-icon">📦</span>
            <span>Assets & Inventory</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/work-history")}
          >
            <span className="nav-icon">📜</span>
            <span>Work History</span>
          </button>

          <button
            className="nav-btn active"
            onClick={() => handleNavigation("/staff/profile")}
          >
            <span className="nav-icon">👤</span>
            <span>My Profile</span>
          </button>

        </nav>

        {/* SIDEBAR FOOTER */}

        <div className="sidebar-footer">

          <div className="user-profile-summary">

            <div className="avatar-circle">
              {initials}
            </div>

            <div className="user-details">
              <strong>{fullName}</strong>
              <small>{staffType}</small>
            </div>

          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="modern-main-content">

        {/* HEADER */}

        <header className="top-header">

          <div className="header-title">

            <span className="badge-tag">
              STAFF PROFILE
            </span>

            <h1>
              My Profile
            </h1>

            <p>
              View and manage your personal and staff information.
            </p>

          </div>

          <div className="header-actions">

            <div
              className="profile-pill"
              onClick={() => handleNavigation("/staff/profile")}
            >

              <div className="avatar-sm">
                {initials}
              </div>

              <span>
                {fullName}
              </span>

            </div>

          </div>

        </header>

        {/* ================= PROFILE HERO ================= */}

        <section className="profile-hero">

          <div className="profile-main-info">

            <div className="large-avatar">
              {initials}
            </div>

            <div className="profile-name-section">

              <span className="profile-role-badge">
                {staffType}
              </span>

              <h2>
                {profileData.first_name} {profileData.last_name}
              </h2>

              <p>
                {profileData.department || "Maintenance Department"}
              </p>

              <div className="employee-id">
                Employee ID: <strong>{profileData.employee_id}</strong>
              </div>

            </div>

          </div>

          <div className="profile-actions">

            {!isEditing ? (
              <button
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="edit-actions">

                <button
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>

                <button
                  className="save-btn"
                  onClick={handleSaveProfile}
                >
                  💾 Save Changes
                </button>

              </div>
            )}

          </div>

        </section>

        {/* ================= PROFILE CONTENT ================= */}

        <div className="profile-content-grid">

          {/* PERSONAL INFORMATION */}

          <section className="profile-card">

            <div className="card-header">

              <div>
                <h2>Personal Information</h2>

                <p>
                  Your basic contact and personal details.
                </p>
              </div>

              <span className="card-header-icon">
                👤
              </span>

            </div>

            <div className="profile-form-grid">

              <div className="form-group">

                <label>
                  First Name
                </label>

                <input
                  type="text"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />

              </div>

              <div className="form-group">

                <label>
                  Last Name
                </label>

                <input
                  type="text"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />

              </div>

              <div className="form-group full-width">

                <label>
                  Email Address
                </label>

                <div className="input-with-icon">

                  <span>✉️</span>

                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter email address"
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  Phone Number
                </label>

                <div className="input-with-icon">

                  <span>📞</span>

                  <input
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  Employee ID
                </label>

                <input
                  type="text"
                  value={profileData.employee_id}
                  disabled
                />

              </div>

              <div className="form-group full-width">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your address"
                  rows="3"
                />

              </div>

            </div>

          </section>

          {/* STAFF INFORMATION */}

          <section className="profile-card">

            <div className="card-header">

              <div>
                <h2>Staff Information</h2>

                <p>
                  Your role and department details.
                </p>
              </div>

              <span className="card-header-icon">
                🏢
              </span>

            </div>

            <div className="profile-form-grid">

              <div className="form-group">

                <label>
                  Staff Type
                </label>

                <select
                  name="staff_type"
                  value={profileData.staff_type}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >

                  <option>
                    Maintenance Staff
                  </option>

                  <option>
                    Housekeeping Staff
                  </option>

                  <option>
                    Electrician
                  </option>

                  <option>
                    Plumber
                  </option>

                  <option>
                    Security Staff
                  </option>

                  <option>
                    Gardener
                  </option>

                  <option>
                    Technician
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label>
                  Department
                </label>

                <select
                  name="department"
                  value={profileData.department}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >

                  <option>
                    Maintenance
                  </option>

                  <option>
                    Electrical
                  </option>

                  <option>
                    Plumbing
                  </option>

                  <option>
                    Housekeeping
                  </option>

                  <option>
                    Security
                  </option>

                  <option>
                    Garden Maintenance
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label>
                  Joining Date
                </label>

                <input
                  type="date"
                  name="joining_date"
                  value={profileData.joining_date}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />

              </div>

              <div className="form-group">

                <label>
                  Account Status
                </label>

                <div className="account-status">
                  <span className="status-dot"></span>
                  Active
                </div>

              </div>

            </div>

          </section>

          {/* WORK SUMMARY */}

          <section className="profile-card work-summary-card">

            <div className="card-header">

              <div>
                <h2>Work Summary</h2>

                <p>
                  Your current staff activity overview.
                </p>
              </div>

              <span className="card-header-icon">
                📊
              </span>

            </div>

            <div className="summary-grid">

              <div className="summary-box">
                <span className="summary-icon">
                  🛠️
                </span>

                <div>
                  <strong>04</strong>
                  <small>Assigned Complaints</small>
                </div>
              </div>

              <div className="summary-box">
                <span className="summary-icon">
                  📋
                </span>

                <div>
                  <strong>02</strong>
                  <small>Service Requests</small>
                </div>
              </div>

              <div className="summary-box">
                <span className="summary-icon">
                  ✅
                </span>

                <div>
                  <strong>18</strong>
                  <small>Completed Tasks</small>
                </div>
              </div>

              <div className="summary-box">
                <span className="summary-icon">
                  📜
                </span>

                <div>
                  <strong>18</strong>
                  <small>Work Records</small>
                </div>
              </div>

            </div>

          </section>

          {/* CHANGE PASSWORD */}

          <section className="profile-card password-card">

            <div className="card-header">

              <div>
                <h2>Change Password</h2>

                <p>
                  Update your account password regularly for better security.
                </p>
              </div>

              <span className="card-header-icon">
                🔐
              </span>

            </div>

            <form
              className="password-form"
              onSubmit={handleChangePassword}
            >

              <div className="form-group full-width">

                <label>
                  Current Password
                </label>

                <div className="password-input">

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                  >
                    {showCurrentPassword ? "🙈" : "👁️"}
                  </button>

                </div>

              </div>

              <div className="password-two-column">

                <div className="form-group">

                  <label>
                    New Password
                  </label>

                  <div className="password-input">

                    <input
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          !showNewPassword
                        )
                      }
                    >
                      {showNewPassword ? "🙈" : "👁️"}
                    </button>

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    Confirm Password
                  </label>

                  <div className="password-input">

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>

                  </div>

                </div>

              </div>

              <button
                type="submit"
                className="change-password-btn"
              >
                🔒 Update Password
              </button>

            </form>

          </section>

        </div>

      </main>

    </div>
  );
}

export default StaffProfile;