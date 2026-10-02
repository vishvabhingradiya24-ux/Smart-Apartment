import { useEffect, useState } from "react";
import "../../css/complaints.css";

const Complaints = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH COMPLAINTS FROM DATABASE
  // ==========================================
  useEffect(() => {
    fetchComplaints();
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
        assignedTo: "Not Assigned",

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
  const handleAssign = (complaint) => {
    alert(
      `Assign Complaint: ${complaint.id}\n\n` +
      `Staff assignment functionality will be connected later.`
    );
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

    </div>
  );
};

export default Complaints;