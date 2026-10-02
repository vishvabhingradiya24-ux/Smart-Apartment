import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/staff/assigned_complaints.css";

function StaffComplaints() {
  const navigate = useNavigate();

  // ======================================================
  // LOGGED-IN STAFF
  // ======================================================

  const [staff] = useState(() => {
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


  // ======================================================
  // STATES
  // ======================================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedComplaint, setSelectedComplaint] = useState(null);


  // ======================================================
  // FETCH ASSIGNED COMPLAINTS FROM DATABASE
  // ======================================================

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);


  const fetchAssignedComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Login session expired. Please login again.");
        setLoading(false);
        return;
      }


      const response = await fetch(
        "http://localhost:5000/api/resident/complaints/staff/assigned",
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch assigned complaints"
        );
      }


      // ==================================================
      // CONVERT DATABASE DATA TO UI FORMAT
      // ==================================================

      const formattedComplaints = data.map((item) => {

        const complaintDate = item.complaint_date
          ? new Date(item.complaint_date)
          : null;


        const formattedDate = complaintDate
          ? complaintDate.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A";


        const formattedTime = complaintDate
          ? complaintDate.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A";


        const residentName =
          `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
          "Unknown Resident";


        return {
          id: `CMP-${String(item.complaint_id).padStart(4, "0")}`,

          complaintId: item.complaint_id,

          residentId: item.resident_id,

          resident: residentName,

          flat: item.flat_number || "N/A",

          category: item.category || "General",

          title: item.complaint_title || "Untitled Complaint",

          description:
            item.complaint_description ||
            "No description available.",

          status: item.status || "Pending",

          date: formattedDate,

          time: formattedTime,

          // Priority is not currently stored in complaints table.
          // So we don't show fake priority from static data.
          priority: "Normal",

          // Phone is not returned by current backend API.
          phone: "Not available",

          userId: item.user_id,
        };
      });


      setComplaints(formattedComplaints);


    } catch (error) {

      console.error(
        "Fetch Assigned Complaints Error:",
        error
      );

      setError(
        error.message ||
        "Unable to load assigned complaints."
      );

    } finally {

      setLoading(false);

    }
  };


  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("staff");

    navigate("/login");
  };


  // ======================================================
  // NAVIGATION
  // ======================================================

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
    }
  };


  // ======================================================
  // FILTER + SEARCH
  // ======================================================

  const filteredComplaints = useMemo(() => {

    return complaints.filter((complaint) => {

      const matchesFilter =
        activeFilter === "All" ||
        complaint.status === activeFilter;


      const search = searchTerm
        .toLowerCase()
        .trim();


      const matchesSearch =
        !search ||
        complaint.id.toLowerCase().includes(search) ||
        complaint.resident.toLowerCase().includes(search) ||
        complaint.flat.toLowerCase().includes(search) ||
        complaint.category.toLowerCase().includes(search) ||
        complaint.title.toLowerCase().includes(search);


      return matchesFilter && matchesSearch;
    });

  }, [complaints, activeFilter, searchTerm]);


  // ======================================================
  // COUNTS
  // ======================================================

  const pendingCount = complaints.filter(
    (item) =>
      String(item.status).toLowerCase() === "pending"
  ).length;


  const progressCount = complaints.filter(
    (item) =>
      String(item.status).toLowerCase() === "in progress"
  ).length;


  const completedCount = complaints.filter(
    (item) =>
      String(item.status).toLowerCase() === "completed"
  ).length;


  // ======================================================
  // STATUS CLASS
  // ======================================================

  const getStatusClass = (status) => {

    const normalizedStatus =
      String(status || "").toLowerCase();


    if (normalizedStatus === "pending") {
      return "pending";
    }


    if (
      normalizedStatus === "in progress" ||
      normalizedStatus === "in-progress"
    ) {
      return "in-progress";
    }


    if (normalizedStatus === "completed") {
      return "completed";
    }


    return "";
  };


  // ======================================================
  // PRIORITY CLASS
  // ======================================================

  const getPriorityClass = (priority) => {

    if (priority === "Urgent") {
      return "urgent";
    }

    if (priority === "High") {
      return "high";
    }

    if (priority === "Medium") {
      return "medium";
    }

    return "low";
  };


  // ======================================================
  // RETURN UI
  // ======================================================

  return (
    <div className="staff-complaints-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="complaints-sidebar">

        <div className="complaints-brand">

          <div className="complaints-brand-icon">
            🏢
          </div>

          <div>
            <h3>Smart Apartment</h3>
            <span>Staff Portal</span>
          </div>

        </div>


        <div className="complaints-menu-title">
          MAIN MENU
        </div>


        <nav className="complaints-sidebar-nav">

          <button
            className="complaints-nav-btn"
            onClick={() =>
              handleNavigation("/staff/dashboard")
            }
          >
            <span>📊</span>
            Dashboard
          </button>


          <button
            className="complaints-nav-btn active"
            onClick={() =>
              handleNavigation("/staff/complaints")
            }
          >
            <span>🛠️</span>
            Assigned Complaints
          </button>


          <button
            className="complaints-nav-btn"
            onClick={() =>
              handleNavigation("/staff/service-requests")
            }
          >
            <span>📋</span>
            Service Requests
          </button>


          <button
            className="complaints-nav-btn"
            onClick={() =>
              handleNavigation("/staff/tasks")
            }
          >
            <span>✅</span>
            Tasks
          </button>


          <button
            className="complaints-nav-btn"
            onClick={() =>
              handleNavigation("/staff/maintenance")
            }
          >
            <span>⚙️</span>
            Maintenance
          </button>


          <button
            className="complaints-nav-btn"
            onClick={() =>
              handleNavigation("/staff/assets")
            }
          >
            <span>📦</span>
            Assets & Inventory
          </button>


          <button
            className="complaints-nav-btn"
            onClick={() =>
              handleNavigation("/staff/work-history")
            }
          >
            <span>📜</span>
            Work History
          </button>


          <button
            className="complaints-nav-btn"
            onClick={() =>
              handleNavigation("/staff/profile")
            }
          >
            <span>👤</span>
            My Profile
          </button>

        </nav>


        <div className="complaints-sidebar-footer">

          <div className="complaints-user">

            <div className="complaints-avatar">
              {initials}
            </div>

            <div className="complaints-user-info">
              <strong>{fullName}</strong>
              <small>{staffType}</small>
            </div>

          </div>


          <button
            className="complaints-logout"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="complaints-main">

        {/* HEADER */}

        <header className="complaints-header">

          <div className="complaints-header-left">

            <button
              className="complaints-back-btn"
              onClick={() =>
                handleNavigation("/staff/dashboard")
              }
            >
              ←
            </button>


            <div>

              <span className="complaints-badge">
                STAFF WORKSPACE
              </span>


              <h1>
                Assigned Complaints
              </h1>


              <p>
                View, manage and resolve complaints assigned to you.
              </p>

            </div>

          </div>


          <div
            className="complaints-profile"
            onClick={() =>
              handleNavigation("/staff/profile")
            }
          >

            <div className="complaints-profile-avatar">
              {initials}
            </div>


            <div className="complaints-profile-info">

              <strong>
                {fullName}
              </strong>

              <span>
                {staffType}
              </span>

            </div>


            <span>⌄</span>

          </div>

        </header>


        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section className="complaints-stats">

          <button
            className="complaint-stat-card total"
            onClick={() =>
              setActiveFilter("All")
            }
          >

            <div className="complaint-stat-icon">
              🛠️
            </div>


            <div>

              <span>
                Total Complaints
              </span>

              <strong>
                {complaints.length}
              </strong>

              <small>
                Assigned to you
              </small>

            </div>

          </button>


          <button
            className="complaint-stat-card pending"
            onClick={() =>
              setActiveFilter("Pending")
            }
          >

            <div className="complaint-stat-icon">
              ⏳
            </div>


            <div>

              <span>
                Pending
              </span>

              <strong>
                {pendingCount}
              </strong>

              <small>
                Need attention
              </small>

            </div>

          </button>


          <button
            className="complaint-stat-card progress"
            onClick={() =>
              setActiveFilter("In Progress")
            }
          >

            <div className="complaint-stat-icon">
              🔧
            </div>


            <div>

              <span>
                In Progress
              </span>

              <strong>
                {progressCount}
              </strong>

              <small>
                Currently working
              </small>

            </div>

          </button>


          <button
            className="complaint-stat-card completed"
            onClick={() =>
              setActiveFilter("Completed")
            }
          >

            <div className="complaint-stat-icon">
              ✅
            </div>


            <div>

              <span>
                Completed
              </span>

              <strong>
                {completedCount}
              </strong>

              <small>
                Successfully resolved
              </small>

            </div>

          </button>

        </section>


        {/* =====================================================
            PAGE TITLE
        ===================================================== */}

        <section className="complaints-section-heading">

          <div>

            <span>
              WORK MANAGEMENT
            </span>

            <h2>
              Complaint Requests
            </h2>

            <p>
              Review assigned complaints and update their progress.
            </p>

          </div>


          <div className="complaint-count">
            {filteredComplaints.length} complaints
          </div>

        </section>


        {/* =====================================================
            SEARCH + FILTER
        ===================================================== */}

        <section className="complaints-controls">

          <div className="complaints-search">

            <span>🔍</span>


            <input
              type="text"
              placeholder="Search complaint, resident, flat..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />


            {searchTerm && (

              <button
                onClick={() =>
                  setSearchTerm("")
                }
                className="clear-search"
              >
                ×
              </button>

            )}

          </div>


          <div className="complaint-filters">

            {[
              "All",
              "Pending",
              "In Progress",
              "Completed",
            ].map((filter) => (

              <button
                key={filter}
                className={
                  activeFilter === filter
                    ? "complaint-filter active"
                    : "complaint-filter"
                }
                onClick={() =>
                  setActiveFilter(filter)
                }
              >
                {filter}
              </button>

            ))}

          </div>

        </section>


        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (

          <section className="complaints-table-wrapper">

            <div
              style={{
                padding: "50px",
                textAlign: "center",
              }}
            >

              <div
                style={{
                  fontSize: "30px",
                  marginBottom: "10px",
                }}
              >
                ⏳
              </div>

              <strong>
                Loading assigned complaints...
              </strong>

              <p>
                Please wait while we fetch data from database.
              </p>

            </div>

          </section>

        )}


        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (

          <section className="complaints-table-wrapper">

            <div
              style={{
                padding: "40px",
                textAlign: "center",
              }}
            >

              <div
                style={{
                  fontSize: "30px",
                  marginBottom: "10px",
                }}
              >
                ⚠️
              </div>


              <strong>
                Unable to load complaints
              </strong>


              <p>
                {error}
              </p>


              <button
                className="view-complaint-btn"
                onClick={fetchAssignedComplaints}
              >
                Try Again →
              </button>

            </div>

          </section>

        )}


        {/* =====================================================
            COMPLAINT TABLE
        ===================================================== */}

        {!loading && !error && (

          <section className="complaints-table-wrapper">

            <div className="complaints-table-scroll">

              <table className="complaints-table">

                <thead>

                  <tr>
                    <th>COMPLAINT</th>
                    <th>RESIDENT</th>
                    <th>CATEGORY</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                    <th>ACTION</th>
                  </tr>

                </thead>


                <tbody>

                  {filteredComplaints.length > 0 ? (

                    filteredComplaints.map((complaint) => (

                      <tr key={complaint.complaintId}>

                        {/* COMPLAINT */}

                        <td>

                          <div className="complaint-id">
                            {complaint.id}
                          </div>


                          <div className="complaint-title">
                            {complaint.title}
                          </div>


                          <div className="complaint-description">
                            {complaint.description}
                          </div>

                        </td>


                        {/* RESIDENT */}

                        <td>

                          <div className="resident-info">

                            <div className="resident-mini-avatar">

                              {complaint.resident
                                .split(" ")
                                .map((name) => name[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}

                            </div>


                            <div>

                              <strong>
                                {complaint.resident}
                              </strong>


                              <small>
                                Flat {complaint.flat}
                              </small>

                            </div>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td>

                          <span className="category-badge">
                            {complaint.category}
                          </span>

                        </td>


                        {/* PRIORITY */}

                        <td>

                          <span
                            className={`priority-badge ${getPriorityClass(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`complaint-status ${getStatusClass(
                              complaint.status
                            )}`}
                          >
                            {complaint.status}
                          </span>

                        </td>


                        {/* DATE */}

                        <td>

                          <div className="complaint-date">

                            <strong>
                              {complaint.date}
                            </strong>


                            <small>
                              {complaint.time}
                            </small>

                          </div>

                        </td>


                        {/* ACTION */}

                        <td>

                          <button
                            className="view-complaint-btn"
                            onClick={() =>
                              setSelectedComplaint(
                                complaint
                              )
                            }
                          >
                            View
                            <span>→</span>
                          </button>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan="7"
                        className="no-complaints"
                      >

                        <div>
                          🔎
                        </div>


                        <strong>
                          No complaints found
                        </strong>


                        <p>
                          {complaints.length === 0
                            ? "No complaints are currently assigned to you."
                            : "Try changing your search or filter."
                          }
                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </section>

        )}


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="complaints-footer">

          <span>
            Showing {filteredComplaints.length} of{" "}
            {complaints.length} assigned complaints
          </span>


          <span>
            Smart Apartment Management System
          </span>

        </footer>

      </main>


      {/* =====================================================
          COMPLAINT DETAILS MODAL
      ===================================================== */}

      {selectedComplaint && (

        <div
          className="complaint-modal-overlay"
          onClick={() =>
            setSelectedComplaint(null)
          }
        >

          <div
            className="complaint-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <span>
                  COMPLAINT DETAILS
                </span>


                <h2>
                  {selectedComplaint.id}
                </h2>

              </div>


              <button
                onClick={() =>
                  setSelectedComplaint(null)
                }
              >
                ×
              </button>

            </div>


            {/* STATUS + PRIORITY */}

            <div className="modal-status-row">

              <span
                className={`complaint-status ${getStatusClass(
                  selectedComplaint.status
                )}`}
              >
                {selectedComplaint.status}
              </span>


              <span
                className={`priority-badge ${getPriorityClass(
                  selectedComplaint.priority
                )}`}
              >
                {selectedComplaint.priority} Priority
              </span>

            </div>


            {/* MODAL CONTENT */}

            <div className="modal-content">

              <h3>
                {selectedComplaint.title}
              </h3>


              <p>
                {selectedComplaint.description}
              </p>


              <div className="modal-details-grid">

                <div>

                  <span>
                    Resident
                  </span>

                  <strong>
                    {selectedComplaint.resident}
                  </strong>

                </div>


                <div>

                  <span>
                    Flat
                  </span>

                  <strong>
                    {selectedComplaint.flat}
                  </strong>

                </div>


                <div>

                  <span>
                    Category
                  </span>

                  <strong>
                    {selectedComplaint.category}
                  </strong>

                </div>


                <div>

                  <span>
                    Submitted
                  </span>

                  <strong>
                    {selectedComplaint.date}
                  </strong>

                </div>

              </div>


              <div className="modal-contact">

                <span>
                  Resident Contact
                </span>


                <strong>
                  📞 {selectedComplaint.phone}
                </strong>

              </div>

            </div>


            {/* MODAL ACTIONS */}

            <div className="modal-actions">

              <button
                className="modal-secondary-btn"
                onClick={() =>
                  setSelectedComplaint(null)
                }
              >
                Close
              </button>


              <button
                className="modal-primary-btn"
                onClick={() => {

                  setSelectedComplaint(null);

                  alert(
                    `Complaint ${selectedComplaint.id} selected for update.`
                  );

                }}
              >
                Update Complaint
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default StaffComplaints;