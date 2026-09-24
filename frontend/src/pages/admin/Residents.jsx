import { useState } from "react";
import "../../css/resident.css";

const Residents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [residents] = useState([
    {
      id: 1,
      name: "Rahul Shah",
      flat: "A-101",
      phone: "9876543210",
      email: "rahul.shah@gmail.com",
      members: 4,
      status: "Active",
    },
    {
      id: 2,
      name: "Priya Patel",
      flat: "A-202",
      phone: "9876543211",
      email: "priya.patel@gmail.com",
      members: 3,
      status: "Active",
    },
    {
      id: 3,
      name: "Amit Mehta",
      flat: "B-103",
      phone: "9876543212",
      email: "amit.mehta@gmail.com",
      members: 2,
      status: "Active",
    },
    {
      id: 4,
      name: "Neha Joshi",
      flat: "B-204",
      phone: "9876543213",
      email: "neha.joshi@gmail.com",
      members: 5,
      status: "Inactive",
    },
    {
      id: 5,
      name: "Karan Desai",
      flat: "C-301",
      phone: "9876543214",
      email: "karan.desai@gmail.com",
      members: 3,
      status: "Active",
    },
    {
      id: 6,
      name: "Pooja Shah",
      flat: "C-402",
      phone: "9876543215",
      email: "pooja.shah@gmail.com",
      members: 4,
      status: "Active",
    },
  ]);

  const filteredResidents = residents.filter((resident) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      resident.name.toLowerCase().includes(search) ||
      resident.flat.toLowerCase().includes(search) ||
      resident.email.toLowerCase().includes(search) ||
      resident.phone.includes(search);

    const matchesStatus =
      statusFilter === "All" || resident.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddResident = () => {
    alert("Add Resident form will be connected here.");
  };

  const handleView = (resident) => {
    alert(
      `Resident Details\n\nName: ${resident.name}\nFlat: ${resident.flat}\nPhone: ${resident.phone}\nEmail: ${resident.email}`
    );
  };

  const handleEdit = (resident) => {
    alert(`Edit Resident: ${resident.name}`);
  };

  const handleDelete = (resident) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${resident.name}?`
    );

    if (confirmDelete) {
      alert("Delete functionality will be connected with backend later.");
    }
  };

  return (
    <div className="residents-page">
      {/* Page Header */}
      <div className="residents-page-header">
        <div>
          <span className="residents-overline">ADMINISTRATION</span>
          <h1>Residents</h1>
          <p>Manage society residents and their information.</p>
        </div>

        <button
          className="add-resident-button"
          onClick={handleAddResident}
        >
          <span>＋</span>
          Add Resident
        </button>
      </div>

      {/* Summary Cards */}
      <div className="resident-summary-grid">
        <div className="resident-summary-card">
          <div className="summary-icon">👥</div>
          <div>
            <span>Total Residents</span>
            <strong>{residents.length}</strong>
          </div>
        </div>

        <div className="resident-summary-card">
          <div className="summary-icon">🏠</div>
          <div>
            <span>Occupied Flats</span>
            <strong>{residents.length}</strong>
          </div>
        </div>

        <div className="resident-summary-card">
          <div className="summary-icon">✅</div>
          <div>
            <span>Active Residents</span>
            <strong>
              {residents.filter((resident) => resident.status === "Active").length}
            </strong>
          </div>
        </div>

        <div className="resident-summary-card">
          <div className="summary-icon">👨‍👩‍👧‍👦</div>
          <div>
            <span>Total Family Members</span>
            <strong>
              {residents.reduce(
                (total, resident) => total + resident.members,
                0
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* Residents Table Card */}
      <div className="residents-table-card">
        <div className="residents-table-header">
          <div>
            <h2>Resident List</h2>
            <p>View and manage all registered residents.</p>
          </div>

          <div className="resident-filters">
            <div className="resident-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search residents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="resident-status-filter"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="residents-table-wrapper">
          <table className="residents-table">
            <thead>
              <tr>
                <th>Resident</th>
                <th>Flat No.</th>
                <th>Contact</th>
                <th>Family Members</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredResidents.length > 0 ? (
                filteredResidents.map((resident) => (
                  <tr key={resident.id}>
                    <td>
                      <div className="resident-name-cell">
                        <div className="resident-avatar">
                          {resident.name.charAt(0)}
                        </div>

                        <div>
                          <strong>{resident.name}</strong>
                          <span>{resident.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="flat-badge">{resident.flat}</span>
                    </td>

                    <td>
                      <div className="resident-contact">
                        <span>{resident.phone}</span>
                      </div>
                    </td>

                    <td>
                      <span className="family-count">
                        👨‍👩‍👧 {resident.members}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`resident-status ${
                          resident.status === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {resident.status}
                      </span>
                    </td>

                    <td>
                      <div className="resident-actions">
                        <button
                          className="action-button view"
                          onClick={() => handleView(resident)}
                          title="View"
                        >
                          👁️
                        </button>

                        <button
                          className="action-button edit"
                          onClick={() => handleEdit(resident)}
                          title="Edit"
                        >
                          ✏️
                        </button>

                        <button
                          className="action-button delete"
                          onClick={() => handleDelete(resident)}
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
                  <td colSpan="6">
                    <div className="no-residents">
                      <div>🔎</div>
                      <h3>No residents found</h3>
                      <p>
                        Try changing your search or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="residents-table-footer">
          <span>
            Showing <strong>{filteredResidents.length}</strong> of{" "}
            <strong>{residents.length}</strong> residents
          </span>
        </div>
      </div>
    </div>
  );
};

export default Residents;