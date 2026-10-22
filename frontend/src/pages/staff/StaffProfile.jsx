import { useCallback, useEffect, useState } from "react";
import "../../css/resident/profile.css";
import "./staffProfile.css";
import { STAFF_DEPARTMENTS } from "../../constants/staffDepartments";

function StaffProfile() {
  const [staff, setStaff] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });
  const [profileData, setProfileData] = useState({
    first_name: staff?.first_name || staff?.name || "Staff",
    last_name: staff?.last_name || "",
    email: staff?.email || "",
    phone: staff?.phone || staff?.mobile || "",
    department: staff?.department || "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
  });
  const [editError, setEditError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [workSummary, setWorkSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fullName = `${profileData.first_name} ${profileData.last_name}`.trim();
  const initials = `${profileData.first_name.charAt(0)}${profileData.last_name.charAt(0)}`.toUpperCase() || "S";

  const fetchWorkSummary = useCallback(async (signal) => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Please sign in again to load your work summary.");

      const response = await fetch("http://localhost:5000/api/staff/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load work summary.");

      setWorkSummary(data.counts);
      if (data.staff) {
        setProfileData((currentProfile) => ({
          ...currentProfile,
          first_name: data.staff.first_name || currentProfile.first_name,
          last_name: data.staff.last_name || currentProfile.last_name,
          department: data.staff.department || "",
        }));
        setStaff((currentStaff) => ({ ...currentStaff, ...data.staff }));
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
    const loadWorkSummary = async () => fetchWorkSummary(controller.signal);
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

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((current) => ({ ...current, [name]: value }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
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
    if (!staff?.department && !STAFF_DEPARTMENTS.includes(form.department)) {
      setEditError("Please select a valid staff department.");
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

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
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
      if (!response.ok) throw new Error(data.message || "Unable to change password.");
      alert("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      alert(error.message || "Unable to change password.");
    }
  };

  return (
    <div className="profile-page staff-profile-page">
      <header className="profile-topbar">
        <div>
          <span className="profile-overline">STAFF SPACE</span>
          <h1>My Profile</h1>
          <p>View your personal information, role, work activity and account security.</p>
        </div>
        <div className="staff-profile-actions">
          <button type="button" className="profile-save-btn" onClick={openEditModal}>
            Edit Profile
          </button>
        </div>
      </header>

      <div className="profile-container">
        <section className="profile-main-card">
          <div className="profile-cover"><div className="cover-pattern" /></div>
          <div className="profile-card-content">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-heading">
              <div>
                <h2>{fullName || "Staff"}</h2>
                <p>{profileData.email || "Email not available"}</p>
              </div>
              <span className="resident-badge">
                <span className="badge-dot" />
                {profileData.department || "Staff Member"}
              </span>
            </div>
            <div className="profile-divider" />
            <div className="profile-stats">
              <div className="profile-stat">
                <span>DEPARTMENT</span>
                <strong>{profileData.department || "Not assigned"}</strong>
              </div>
              <div className="profile-stat">
                <span>ACCOUNT TYPE</span>
                <strong>Staff</strong>
              </div>
              <div className="profile-stat">
                <span>ACCOUNT STATUS</span>
                <strong>Active</strong>
              </div>
            </div>
          </div>
        </section>

        <div className="profile-info-grid">
          <section className="info-card">
            <div className="info-card-header">
              <div className="info-icon blue">👤</div>
              <div><span>PERSONAL DETAILS</span><h3>Personal Information</h3></div>
            </div>
            <div className="info-fields">
              <div className="info-field"><label>First Name</label><div>{profileData.first_name || "Not available"}</div></div>
              <div className="info-field"><label>Last Name</label><div>{profileData.last_name || "Not available"}</div></div>
              <div className="info-field full"><label>Email Address</label><div>{profileData.email || "Not available"}</div></div>
              <div className="info-field"><label>Phone Number</label><div>{profileData.phone || "Not available"}</div></div>
              <div className="info-field"><label>Account Type</label><div>Staff</div></div>
            </div>
          </section>

          <section className="info-card">
            <div className="info-card-header">
              <div className="info-icon green">🏢</div>
              <div><span>STAFF DETAILS</span><h3>Work Information</h3></div>
            </div>
            <div className="residence-profile">
              <div className="residence-row">
                <div className="residence-symbol">D</div>
                <div><span>DEPARTMENT</span>
                  <strong>{profileData.department || "Not assigned"}</strong>
                </div>
              </div>
              <div className="residence-row">
                <div className="residence-symbol">S</div>
                <div><span>ACCOUNT STATUS</span><strong>Active</strong></div>
              </div>
              {!staff?.department && (
                <p className="staff-profile-hint">Choose your staff type once. After that, only the admin can change it.</p>
              )}
            </div>
          </section>

          <section className="info-card staff-work-summary">
            <div className="info-card-header">
              <div className="info-icon green">📊</div>
              <div><span>STAFF ACTIVITY</span><h3>Work Summary</h3></div>
            </div>
            {summaryLoading ? (
              <div className="staff-summary-state">Loading work summary...</div>
            ) : (
              <div className="staff-summary-grid">
                <div className="profile-stat"><span>ASSIGNED COMPLAINTS</span><strong>{workSummary?.complaints_total ?? 0}</strong></div>
                <div className="profile-stat"><span>SERVICE REQUESTS</span><strong>{workSummary?.service_requests_total ?? 0}</strong></div>
                <div className="profile-stat"><span>COMPLETED TASKS</span><strong>{workSummary?.tasks_completed ?? 0}</strong></div>
                <div className="profile-stat"><span>OPEN WORK ITEMS</span><strong>
                  {Number(workSummary?.complaints_open || 0) +
                    Number(workSummary?.service_requests_open || 0) +
                    Number(workSummary?.tasks_pending || 0) +
                    Number(workSummary?.tasks_in_progress || 0)}
                </strong></div>
              </div>
            )}
            {summaryError && (
              <div className="staff-summary-error" role="alert">
                <span>{summaryError}</span>
                <button type="button" onClick={() => fetchWorkSummary()}>Retry</button>
              </div>
            )}
          </section>
        </div>

        <section className="info-card staff-password-card">
          <div className="info-card-header">
            <div className="info-icon blue">🔐</div>
            <div><span>ACCOUNT SECURITY</span><h3>Change Password</h3></div>
          </div>
          <form className="staff-password-form" onSubmit={handleChangePassword}>
            <label>
              Current Password
              <input type={showCurrentPassword ? "text" : "password"} name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Enter current password" required />
              <button type="button" onClick={() => setShowCurrentPassword((shown) => !shown)}>{showCurrentPassword ? "Hide" : "Show"}</button>
            </label>
            <label>
              New Password
              <input type={showNewPassword ? "text" : "password"} name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="Enter new password" required />
              <button type="button" onClick={() => setShowNewPassword((shown) => !shown)}>{showNewPassword ? "Hide" : "Show"}</button>
            </label>
            <label>
              Confirm New Password
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm new password" required />
              <button type="button" onClick={() => setShowConfirmPassword((shown) => !shown)}>{showConfirmPassword ? "Hide" : "Show"}</button>
            </label>
            <button className="profile-save-btn staff-password-submit" type="submit">Update Password</button>
          </form>
        </section>

        <section className="profile-security-card">
          <div className="security-icon">✓</div>
          <div>
            <span>ACCOUNT STATUS</span>
            <h3>Your account is active</h3>
            <p>Your staff account is connected to the Smart Apartment management system.</p>
          </div>
          <div className="active-pill">Active</div>
        </section>
      </div>
      {showEditModal && (
        <div
          className="staff-profile-edit-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingProfile) setShowEditModal(false);
          }}
        >
          <form className="staff-profile-edit-modal" onSubmit={handleSaveProfile} role="dialog" aria-modal="true" aria-label="Edit profile">
            <div className="staff-profile-edit-header">
              <h2>Edit Profile</h2>
              <button type="button" onClick={() => setShowEditModal(false)} disabled={savingProfile} aria-label="Close">×</button>
            </div>
            <div className="staff-profile-edit-grid">
              <label>First name
                <input required maxLength="100" name="first_name" value={editForm.first_name} onChange={handleEditFormChange} />
              </label>
              <label>Last name
                <input required maxLength="100" name="last_name" value={editForm.last_name} onChange={handleEditFormChange} />
              </label>
              <label className="full">Email address
                <input required type="email" name="email" value={editForm.email} onChange={handleEditFormChange} />
              </label>
              <label className="full">Phone number
                <input required inputMode="numeric" maxLength="10" name="phone" value={editForm.phone} onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "") }))} />
              </label>
              {!staff?.department && (
                <label className="full">Staff type
                  <select required name="department" value={editForm.department} onChange={handleEditFormChange}>
                    <option value="">Select staff type</option>
                    {STAFF_DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
                  </select>
                  <small>Choose once. After that only the admin can change it.</small>
                </label>
              )}
            </div>
            {editError && <p className="staff-profile-edit-error" role="alert">{editError}</p>}
            <div className="staff-profile-edit-actions">
              <button type="button" onClick={() => setShowEditModal(false)} disabled={savingProfile}>Cancel</button>
              <button type="submit" disabled={savingProfile}>{savingProfile ? "Saving..." : "Save changes"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default StaffProfile;
