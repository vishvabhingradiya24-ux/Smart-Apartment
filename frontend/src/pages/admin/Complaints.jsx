import { useEffect, useState } from "react";
import "../../css/complaints.css";

const Complaints = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
const [showAssignModal, setShowAssignModal] = useState(false);
const [selectedComplaint, setSelectedComplaint] = useState(null);
const [selectedStaff, setSelectedStaff] = useState("");
const [assigning, setAssigning] = useState(false);

  // ==========================================
  // FETCH COMPLAINTS FROM DATABASE
  // ==========================================
  useEffect(() => {
  fetchComplaints();
  fetchStaff();
}, []);
  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/resident/complaints/admin/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch complaints"
        );
      }

      // Convert backend data to existing UI format
      const formattedComplaints = data.map((complaint) => ({
        id: `C${String(complaint.complaint_id).padStart(3, "0")}`,

        complaintId: complaint.complaint_id,

        residentId: complaint.resident_id,

        residentName:
          `${complaint.first_name || ""} ${complaint.last_name || ""}`.trim(),

        flat: complaint.flat_number || "N/A",

        title: complaint.complaint_title || "No Title",

        description:
          complaint.complaint_description || "No Description",

        category: complaint.category || "Other",

        // Priority is not currently stored in complaints table
        priority: "Medium",

        status: complaint.status || "Pending",

        // Staff assignment will be connected later
        assignedStaffId:
  complaint.assigned_staff_id || null,

assignedTo:
  complaint.assigned_staff_id
    ? `${complaint.staff_first_name || ""} ${
        complaint.staff_last_name || ""
      }`.trim() || "Assigned Staff"
    : "Not Assigned",

        date: complaint.complaint_date
          ? new Date(
              complaint.complaint_date
            ).toLocaleString()
          : "N/A",
      }));

      setComplaints(formattedComplaints);

    } catch (error) {
      console.error("Admin Complaints Error:", error);

      setComplaints([]);

    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/staff/all"
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch staff"
      );
    }

    setStaffList(data);

  } catch (error) {
    console.error("Fetch Staff Error:", error);
    setStaffList([]);
  }
};


  // ==========================================
  // SEARCH + FILTER
  // ==========================================
  const filteredComplaints = complaints.filter((complaint) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      complaint.id.toLowerCase().includes(search) ||
      complaint.residentName.toLowerCase().includes(search) ||
      complaint.flat.toLowerCase().includes(search) ||
      complaint.title.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      complaint.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All" ||
      complaint.category === categoryFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory
    );
  });


  // ==========================================
  // STATISTICS
  // ==========================================
  const pendingCount = complaints.filter(
    (complaint) => complaint.status === "Pending"
  ).length;

  const inProgressCount = complaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedCount = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;


  // ==========================================
  // VIEW COMPLAINT
  // ==========================================
  const handleView = (complaint) => {
    alert(
      `Complaint Details\n\n` +
      `Complaint ID: ${complaint.id}\n` +
      `Resident: ${complaint.residentName}\n` +
      `Flat: ${complaint.flat}\n` +
      `Title: ${complaint.title}\n` +
      `Category: ${complaint.category}\n` +
      `Status: ${complaint.status}\n` +
      `Assigned To: ${complaint.assignedTo}\n` +
      `Date: ${complaint.date}`
    );
  };


  // ==========================================
  // EDIT COMPLAINT
  // ==========================================
  const handleEdit = (complaint) => {
    alert(
      `Update Complaint: ${complaint.id}\n\n` +
      `Backend update functionality will be connected later.`
    );
  };


  // ==========================================
  // ASSIGN COMPLAINT
  // ==========================================
  const handleAssign = async  (complaint) => {
  setSelectedComplaint(complaint);
  setSelectedStaff(
    complaint.assignedStaffId
      ? String(complaint.assignedStaffId)
      : ""
  );
   // Get latest registered staff from database
  await fetchStaff();
  setShowAssignModal(true);
};

const handleConfirmAssign = async () => {
  if (!selectedComplaint) {
    return;
  }

  if (!selectedStaff) {
    alert("Please select a staff member.");
    return;
  }

  try {
    setAssigning(true);

    const token = localStorage.getItem("token");

    const response = await fetch(
     `http://localhost:5000/api/resident/complaints/admin/${selectedComplaint.id
  .replace("C", "")
  .replace(/^0+/, "")}/assign`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          staff_id: Number(selectedStaff),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to assign complaint"
      );
    }

    alert("Complaint assigned successfully.");

    setShowAssignModal(false);
    setSelectedComplaint(null);
    setSelectedStaff("");

    await fetchComplaints();

  } catch (error) {
    console.error(
      "Assign Complaint Error:",
      error
    );

    alert(
      error.message ||
      "Unable to assign complaint"
    );

  } finally {
    setAssigning(false);
  }
};


  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="complaints-page">

      {/* ================= HEADER ================= */}

      <div className="complaints-header">
        <div>
          <span className="complaints-overline">
            COMPLAINT MANAGEMENT
          </span>

          <h1>Complaints</h1>

          <p>
            Review, assign and monitor resident complaints.
          </p>
        </div>
      </div>


      {/* ================= SUMMARY ================= */}

      <div className="complaints-stats">

        <div className="complaint-stat-card">
          <div className="complaint-stat-icon">
            📝
          </div>

          <div>
            <span>Total Complaints</span>
            <strong>{complaints.length}</strong>
          </div>
        </div>


        <div className="complaint-stat-card">
          <div className="complaint-stat-icon">
            ⏳
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>


        <div className="complaint-stat-card">
          <div className="complaint-stat-icon">
            🔧
          </div>

          <div>
            <span>In Progress</span>
            <strong>{inProgressCount}</strong>
          </div>
        </div>


        <div className="complaint-stat-card">
          <div className="complaint-stat-icon">
            ✅
          </div>

          <div>
            <span>Resolved</span>
            <strong>{resolvedCount}</strong>
          </div>
        </div>

      </div>


      {/* ================= FILTERS ================= */}

      <div className="complaints-toolbar">

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

        </div>


        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">
            All Status
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Assigned">
            Assigned
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Resolved">
            Resolved
          </option>

          <option value="Closed">
            Closed
          </option>
        </select>


        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
        >
          <option value="All">
            All Categories
          </option>

          <option value="Plumbing">
            Plumbing
          </option>

          <option value="Electrical">
            Electrical
          </option>

          <option value="Cleaning">
            Cleaning
          </option>

          <option value="Parking">
            Parking
          </option>

          <option value="Water">
            Water
          </option>
        </select>

      </div>


      {/* ================= TABLE ================= */}

      <div className="complaints-table-card">

        <div className="complaints-table-header">

          <div>

            <h2>
              Complaint List
            </h2>

            <p>
              {filteredComplaints.length} complaint
              {filteredComplaints.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

        </div>


        <div className="complaints-table-wrapper">

          <table className="complaints-table">

            <thead>

              <tr>
                <th>Complaint ID</th>
                <th>Resident</th>
                <th>Complaint</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>

            </thead>


            <tbody>

              {/* LOADING */}

              {loading ? (

                <tr>

                  <td colSpan="9">

                    <div className="complaints-empty">

                      <div>⏳</div>

                      <h3>
                        Loading complaints...
                      </h3>

                      <p>
                        Please wait while complaints are
                        fetched from database.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : filteredComplaints.length > 0 ? (

                filteredComplaints.map((complaint) => (

                  <tr key={complaint.id}>

                    {/* COMPLAINT ID */}

                    <td>

                      <span className="complaint-id">
                        {complaint.id}
                      </span>

                    </td>


                    {/* RESIDENT */}

                    <td>

                      <div className="resident-complaint-details">

                        <div className="resident-complaint-avatar">

                          {complaint.residentName
                            ? complaint.residentName.charAt(0)
                            : "R"}

                        </div>


                        <div>

                          <strong>
                            {complaint.residentName}
                          </strong>

                          <small>
                            {complaint.flat}
                          </small>

                          <small>
                            ID: {complaint.residentId}
                          </small>

                        </div>

                      </div>

                    </td>


                    {/* COMPLAINT */}

                    <td>

                      <div className="complaint-title-cell">

                        <strong>
                          {complaint.title}
                        </strong>

                        <small>
                          {complaint.description}
                        </small>

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
                        className={`priority-badge ${complaint.priority.toLowerCase()}`}
                      >
                        {complaint.priority}
                      </span>

                    </td>


                    {/* ASSIGNED STAFF */}

                    <td>

                      <span className="assigned-staff">
                        {complaint.assignedTo}
                      </span>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`complaint-status ${complaint.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {complaint.status}
                      </span>

                    </td>


                    {/* DATE */}

                    <td>

                      <span className="complaint-date">
                        {complaint.date}
                      </span>

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="complaint-actions">

                        <button
                          className="complaint-action-view"
                          onClick={() =>
                            handleView(complaint)
                          }
                          title="View"
                        >
                          👁️
                        </button>


                        <button
                          className="complaint-action-assign"
                          onClick={() =>
                            handleAssign(complaint)
                          }
                          title="Assign Staff"
                        >
                          👨‍🔧
                        </button>


                        <button
                          className="complaint-action-edit"
                          onClick={() =>
                            handleEdit(complaint)
                          }
                          title="Update"
                        >
                          ✏️
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td colSpan="9">

                    <div className="complaints-empty">

                      <div>🔍</div>

                      <h3>
                        No complaints found
                      </h3>

                      <p>
                        Try changing your search or
                        filter criteria.
                      </p>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================= COMPLAINT WORKFLOW ================= */}

      <div className="complaint-workflow-card">

        <div className="workflow-icon">
          🔄
        </div>

        <div className="workflow-content">

          <h3>
            Complaint Resolution Workflow
          </h3>

          <p>
            Resident submits complaint → Admin reviews
            and categorizes → Complaint is assigned to
            staff → Staff works on the issue → Status is
            updated → Complaint is resolved.
          </p>

        </div>

      </div>
      {showAssignModal && selectedComplaint && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 35, 50, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "25px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#167a8a",
                    letterSpacing: "1px",
                  }}
                >
                  ASSIGN COMPLAINT
                </span>

                <h2
                  style={{
                    margin: "5px 0 0",
                    color: "#102d42",
                    fontSize: "20px",
                  }}
                >
                  Assign Staff
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedComplaint(null);
                  setSelectedStaff("");
                }}
                style={{
                  border: "none",
                  background: "#f1f5f6",
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: "#f4fafb",
                borderRadius: "12px",
                padding: "14px",
                marginBottom: "18px",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#102d42",
                  fontSize: "13px",
                  marginBottom: "5px",
                }}
              >
                {selectedComplaint.title}
              </strong>

              <span
                style={{
                  color: "#708692",
                  fontSize: "11px",
                }}
              >
                {selectedComplaint.id} •{" "}
                {selectedComplaint.residentName} •{" "}
                {selectedComplaint.flat}
              </span>
            </div>

            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#102d42",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Select Staff
            </label>

            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #dcebef",
                borderRadius: "10px",
                background: "#ffffff",
                color: "#102d42",
                fontSize: "12px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">Select staff member</option>

              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.first_name} {staff.last_name}
                  {staff.staff_type ? ` - ${staff.staff_type}` : ""}
                </option>
              ))}
            </select>

            {staffList.length === 0 && (
              <p
                style={{
                  color: "#c04b4b",
                  fontSize: "11px",
                  marginTop: "8px",
                }}
              >
                No staff members found.
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "22px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedComplaint(null);
                  setSelectedStaff("");
                }}
                style={{
                  padding: "10px 16px",
                  border: "1px solid #dcebef",
                  borderRadius: "9px",
                  background: "#ffffff",
                  color: "#5d7380",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={assigning || staffList.length === 0}
                onClick={handleConfirmAssign}
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "9px",
                  background:
                    assigning || staffList.length === 0
                      ? "#9dbfc5"
                      : "#167a8a",
                  color: "#ffffff",
                  cursor:
                    assigning || staffList.length === 0
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {assigning ? "Assigning..." : "Assign Staff"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Complaints;