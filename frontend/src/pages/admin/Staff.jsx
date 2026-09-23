import { useState } from "react";
import "../../css/staff.css";

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Demo data for UI.
  // Backend + MySQL integration will be added later.
  const [staffList] = useState([
    {
      id: "S001",
      userId: "U201",
      name: "Rahul Patel",
      staffType: "Maintenance Staff",
      joiningDate: "10-Feb-2025",
      department: "Maintenance",
      salary: "150000.00",
      phone: "9876543210",
      status: "Active",
    },
    {
      id: "S002",
      userId: "U202",
      name: "Amit Shah",
      staffType: "Electrician",
      joiningDate: "18-Mar-2024",
      department: "Electrical",
      salary: "180000.00",
      phone: "9876543211",
      status: "Active",
    },
    {
      id: "S003",
      userId: "U203",
      name: "Kiran Mehta",
      staffType: "Housekeeping",
      joiningDate: "05-Jun-2024",
      department: "Housekeeping",
      salary: "120000.00",
      phone: "9876543212",
      status: "Active",
    },
    {
      id: "S004",
      userId: "U204",
      name: "Vijay Parmar",
      staffType: "Plumber",
      joiningDate: "22-Aug-2023",
      department: "Maintenance",
      salary: "145000.00",
      phone: "9876543213",
      status: "Inactive",
    },
  ]);

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.staffType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter === "All" ||
      staff.department === departmentFilter;

    const matchesStatus =
      statusFilter === "All" ||
      staff.status === statusFilter;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus
    );
  });

  const activeStaff = staffList.filter(
    (staff) => staff.status === "Active"
  ).length;

  const maintenanceStaff = staffList.filter(
    (staff) => staff.department === "Maintenance"
  ).length;

  const housekeepingStaff = staffList.filter(
    (staff) => staff.department === "Housekeeping"
  ).length;

  const handleAddStaff = () => {
    alert("Add Staff form will be connected with backend later.");
  };

  const handleView = (staff) => {
    alert(
      `Staff Details\n\nName: ${staff.name}\nStaff ID: ${staff.id}\nType: ${staff.staffType}\nDepartment: ${staff.department}`
    );
  };

  const handleEdit = (staff) => {
    alert(`Edit Staff: ${staff.name}`);
  };

  const handleDelete = (staff) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${staff.name}?`
    );

    if (confirmDelete) {
      alert(
        "Delete functionality will be connected with backend later."
      );
    }
  };

  const handleViewTasks = (staff) => {
    alert(
      `Assigned Tasks for ${staff.name}\n\nTask Management will be connected with backend later.`
    );
  };

  return (
    <div className="staff-page">

      {/* ================= HEADER ================= */}

      <div className="staff-header">
        <div>
          <span className="staff-overline">
            STAFF MANAGEMENT
          </span>

          <h1>Staff Members</h1>

          <p>
            Manage staff information, departments and assigned work.
          </p>
        </div>

        <button
          className="staff-add-btn"
          onClick={handleAddStaff}
        >
          <span>＋</span>
          Add Staff
        </button>
      </div>

      {/* ================= SUMMARY CARDS ================= */}

      <div className="staff-stats">

        <div className="staff-stat-card">
          <div className="staff-stat-icon">
            👨‍💼
          </div>

          <div>
            <span>Total Staff</span>
            <strong>{staffList.length}</strong>
          </div>
        </div>

        <div className="staff-stat-card">
          <div className="staff-stat-icon">
            ✅
          </div>

          <div>
            <span>Active Staff</span>
            <strong>{activeStaff}</strong>
          </div>
        </div>

        <div className="staff-stat-card">
          <div className="staff-stat-icon">
            🔧
          </div>

          <div>
            <span>Maintenance</span>
            <strong>{maintenanceStaff}</strong>
          </div>
        </div>

        <div className="staff-stat-card">
          <div className="staff-stat-icon">
            🧹
          </div>

          <div>
            <span>Housekeeping</span>
            <strong>{housekeepingStaff}</strong>
          </div>
        </div>

      </div>

      {/* ================= FILTERS ================= */}

      <div className="staff-toolbar">

        <div className="staff-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search by name, Staff ID, User ID or type..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) =>
            setDepartmentFilter(e.target.value)
          }
        >
          <option value="All">
            All Departments
          </option>

          <option value="Maintenance">
            Maintenance
          </option>

          <option value="Electrical">
            Electrical
          </option>

          <option value="Housekeeping">
            Housekeeping
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">
            All Status
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </select>

      </div>

      {/* ================= STAFF TABLE ================= */}

      <div className="staff-table-card">

        <div className="staff-table-header">
          <div>
            <h2>Staff List</h2>

            <p>
              {filteredStaff.length} staff member
              {filteredStaff.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="staff-table-wrapper">

          <table className="staff-table">

            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Staff Details</th>
                <th>Staff Type</th>
                <th>Joining Date</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <tr key={staff.id}>

                    <td>
                      <span className="staff-id">
                        {staff.id}
                      </span>
                    </td>

                    <td>
                      <div className="staff-details">

                        <div className="staff-avatar">
                          {staff.name.charAt(0)}
                        </div>

                        <div>
                          <strong>
                            {staff.name}
                          </strong>

                          <small>
                            User ID: {staff.userId}
                          </small>

                          <small>
                            📞 {staff.phone}
                          </small>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="staff-type">
                        {staff.staffType}
                      </span>
                    </td>

                    <td>
                      {staff.joiningDate}
                    </td>

                    <td>
                      <span className="department-badge">
                        {staff.department}
                      </span>
                    </td>

                    <td>
                      <span className="salary-value">
                        ₹{staff.salary}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`staff-status ${staff.status.toLowerCase()}`}
                      >
                        {staff.status}
                      </span>
                    </td>

                    <td>

                      <div className="staff-actions">

                        <button
                          className="action-task"
                          onClick={() =>
                            handleViewTasks(staff)
                          }
                          title="Assigned Tasks"
                        >
                          🔧
                        </button>

                        <button
                          className="action-view"
                          onClick={() =>
                            handleView(staff)
                          }
                          title="View"
                        >
                          👁️
                        </button>

                        <button
                          className="action-edit"
                          onClick={() =>
                            handleEdit(staff)
                          }
                          title="Edit"
                        >
                          ✏️
                        </button>

                        <button
                          className="action-delete"
                          onClick={() =>
                            handleDelete(staff)
                          }
                          title="Delete"
                        >
                          🗑️
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">

                    <div className="staff-empty">

                      <div>🔍</div>

                      <h3>
                        No staff members found
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

      {/* ================= STAFF TASK SECTION ================= */}

      <div className="staff-task-card">

        <div className="staff-task-icon">
          🔧
        </div>

        <div className="staff-task-content">

          <h3>
            Staff Task Management
          </h3>

          <p>
            Assign maintenance work, monitor task progress,
            and track completed activities of staff members.
          </p>

        </div>

        <button
          className="staff-task-btn"
          onClick={() =>
            alert(
              "Staff Task Management will be developed next."
            )
          }
        >
          Manage Tasks
        </button>

      </div>

    </div>
  );
};

export default Staff;