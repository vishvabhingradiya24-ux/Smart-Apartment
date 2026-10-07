import { useEffect, useMemo, useState } from "react";
import "../../css/amenities.css";

const Amenities = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAmenities = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/amenities", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Amenities load થઈ શક્યા નહીં");
        setAmenities((data.amenities || []).map((row) => ({
          id: `AM${row.facility_id}`, name: row.facility_name || "Facility", description: row.description || "—",
          location: row.location || "—", status: row.availability_status || "Unknown",
          charge: Number(row.base_charge || 0), chargePeriod: row.charge_period || "—",
          bookings: Number(row.total_bookings || 0), openBookings: Number(row.open_bookings || 0),
        })));
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    loadAmenities();
  }, []);

  const filteredAmenities = useMemo(() => amenities.filter((amenity) => {
    const search = searchTerm.toLowerCase();
    return [amenity.name, amenity.id, amenity.location, amenity.description].some((value) => value.toLowerCase().includes(search)) &&
      (statusFilter === "All" || (statusFilter === "Available" ? amenity.status.toLowerCase() === "available" : amenity.status.toLowerCase() !== "available"));
  }), [amenities, searchTerm, statusFilter]);
  const available = amenities.filter((item) => item.status.toLowerCase() === "available").length;
  const unavailable = amenities.length - available;
  const bookings = amenities.reduce((sum, item) => sum + item.bookings, 0);

  return <div className="amenities-page">
    <div className="amenities-header"><div><span className="amenities-overline">FACILITY MANAGEMENT</span><h1>Amenities</h1><p>Facilities અને bookings નો database આધારિત overview.</p></div></div>
    <div className="amenity-stats-grid"><div className="amenity-stat-card"><div className="amenity-stat-icon">🏢</div><div><span>Total Amenities</span><strong>{amenities.length}</strong></div></div><div className="amenity-stat-card"><div className="amenity-stat-icon">✅</div><div><span>Available</span><strong>{available}</strong></div></div><div className="amenity-stat-card"><div className="amenity-stat-icon">🔧</div><div><span>Unavailable</span><strong>{unavailable}</strong></div></div><div className="amenity-stat-card"><div className="amenity-stat-icon">📅</div><div><span>Total Bookings</span><strong>{bookings}</strong></div></div></div>
    <div className="amenity-toolbar"><div className="amenity-search"><span>🔍</span><input placeholder="Search amenity, ID or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="amenity-filter"><option>All</option><option>Available</option><option>Unavailable</option></select></div>
    {error && <p className="page-error" role="alert">{error}</p>}
    <div className="amenities-card"><div className="amenities-card-header"><div><h2>Society Amenities</h2><p>Facility settings અને સંબંધિત booking count.</p></div><span className="record-count">{filteredAmenities.length} Records</span></div>
      <div className="amenities-table-wrapper"><table className="amenities-table"><thead><tr><th>Amenity ID</th><th>Amenity</th><th>Description</th><th>Location</th><th>Charge</th><th>Status</th><th>Bookings</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="7">Loading amenities…</td></tr> : filteredAmenities.length ? filteredAmenities.map((amenity) => <tr key={amenity.id}><td><span className="amenity-id">{amenity.id}</span></td><td><div className="amenity-name-cell"><div className="amenity-avatar">🏠</div><strong>{amenity.name}</strong></div></td><td><span className="amenity-description">{amenity.description}</span></td><td><span className="location-text">📍 {amenity.location}</span></td><td>₹{amenity.charge.toLocaleString("en-IN")} / {amenity.chargePeriod}</td><td><span className={`amenity-status ${amenity.status.toLowerCase().replaceAll(" ", "-")}`}>{amenity.status}</span></td><td><strong className="booking-count">{amenity.bookings}</strong>{amenity.openBookings > 0 && <small> · {amenity.openBookings} open</small>}</td></tr>) : <tr><td colSpan="7" className="no-amenities">No amenities found.</td></tr>}
      </tbody></table></div></div>
    <div className="amenity-note"><span>ℹ️</span><div><strong>Database connection</strong><p>Facility વિગતો facilities tableમાંથી અને booking counts facility_bookings tableમાંથી આવે છે.</p></div></div>
  </div>;
};
export default Amenities;
