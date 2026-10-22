import { useCallback, useEffect, useState } from "react";
import "../../css/staff/staff_profile.css";
import "../../css/staff/staff_shared_theme.css";
import { useNavigate } from "react-router-dom";
import { STAFF_DEPARTMENTS } from "../../constants/staffDepartments";
import StaffNav from "../../components/StaffNav";

function StaffProfile() {
  const navigate = useNavigate();

  const [staff, setStaff] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const firstName = staff?.first_name || staff?.name || "Staff";
  const lastName = staff?.last_name || "";

  const fullName = `${firstName} ${lastName}`.trim();

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "S";

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "", phone: "", department: "" });
  const [editError, setEditError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [workSummary, setWorkSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    first_name: staff?.first_name || firstName,
    last_name: staff?.last_name || lastName,
    email: staff?.email || "",
    phone: staff?.phone || staff?.mobile || "",
    department: staff?.department || "",
    employee_id: staff?.id ? `STF-${String(staff.id).padStart(3, "0")}` : "",
    joining_date: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchWorkSummary = useCallback(async (signal) => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please sign in again to load your work summary.");
      }

      const response = await fetch("http://localhost:5000/api/staff/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to load work summary.");
      }

      setWorkSummary(data.counts);
      if (data.staff) {
        setProfileData((currentProfile) => ({
          ...currentProfile,
          first_name: data.staff.first_name || currentProfile.first_name,
          last_name: data.staff.last_name || currentProfile.last_name,
          department: data.staff.department || "",
        }));
      }
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Fetch Staff Profile Summary Error:", error);
      setSummaryError(error.message || "Unable to load work summary.");
    } finally {
      if (!signal?.aborted) setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadWorkSummary = async () => {
      await fetchWorkSummary(controller.signal);
    };
    loadWorkSummary();
    return () => controller.abort();
  }, [fetchWorkSummary]);

  useEffect(() => {
    const controller = new AbortController();
    const loadProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/staff/profile", {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load profile.");
        setProfileData((current) => ({ ...current, ...data.profile }));
        setStaff((current) => ({ ...current, ...data.profile }));
      } catch (error) {
        if (error.name !== "AbortError") console.error("Load Staff Profile Error:", error);
      }
    };
    loadProfile();
    return () => controller.abort();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("staffToken");
    sessionStorage.removeItem("residentToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("staff");

    navigate("/login");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openEditModal = () => {
    setEditForm({
      first_name: profileData.first_name || "",
      last_name: profileData.last_name || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
      department: profileData.department || "",
    });
    setEditError("");
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError("");

    const form = {
      ...editForm,
      first_name: editForm.first_name.trim(),
      last_name: editForm.last_name.trim(),
      email: editForm.email.trim().toLowerCase(),
      phone: editForm.phone.trim(),
    };
    if (!form.first_name || !form.last_name) {
      setEditError("First name and last name are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setEditError("Enter a valid email address.");
      return;
    }
    if (!/^[0-9]{10}$/.test(form.phone)) {
      setEditError("Enter a phone number with exactly 10 digits.");
      return;
    }

    setSavingProfile(true);
    try {
      const response = await fetch("http://localhost:5000/api/staff/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update profile.");

      const updatedStaff = { ...staff, ...data.profile };
      sessionStorage.setItem("user", JSON.stringify(updatedStaff));
      setStaff(updatedStaff);
      setProfileData((current) => ({ ...current, ...data.profile }));
      setShowEditModal(false);
    } catch (error) {
      setEditError(error.message || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
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

    try {
      const response = await fetch("http://localhost:5000/api/staff/change-password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to change password.");
      }

      alert("Password changed successfully!");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert(error.message || "Unable to change password.");
    }
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
                <StaffNav onNavigate={handleNavigation} />

        {/* SIDEBAR FOOTER */}

        <div className="sidebar-footer">

          <div className="user-profile-summary">

            <div className="avatar-circle">
              {initials}
            </div>

            <div className="user-details">
              <strong>{fullName}</strong>
              <small>{profileData.department || "Staff Member"}</small>
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

          </div>

        </header>


        {showEditModal && (
          <div className="staff-edit-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !savingProfile) setShowEditModal(false); }}>
            <form className="staff-edit-modal" onSubmit={handleSaveProfile} role="dialog" aria-modal="true" aria-label="Edit profile">
              <div className="staff-edit-header">
                <h2>Edit Profile</h2>
                <button type="button" onClick={() => setShowEditModal(false)} disabled={savingProfile} aria-label="Close">×</button>
              </div>
              <div className="staff-edit-grid">
                <label>First name
                  <input required maxLength="100" value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
                </label>
                <label>Last name
                  <input required maxLength="100" value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
                </label>
                <label className="full">Email address
                  <input required type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </label>
                <label className="full">Phone number
                  <input required inputMode="numeric" maxLength="10" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, "") })} />
                </label>
                {!profileData.department && (
                  <label className="full">Staff type
                    <select required value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}>
                      <option value="">Select staff type</option>
                      {STAFF_DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
                    </select>
                    <small>Choose once. After that only the admin can change it.</small>
                  </label>
                )}
              </div>
              {editError && <p className="staff-edit-error" role="alert">{editError}</p>}
              <div className="staff-edit-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)} disabled={savingProfile}>Cancel</button>
                <button type="submit" className="save-btn" disabled={savingProfile}>{savingProfile ? "Saving..." : "Save changes"}</button>
              </div>
            </form>
          </div>
        )}

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

              <button type="button" className="edit-profile-btn" onClick={openEditModal}>Edit Profile</button>

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
                  readOnly
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
                  readOnly
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
                    readOnly
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
                    readOnly
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
                  Department
                </label>

                <input type="text" value={profileData.department || "Not set"} readOnly />

                <small className="profile-hint">
                  {profileData.department
                    ? "Only the admin can change your staff type."
                    : "Choose your staff type once from Edit Profile."}
                </small>

              </div>

              <div className="form-group">

                <label>
                  Joining Date
                </label>

                <input
                  type="text"
                  value={
                    profileData.joining_date
                      ? new Date(profileData.joining_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"
                  }
                  readOnly
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
                  <strong>{summaryLoading ? "—" : workSummary?.complaints_total ?? 0}</strong>
                  <small>Assigned Complaints</small>
                </div>
              </div>

              <div className="summary-box">
                <span className="summary-icon">
                  ✅
                </span>

                <div>
                  <strong>{summaryLoading ? "—" : workSummary?.tasks_completed ?? 0}</strong>
                  <small>Completed Tasks</small>
                </div>
              </div>

              <div className="summary-box">
                <span className="summary-icon">
                  ⏳
                </span>

                <div>
                  <strong>
                    {summaryLoading
                      ? "—"
                      : Number(workSummary?.complaints_open || 0) +
                        Number(workSummary?.tasks_pending || 0) +
                        Number(workSummary?.tasks_in_progress || 0)}
                  </strong>
                  <small>Open Work Items</small>
                </div>
              </div>

            </div>
            {summaryError && (
              <div className="profile-summary-error" role="alert">
                <span>{summaryError}</span>
                <button type="button" onClick={() => fetchWorkSummary()}>
                  Retry
                </button>
              </div>
            )}

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
