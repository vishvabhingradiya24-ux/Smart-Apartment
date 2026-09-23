import { useState } from "react";
import "../../css/security.css";

const Security = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [shiftFilter, setShiftFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Demo data for UI
  // Backend + MySQL integration will be done later.
  const [guards] = useState([
    {
      id: "G001",
      name: "Ramesh Patel",
      userId: "U101",
      shift: "Morning",
      joiningDate: "12-Jan-2025",
      gateNumber: "Gate 1",
      phone: "9876543210",
      email: "ramesh@gmail.com",
      status: "Active",
    },
    {
      id: "G002",
      name: "Mahesh Shah",
      userId: "U102",
      shift: "Evening",
      joiningDate: "05-Mar-2025",
      gateNumber: "Gate 2",
      phone: "9876543211",
      email: "mahesh@gmail.com",
      status: "Active",
    },
    {
      id: "G003",
      name: "Suresh Parmar",
      userId: "U103",
      shift: "Night",
      joiningDate: "20-Jun-2024",
      gateNumber: "Gate 1",
      phone: "9876543212",
      email: "suresh@gmail.com",
      status: "Active",
    },
    {
      id: "G004",
      name: "Ajay Mehta",
      userId: "U104",
      shift: "Morning",
      joiningDate: "15-Aug-2024",
      gateNumber: "Gate 2",
      phone: "9876543213",
      email: "ajay@gmail.com",
      status: "Inactive",
    },
  ]);

  const filteredGuards = guards.filter((guard) => {
    const matchesSearch =
      guard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guard.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guard.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guard.gateNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesShift =
      shiftFilter === "All" || guard.shift === shiftFilter;

    const matchesStatus =
      statusFilter === "All" || guard.status === statusFilter;

    return matchesSearch && matchesShift && matchesStatus;
  });

  const handleAddGuard = () => {
    alert("Add Security Guard form will be connected with backend later.");
  };

  const handleView = (guard) => {
    alert(
      `Security Guard Details\n\nName: ${guard.name}\nGuard ID: ${guard.id}\nShift: ${guard.shift}\nGate: ${guard.gateNumber}`
    );
  };

  const handleEdit = (guard) => {
    alert(`Edit Security Guard: ${guard.name}`);
  };

  const handleDelete = (guard) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${guard.name}?`
    );

    if (confirmDelete) {
      alert("Delete functionality will be connected with backend later.");
    }
  };

  const activeGuards = guards.filter(
    (guard) => guard.status === "Active"
  ).length;

  const morningGuards = guards.filter(
    (guard) => guard.shift === "Morning"
  ).length;

  const nightGuards = guards.filter(
    (guard) => guard.shift === "Night"
  ).length;

  return (
    <div className="security-page">
      {/* Header */}
      <div className="security-header">
        <div>
          <span className="security-overline">SECURITY MANAGEMENT</span>
          <h1>Security Guards</h1>
          <p>
            Manage security guards, shifts and gate assignments.
          </p>
        </div>

        <button className="security-add-btn" onClick={handleAddGuard}>
          <span>＋</span>
          Add Security Guard
        </button>
      </div>

      {/* Summary Cards */}
      <div className="security-stats">
        <div className="security-stat-card">
          <div className="security-stat-icon">🛡️</div>
          <div>
            <span>Total Guards</span>
            <strong>{guards.length}</strong>
          </div>
        </div>

        <div className="security-stat-card">
          <div className="security-stat-icon">✅</div>
          <div>
            <span>Active Guards</span>
            <strong>{activeGuards}</strong>
          </div>
        </div>

        <div className="security-stat-card">
          <div className="security-stat-icon">🌅</div>
          <div>
            <span>Morning Shift</span>
            <strong>{morningGuards}</strong>
          </div>
        </div>

        <div className="security-stat-card">
          <div className="security-stat-icon">🌙</div>
          <div>
            <span>Night Shift</span>
            <strong>{nightGuards}</strong>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="security-toolbar">
        <div className="security-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by name, Guard ID, User ID or gate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={shiftFilter}
          onChange={(e) => setShiftFilter(e.target.value)}
        >
          <option value="All">All Shifts</option>
          <option value="Morning">Morning</option>
          <option value="Evening">Evening</option>
          <option value="Night">Night</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Security Guard Table */}
      <div className="security-table-card">
        <div className="security-table-header">
          <div>
            <h2>Security Guard List</h2>
            <p>
              {filteredGuards.length} guard
              {filteredGuards.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="security-table-wrapper">
          <table className="security-table">
            <thead>
              <tr>
                <th>Guard ID</th>
                <th>Guard Details</th>
                <th>Shift</th>
                <th>Joining Date</th>
                <th>Gate No.</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredGuards.length > 0 ? (
                filteredGuards.map((guard) => (
                  <tr key={guard.id}>
                    <td>
                      <span className="guard-id">{guard.id}</span>
                    </td>

                    <td>
                      <div className="guard-details">
                        <div className="guard-avatar">
                          {guard.name.charAt(0)}
                        </div>

                        <div>
                          <strong>{guard.name}</strong>
                          <small>User ID: {guard.userId}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`shift-badge ${guard.shift.toLowerCase()}`}
                      >
                        {guard.shift}
                      </span>
                    </td>

                    <td>{guard.joiningDate}</td>

                    <td>
                      <span className="gate-badge">
                        🚪 {guard.gateNumber}
                      </span>
                    </td>

                    <td>
                      <div className="contact-info">
                        <span>📞 {guard.phone}</span>
                        <small>✉️ {guard.email}</small>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`security-status ${
                          guard.status.toLowerCase()
                        }`}
                      >
                        {guard.status}
                      </span>
                    </td>

                    <td>
                      <div className="security-actions">
                        <button
                          className="action-view"
                          onClick={() => handleView(guard)}
                          title="View"
                        >
                          👁️
                        </button>

                        <button
                          className="action-edit"
                          onClick={() => handleEdit(guard)}
                          title="Edit"
                        >
                          ✏️
                        </button>

                        <button
                          className="action-delete"
                          onClick={() => handleDelete(guard)}
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
                    <div className="security-empty">
                      <div>🔍</div>
                      <h3>No security guards found</h3>
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

      {/* Gate Activity Section */}
      <div className="gate-activity-card">
        <div className="gate-activity-icon">🚪</div>

        <div className="gate-activity-content">
          <h3>Gate Activity Monitoring</h3>
          <p>
            Visitor verification, entry/exit records and gate activity
            monitoring will be connected with the security module.
          </p>
        </div>

        <button
          className="gate-activity-btn"
          onClick={() =>
            alert("Gate activity module will be developed next.")
          }
        >
          View Activity
        </button>
      </div>
    </div>
  );
};

export default Security;