import React, { useMemo, useState } from "react";
import "../../css/staff/staff_inventory.css";
import { useNavigate } from "react-router-dom";

function StaffAssets() {
  const navigate = useNavigate();

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

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [assets, setAssets] = useState([
    {
      id: "AST-001",
      name: "Electric Drill Machine",
      category: "Electrical",
      quantity: 3,
      assigned: 2,
      available: 1,
      condition: "Good",
      location: "Maintenance Room",
      status: "Available",
      date: "25 Sep 2026",
    },
    {
      id: "AST-002",
      name: "Ladder - 10 Feet",
      category: "Tools",
      quantity: 5,
      assigned: 4,
      available: 1,
      condition: "Good",
      location: "Block A Store",
      status: "Available",
      date: "22 Sep 2026",
    },
    {
      id: "AST-003",
      name: "Water Pump",
      category: "Plumbing",
      quantity: 2,
      assigned: 2,
      available: 0,
      condition: "In Use",
      location: "Block B",
      status: "In Use",
      date: "20 Sep 2026",
    },
    {
      id: "AST-004",
      name: "Cleaning Machine",
      category: "Cleaning",
      quantity: 4,
      assigned: 2,
      available: 2,
      condition: "Good",
      location: "Cleaning Store",
      status: "Available",
      date: "18 Sep 2026",
    },
    {
      id: "AST-005",
      name: "Safety Helmet",
      category: "Safety",
      quantity: 10,
      assigned: 8,
      available: 2,
      condition: "Good",
      location: "Security Store",
      status: "Available",
      date: "15 Sep 2026",
    },
    {
      id: "AST-006",
      name: "Voltage Tester",
      category: "Electrical",
      quantity: 3,
      assigned: 3,
      available: 0,
      condition: "Maintenance",
      location: "Electrical Room",
      status: "Maintenance",
      date: "12 Sep 2026",
    },
  ]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        asset.id.toLowerCase().includes(search) ||
        asset.name.toLowerCase().includes(search) ||
        asset.category.toLowerCase().includes(search) ||
        asset.location.toLowerCase().includes(search) ||
        asset.condition.toLowerCase().includes(search);

      const matchesFilter =
        activeFilter === "All" || asset.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [assets, searchTerm, activeFilter]);

  const totalAssets = assets.reduce(
    (total, asset) => total + asset.quantity,
    0
  );

  const assignedAssets = assets.reduce(
    (total, asset) => total + asset.assigned,
    0
  );

  const availableAssets = assets.reduce(
    (total, asset) => total + asset.available,
    0
  );

  const maintenanceAssets = assets.filter(
    (asset) => asset.status === "Maintenance"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("staff");

    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const updateStatus = (id, newStatus) => {
    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id !== id) return asset;

        let assigned = asset.assigned;
        let available = asset.available;

        if (newStatus === "Available") {
          available = Math.max(1, asset.available);
        }

        if (newStatus === "In Use") {
          assigned = asset.quantity;
          available = 0;
        }

        if (newStatus === "Maintenance") {
          available = 0;
        }

        return {
          ...asset,
          status: newStatus,
          assigned,
          available,
        };
      })
    );
  };

  const handleView = (asset) => {
    alert(
      `Asset Details\n\n` +
        `Asset ID: ${asset.id}\n` +
        `Asset Name: ${asset.name}\n` +
        `Category: ${asset.category}\n` +
        `Total Quantity: ${asset.quantity}\n` +
        `Assigned: ${asset.assigned}\n` +
        `Available: ${asset.available}\n` +
        `Condition: ${asset.condition}\n` +
        `Location: ${asset.location}\n` +
        `Status: ${asset.status}\n` +
        `Last Updated: ${asset.date}`
    );
  };

  return (
    <div className="modern-staff-layout">
      {/* ================= SIDEBAR ================= */}

      <aside className="modern-sidebar">
        <div className="brand-header">
          <div className="brand-icon">🏢</div>

          <div className="brand-info">
            <h3>Smart Apartment</h3>
            <span>Staff Portal</span>
          </div>
        </div>

        <div className="sidebar-section-title">MAIN MENU</div>

        <nav className="sidebar-nav">
          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/dashboard")}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/complaints")}
          >
            <span className="nav-icon">🛠️</span>
            <span>Assigned Complaints</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/service-requests")}
          >
            <span className="nav-icon">📋</span>
            <span>Service Requests</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/tasks")}
          >
            <span className="nav-icon">✅</span>
            <span>Tasks</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/maintenance")}
          >
            <span className="nav-icon">⚙️</span>
            <span>Maintenance</span>
          </button>

          <button
            className="nav-btn active"
            onClick={() => handleNavigation("/staff/assets")}
          >
            <span className="nav-icon">📦</span>
            <span>Assets & Inventory</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/work-history")}
          >
            <span className="nav-icon">📜</span>
            <span>Work History</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavigation("/staff/profile")}
          >
            <span className="nav-icon">👤</span>
            <span>My Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="avatar-circle">{initials}</div>

            <div className="user-details">
              <strong>{fullName}</strong>
              <small>{staffType}</small>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="modern-main-content">
        {/* HEADER */}

        <header className="top-header">
          <div className="header-title">
            <span className="badge-tag">ASSETS & INVENTORY</span>

            <h1>Assets & Inventory</h1>

            <p>
              Manage society equipment, inventory stock and assigned assets.
            </p>
          </div>

          <div className="header-actions">
            <div
              className="profile-pill"
              onClick={() => handleNavigation("/staff/profile")}
            >
              <div className="avatar-sm">{initials}</div>

              <span>{fullName}</span>
            </div>
          </div>
        </header>

        {/* ================= STATS ================= */}

        <section className="stats-grid">
          <div className="stat-card stat-active">
            <div className="stat-icon inventory-icon">📦</div>

            <div className="stat-info">
              <h3>Total Assets</h3>

              <span className="stat-value">{totalAssets}</span>

              <small>Total inventory items</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon assigned-icon">👤</div>

            <div className="stat-info">
              <h3>Assigned</h3>

              <span className="stat-value">{assignedAssets}</span>

              <small>Currently assigned</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon available-icon">✓</div>

            <div className="stat-info">
              <h3>Available</h3>

              <span className="stat-value">{availableAssets}</span>

              <small>Ready to use</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon maintenance-icon">🔧</div>

            <div className="stat-info">
              <h3>Maintenance</h3>

              <span className="stat-value">{maintenanceAssets}</span>

              <small>Needs attention</small>
            </div>
          </div>
        </section>

        {/* ================= SEARCH & FILTER ================= */}

        <section className="controls-bar">
          <div className="search-input-wrapper">
            <span className="search-icon-svg">🔍</span>

            <input
              type="text"
              className="search-input"
              placeholder="Search assets, category or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-tabs">
            {["All", "Available", "In Use", "Maintenance"].map((filter) => (
              <button
                key={filter}
                className={`filter-tab-btn ${
                  activeFilter === filter ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* ================= TABLE ================= */}

        <section className="table-container">
          <div className="table-header">
            <div>
              <h2>Inventory List</h2>

              <p>
                {filteredAssets.length} asset
                {filteredAssets.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <button
              className="refresh-btn"
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("All");
              }}
            >
              ↻ Reset
            </button>
          </div>

          {filteredAssets.length > 0 ? (
            <div className="table-scroll">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ASSET ID</th>
                    <th>ASSET DETAILS</th>
                    <th>CATEGORY</th>
                    <th>QUANTITY</th>
                    <th>AVAILABILITY</th>
                    <th>CONDITION</th>
                    <th>LOCATION</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <span className="id-badge">{asset.id}</span>
                      </td>

                      <td>
                        <div className="asset-cell">
                          <div className="asset-avatar">
                            {asset.category === "Electrical" && "⚡"}

                            {asset.category === "Tools" && "🛠️"}

                            {asset.category === "Plumbing" && "🚰"}

                            {asset.category === "Cleaning" && "🧹"}

                            {asset.category === "Safety" && "🦺"}
                          </div>

                          <div>
                            <strong>{asset.name}</strong>

                            <small>Updated {asset.date}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="category-tag">
                          {asset.category}
                        </span>
                      </td>

                      <td>
                        <div className="quantity-cell">
                          <strong>{asset.quantity}</strong>

                          <small>items</small>
                        </div>
                      </td>

                      <td>
                        <div className="availability-cell">
                          <div className="availability-numbers">
                            <span className="available-number">
                              {asset.available}
                            </span>

                            <span>/</span>

                            <span>{asset.quantity}</span>
                          </div>

                          <div className="availability-bar">
                            <span
                              style={{
                                width: `${
                                  asset.quantity > 0
                                    ? (asset.available / asset.quantity) * 100
                                    : 0
                                }%`,
                              }}
                            ></span>
                          </div>

                          <small>Available</small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`condition-pill ${asset.condition
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {asset.condition}
                        </span>
                      </td>

                      <td>
                        <span className="location-cell">
                          📍 {asset.location}
                        </span>
                      </td>

                      <td>
                        <select
                          className={`status-select ${asset.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                          value={asset.status}
                          onChange={(e) =>
                            updateStatus(asset.id, e.target.value)
                          }
                        >
                          <option value="Available">Available</option>

                          <option value="In Use">In Use</option>

                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </td>

                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleView(asset)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>

              <h3>No Assets Found</h3>

              <p>
                Try changing your search or selecting another status.
              </p>

              <button
                className="empty-reset-btn"
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("All");
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StaffAssets;