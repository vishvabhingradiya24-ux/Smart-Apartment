import { useCallback, useEffect, useMemo, useState } from "react";
import "../../css/admin.css";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

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
    <div className="admin-records-page admin-residents-page">
      <header className="admin-records-header">
        <div>
          <span className="admin-records-eyebrow">ADMINISTRATION</span>
          <h1>Residents</h1>
          <p>Resident contact and flat information from your database.</p>
        </div>
        <button type="button" className="admin-records-refresh" onClick={() => fetchResidents()} disabled={loading}>↻ Refresh</button>
      </header>

      <section className="admin-records-stats">
        <article><span>👥</span><div><small>Total residents</small><strong>{loading ? "—" : residents.length}</strong></div></article>
        <article><span>🏠</span><div><small>Occupied flats</small><strong>{loading ? "—" : occupiedFlats.size}</strong></div></article>
        <article><span>🆕</span><div><small>Joined this month</small><strong>{loading ? "—" : joinedThisMonth}</strong></div></article>
      </section>

      <section className="admin-records-card">
        <div className="admin-records-card-header">
          <div><h2>Resident Directory</h2><p>{filteredResidents.length} of {residents.length} residents</p></div>
          <label className="admin-records-search">
            <span>🔍</span>
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name, flat, phone or email" />
          </label>
        </div>

        {loading ? <div className="admin-records-state">Loading residents from database...</div> : error ? (
          <div className="admin-records-state error"><strong>Unable to load residents</strong><p>{error}</p><button type="button" onClick={() => fetchResidents()}>Try again</button></div>
        ) : filteredResidents.length === 0 ? <div className="admin-records-state">No residents match this search.</div> : (
          <div className="admin-records-table-wrap">
            <table className="admin-records-table">
              <thead><tr><th>Resident</th><th>Flat</th><th>Phone</th><th>Registered</th></tr></thead>
              <tbody>{filteredResidents.map((resident) => {
                const name = `${resident.first_name || ""} ${resident.last_name || ""}`.trim() || "Resident";
                return <tr key={resident.id}>
                  <td><div className="admin-records-person"><span>{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><small>{resident.email || "No email on file"}</small></div></div></td>
                  <td><span className="admin-records-badge">{[resident.block_wing, resident.flat_number].filter(Boolean).join(" - ") || "Not assigned"}</span></td>
                  <td>{resident.phone || "—"}</td>
                  <td>{formatDate(resident.created_at)}</td>
                </tr>;
              })}</tbody>
            </table>
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
