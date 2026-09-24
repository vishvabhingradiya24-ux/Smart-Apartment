import { useState } from "react";
import "../../css/amenities.css";

const Amenities = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [amenities] = useState([
    {
      id: "AM001",
      name: "Swimming Pool",
      description: "Swimming pool facility for society residents.",
      location: "Block A - Ground Floor",
      capacity: 50,
      bookingRequired: "Yes",
      status: "Available",
      bookings: 18,
    },
    {
      id: "AM002",
      name: "Club House",
      description: "Community hall for meetings and private functions.",
      location: "Block B - Ground Floor",
      capacity: 100,
      bookingRequired: "Yes",
      status: "Available",
      bookings: 12,
    },
    {
      id: "AM003",
      name: "Gym",
      description: "Fitness and workout facility for residents.",
      location: "Block A - First Floor",
      capacity: 30,
      bookingRequired: "No",
      status: "Available",
      bookings: 25,
    },
    {
      id: "AM004",
      name: "Children Play Area",
      description: "Outdoor play area for children.",
      location: "Central Garden",
      capacity: 40,
      bookingRequired: "No",
      status: "Available",
      bookings: 31,
    },
    {
      id: "AM005",
      name: "Party Lawn",
      description: "Open lawn for social and community events.",
      location: "Block C - Garden",
      capacity: 150,
      bookingRequired: "Yes",
      status: "Maintenance",
      bookings: 8,
    },
  ]);

  const filteredAmenities = amenities.filter((amenity) => {
    const matchesSearch =
      amenity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      amenity.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      amenity.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || amenity.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalAmenities = amenities.length;
  const availableAmenities = amenities.filter(
    (item) => item.status === "Available"
  ).length;
  const maintenanceAmenities = amenities.filter(
    (item) => item.status === "Maintenance"
  ).length;
  const totalBookings = amenities.reduce(
    (total, item) => total + item.bookings,
    0
  );

  const handleAction = (action, amenity) => {
    alert(`${action} selected for ${amenity.name}`);
  };

  return (
    <div className="amenities-page">
      {/* Header */}
      <div className="amenities-header">
        <div>
          <span className="amenities-overline">FACILITY MANAGEMENT</span>
          <h1>Amenities</h1>
          <p>
            Manage society facilities and monitor amenity availability and
            bookings.
          </p>
        </div>

        <button
          className="add-amenity-btn"
          onClick={() => alert("Add Amenity form will open here.")}
        >
          <span>＋</span>
          Add Amenity
        </button>
      </div>

      {/* Summary Cards */}
      <div className="amenity-stats-grid">
        <div className="amenity-stat-card">
          <div className="amenity-stat-icon">🏢</div>
          <div>
            <span>Total Amenities</span>
            <strong>{totalAmenities}</strong>
          </div>
        </div>

        <div className="amenity-stat-card">
          <div className="amenity-stat-icon">✅</div>
          <div>
            <span>Available</span>
            <strong>{availableAmenities}</strong>
          </div>
        </div>

        <div className="amenity-stat-card">
          <div className="amenity-stat-icon">🔧</div>
          <div>
            <span>Under Maintenance</span>
            <strong>{maintenanceAmenities}</strong>
          </div>
        </div>

        <div className="amenity-stat-card">
          <div className="amenity-stat-icon">📅</div>
          <div>
            <span>Total Bookings</span>
            <strong>{totalBookings}</strong>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="amenity-toolbar">
        <div className="amenity-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search amenity, ID or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="amenity-filter"
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>

      {/* Amenities Table */}
      <div className="amenities-card">
        <div className="amenities-card-header">
          <div>
            <h2>Society Amenities</h2>
            <p>Manage available facilities and booking requirements.</p>
          </div>

          <span className="record-count">
            {filteredAmenities.length} Records
          </span>
        </div>

        <div className="amenities-table-wrapper">
          <table className="amenities-table">
            <thead>
              <tr>
                <th>Amenity ID</th>
                <th>Amenity</th>
                <th>Description</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Booking Required</th>
                <th>Status</th>
                <th>Bookings</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAmenities.length > 0 ? (
                filteredAmenities.map((amenity) => (
                  <tr key={amenity.id}>
                    <td>
                      <span className="amenity-id">{amenity.id}</span>
                    </td>

                    <td>
                      <div className="amenity-name-cell">
                        <div className="amenity-avatar">🏠</div>
                        <strong>{amenity.name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="amenity-description">
                        {amenity.description}
                      </span>
                    </td>

                    <td>
                      <span className="location-text">
                        📍 {amenity.location}
                      </span>
                    </td>

                    <td>
                      <span className="capacity-badge">
                        👥 {amenity.capacity}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          amenity.bookingRequired === "Yes"
                            ? "booking-required yes"
                            : "booking-required no"
                        }
                      >
                        {amenity.bookingRequired}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`amenity-status ${amenity.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {amenity.status}
                      </span>
                    </td>

                    <td>
                      <strong className="booking-count">
                        {amenity.bookings}
                      </strong>
                    </td>

                    <td>
                      <div className="amenity-actions">
                        <button
                          className="action-btn view"
                          onClick={() => handleAction("View", amenity)}
                          title="View"
                        >
                          👁️
                        </button>

                        <button
                          className="action-btn edit"
                          onClick={() => handleAction("Edit", amenity)}
                          title="Edit"
                        >
                          ✏️
                        </button>

                        <button
                          className="action-btn delete"
                          onClick={() => handleAction("Delete", amenity)}
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
                  <td colSpan="9" className="no-amenities">
                    No amenities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Activity */}
      <div className="amenity-bottom-grid">
        <div className="amenity-info-card">
          <div className="info-card-icon">📅</div>
          <div>
            <h3>Amenity Booking</h3>
            <p>
              Residents can check facility availability and submit booking
              requests for amenities that require prior booking.
            </p>
            <button
              onClick={() => alert("Amenity booking management will open here.")}
            >
              Manage Bookings →
            </button>
          </div>
        </div>

        <div className="amenity-info-card">
          <div className="info-card-icon">📊</div>
          <div>
            <h3>Facility Overview</h3>
            <p>
              Monitor facility capacity, availability and booking activity
              from one centralized section.
            </p>
            <button
              onClick={() => alert("Amenity report will open here.")}
            >
              View Overview →
            </button>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="amenity-note">
        <span>💡</span>
        <div>
          <strong>Implementation Note</strong>
          <p>
            Current amenity records are demo/static data. Backend API,
            MySQL data and real booking availability will be connected in
            the backend integration phase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Amenities;