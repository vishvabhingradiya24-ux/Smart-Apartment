import { useState } from "react";
import "../../css/complaints.css";

const Complaints = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Demo data for UI.
  // Backend + MySQL integration will be added later.
  const [complaints] = useState([
    {
      id: "C001",
      residentId: "R201",
      residentName: "Rahul Patel",
      flat: "A-305",
      title: "Water leakage",
      description: "Water is leaking from the bathroom pipe.",
      category: "Plumbing",
      priority: "High",
      status: "Pending",
      assignedTo: "Vijay Parmar",
      date: "18-Sep-2026 10:30 AM",
    },
    {
      id: "C002",
      residentId: "R202",
      residentName: "Priya Shah",
      flat: "B-204",
      title: "Lift not working",
      description: "The lift is not working properly.",
      category: "Electrical",
      priority: "High",
      status: "In Progress",
      assignedTo: "Amit Shah",
      date: "18-Sep-2026 12:15 PM",
    },
    {
      id: "C003",
      residentId: "R203",
      residentName: "Karan Mehta",
      flat: "A-102",
      title: "Cleaning required",
      description: "Common area requires cleaning.",
      category: "Cleaning",
      priority: "Medium",
      status: "Assigned",
      assignedTo: "Kiran Mehta",
      date: "19-Sep-2026 09:20 AM",
    },
    {
      id: "C004",
      residentId: "R204",
      residentName: "Neha Patel",
      flat: "C-401",
      title: "Parking issue",
      description: "Another vehicle is parked in the assigned space.",
      category: "Parking",
      priority: "Low",
      status: "Resolved",
      assignedTo: "Rahul Patel",
      date: "19-Sep-2026 03:40 PM",
    },
    {
      id: "C005",
      residentId: "R205",
      residentName: "Aarav Shah",
      flat: "B-302",
      title: "Water supply issue",
      description: "Water supply is not available in the morning.",
      category: "Water",
      priority: "Medium",
      status: "Pending",
      assignedTo: "Not Assigned",
      date: "20-Sep-2026 08:45 AM",
    },
  ]);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.residentName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.flat
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

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

  const pendingCount = complaints.filter(
    (complaint) => complaint.status === "Pending"
  ).length;

  const inProgressCount = complaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedCount = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  const handleView = (complaint) => {
    alert(
      `Complaint Details\n\nComplaint ID: ${complaint.id}\nResident: ${complaint.residentName}\nFlat: ${complaint.flat}\nTitle: ${complaint.title}\nCategory: ${complaint.category}\nStatus: ${complaint.status}\nAssigned To: ${complaint.assignedTo}`
    );
  };

  const handleEdit = (complaint) => {
    alert(
      `Update Complaint: ${complaint.id}\n\nBackend functionality will be connected later.`
    );
  };

  const handleAssign = (complaint) => {
    alert(
      `Assign Complaint: ${complaint.id}\n\nStaff assignment will be connected with backend later.`
    );
  };

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
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
        >
          <option value="All">All Categories</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Parking">Parking</option>
          <option value="Water">Water</option>
        </select>

      </div>

      {/* ================= TABLE ================= */}

      <div className="complaints-table-card">

        <div className="complaints-table-header">
          <div>
            <h2>Complaint List</h2>

            <p>
              {filteredComplaints.length} complaint
              {filteredComplaints.length !== 1 ? "s" : ""} found
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

              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id}>

                    <td>
                      <span className="complaint-id">
                        {complaint.id}
                      </span>
                    </td>

                    <td>
                      <div className="resident-complaint-details">

                        <div className="resident-complaint-avatar">
                          {complaint.residentName.charAt(0)}
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

                    <td>
                      <span className="category-badge">
                        {complaint.category}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`priority-badge ${complaint.priority.toLowerCase()}`}
                      >
                        {complaint.priority}
                      </span>
                    </td>

                    <td>
                      <span className="assigned-staff">
                        {complaint.assignedTo}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`complaint-status ${complaint.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {complaint.status}
                      </span>
                    </td>

                    <td>
                      <span className="complaint-date">
                        {complaint.date}
                      </span>
                    </td>

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
                        Try changing your search or filter criteria.
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
            Resident submits complaint → Admin reviews and
            categorizes → Complaint is assigned to staff →
            Staff works on the issue → Status is updated →
            Complaint is resolved.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Complaints;