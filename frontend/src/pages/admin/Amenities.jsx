import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, Check, Search, Wrench } from "lucide-react";
import AdminFormModal from "./AdminFormModal";
import "../../css/amenities.css";

const AMENITY_NAMES = ["Swimming Pool", "Fitness Gym", "Community Hall", "Garden & Kids Play Area", "Badminton Court", "Rooftop Terrace"];
const CHARGE_PERIODS = ["Per Day", "Per Hour", "Per Month"];
const STATUSES = ["Available", "Booked", "Maintenance"];
const emptyFacility = { facility_name: "", description: "", location: "", base_charge: "0", charge_period: "Per Day", availability_status: "Available" };
const emptyAddon = { addon_name: "", description: "", charge_type: "Fixed", price: "0", status: "Available" };

const Amenities = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [amenities, setAmenities] = useState([]);
  const [addons, setAddons] = useState([]);
  const [formType, setFormType] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyFacility);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const token = sessionStorage.getItem("token");

  const request = useCallback((url, options = {}) => fetch(`http://localhost:5000${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  }), [token]);

  const loadAmenities = useCallback(async () => {
    try {
      const response = await request("/api/admin/amenities");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Amenities could not be loaded");
      setAmenities(data.amenities || []);
      setAddons(data.addons || []);
      setError("");
    } catch (err) {
      setError(err.message || "Amenities could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    const load = async () => loadAmenities();
    load();
  }, [loadAmenities]);

  const openCreateFacility = () => {
    setFormType("facility");
    setEditingId(null);
    setForm({ ...emptyFacility });
    setError("");
  };

  const openEditFacility = (facility) => {
    setFormType("facility");
    setEditingId(facility.facility_id);
    setForm({
      facility_name: AMENITY_NAMES.includes(facility.facility_name) ? facility.facility_name : "",
      description: facility.description || "",
      location: facility.location || "",
      base_charge: String(facility.base_charge ?? 0),
      charge_period: CHARGE_PERIODS.includes(facility.charge_period) ? facility.charge_period : "Per Day",
      availability_status: STATUSES.includes(facility.availability_status) ? facility.availability_status : "Available",
    });
    setError("");
  };

  const openCreateAddon = () => {
    setFormType("addon");
    setEditingId(null);
    setForm({ ...emptyAddon });
    setError("");
  };

  const openEditAddon = (addon) => {
    setFormType("addon");
    setEditingId(addon.addon_id);
    setForm({
      addon_name: addon.addon_name || "",
      description: addon.description || "",
      charge_type: addon.charge_type || "Fixed",
      price: String(addon.price ?? 0),
      status: addon.status || "Available",
    });
    setError("");
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    setError("");
    const isFacility = formType === "facility";
    const name = (isFacility ? form.facility_name : form.addon_name).trim();
    const amount = isFacility ? form.base_charge : form.price;
    if (!name) {
      setError(`${isFacility ? "Select an amenity" : "Add-on name is required."}${isFacility ? "." : ""}`);
      return;
    }
    if (name.length > 150) {
      setError("Name must be 150 characters or fewer.");
      return;
    }
    if (!/^[0-9]{1,8}(?:\.[0-9]{1,2})?$/.test(String(amount)) || Number(amount) < 0) {
      setError("Enter a valid amount with up to 8 digits and 2 decimal places.");
      return;
    }
    if (!isFacility && !["Fixed", "Per Item", "Per Person"].includes(form.charge_type)) {
      setError("Select a valid add-on charge type.");
      return;
    }
    setSaving(true);
    const endpoint = isFacility
      ? (editingId ? `/api/admin/amenities/${editingId}` : "/api/admin/amenities")
      : (editingId ? `/api/admin/amenities/addons/${editingId}` : "/api/admin/amenities/addons");
    try {
      const response = await request(endpoint, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          ...(isFacility ? { facility_name: name, base_charge: amount } : { addon_name: name, price: amount }),
          description: form.description.trim(),
          ...(isFacility ? { location: form.location.trim() } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Amenity could not be saved");
      setFormType(null);
      await loadAmenities();
    } catch (err) {
      setError(err.message || "Amenity could not be saved");
    } finally {
      setSaving(false);
    }
  };

  const filteredAmenities = useMemo(() => amenities.filter((amenity) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = [
      amenity.facility_name,
      amenity.facility_id,
      amenity.description,
    ].some((value) => String(value || "").toLowerCase().includes(search));
    const matchesStatus = statusFilter === "All" || (
      statusFilter === "Available"
        ? amenity.availability_status === "Available"
        : amenity.availability_status !== "Available"
    );
    return matchesSearch && matchesStatus;
  }), [amenities, searchTerm, statusFilter]);

  const available = amenities.filter((item) => item.availability_status === "Available").length;
  const unavailable = amenities.length - available;
  const bookingCount = amenities.reduce((sum, item) => sum + Number(item.total_bookings || 0), 0);
  const isFacilityForm = formType === "facility";

  return <div className="amenities-page">
    <div className="amenities-header"><div><span className="amenities-overline">FACILITY MANAGEMENT</span><h1>Amenities</h1><p>Manage facilities and optional booking add-ons stored in MySQL.</p></div>
      <div className="amenity-header-actions">
        <button className="add-amenity-btn" type="button" onClick={openCreateFacility}><span>＋</span> Add Amenity</button>
        <button className="add-amenity-btn secondary" type="button" onClick={openCreateAddon}><span>＋</span> Add Add-on</button>
      </div>
    </div>

    <div className="amenity-stats-grid">
      <div className="amenity-stat-card"><div className="amenity-stat-icon"><Building2 size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><span>Total Amenities</span><strong>{amenities.length}</strong></div></div>
      <div className="amenity-stat-card"><div className="amenity-stat-icon"><Check size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><span>Available</span><strong>{available}</strong></div></div>
      <div className="amenity-stat-card"><div className="amenity-stat-icon"><Wrench size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><span>Unavailable</span><strong>{unavailable}</strong></div></div>
      <div className="amenity-stat-card"><div className="amenity-stat-icon"><CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><span>Total Bookings</span><strong>{bookingCount}</strong></div></div>
    </div>

    {formType && <AdminFormModal title={`${editingId ? "Edit" : "Add"} ${isFacilityForm ? "Amenity" : "Booking Add-on"}`} onClose={() => setFormType(null)} saving={saving}>
      <form className="admin-data-form amenity-admin-form" onSubmit={saveRecord}>
      <div className="admin-data-form-grid">
        {isFacilityForm ? <label>Amenity name
          <select required value={form.facility_name} onChange={(event) => setForm({ ...form, facility_name: event.target.value })}>
            <option value="">Select amenity</option>
            {AMENITY_NAMES.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label> : <label>Add-on name
          <input required maxLength="150" value={form.addon_name} onChange={(event) => setForm({ ...form, addon_name: event.target.value })} />
        </label>}
        <label>{isFacilityForm ? "Amenity description" : "Description"}<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        {isFacilityForm ? <>
          <label>Charge per<select value={form.charge_period} onChange={(event) => setForm({ ...form, charge_period: event.target.value })}>{CHARGE_PERIODS.map((p) => <option key={p}>{p}</option>)}</select></label>
          <label>Charges (₹)<input required min="0" max="99999999.99" step="0.01" type="number" value={form.base_charge} onChange={(event) => setForm({ ...form, base_charge: event.target.value })} /></label>
          <label>Status<select value={form.availability_status} onChange={(event) => setForm({ ...form, availability_status: event.target.value })}>{STATUSES.map((st) => <option key={st}>{st}</option>)}</select>{form.availability_status === "Maintenance" && <small>Temporarily unavailable while repair or service work is in progress.</small>}</label>
        </> : <>
          <label>Charge type<select value={form.charge_type} onChange={(event) => setForm({ ...form, charge_type: event.target.value })}><option>Fixed</option><option>Per Item</option><option>Per Person</option></select></label>
          <label>Price (₹)<input required min="0" max="99999999.99" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
          <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Available</option><option>Unavailable</option></select></label>
        </>}
      </div>
      {error && <p className="page-error" role="alert">{error}</p>}
      <div className="admin-data-form-actions"><button type="button" onClick={() => setFormType(null)}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button></div>
      </form>
    </AdminFormModal>}

    {error && !formType && <p className="page-error" role="alert">{error}</p>}

    <div className="amenity-toolbar">
      <div className="amenity-search"><Search size={16} aria-hidden="true" /><input placeholder="Search amenity or ID..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div>
      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="amenity-filter"><option>All</option><option>Available</option><option>Unavailable</option></select>
    </div>

    <div className="amenities-card"><div className="amenities-card-header"><div><h2>Society Amenities</h2><p>Bookings shows the number of resident bookings; 0 means none have been made.</p></div><span className="record-count">{filteredAmenities.length} Records</span></div>
      <div className="amenities-table-wrapper"><table className="amenities-table"><thead><tr><th>Amenity ID</th><th>Amenity</th><th>Description</th><th>Charge</th><th>Status</th><th>Bookings</th><th>Actions</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="7">Loading amenities…</td></tr> : filteredAmenities.length ? filteredAmenities.map((amenity) => <tr key={amenity.facility_id}>
          <td><span className="amenity-id">AM{amenity.facility_id}</span></td>
          <td><div className="amenity-name-cell"><div className="amenity-avatar">🏠</div><strong>{amenity.facility_name}</strong></div></td>
          <td><span className="amenity-description">{amenity.description || "—"}</span></td>
                    <td>₹{Number(amenity.base_charge || 0).toLocaleString("en-IN")} / {amenity.charge_period}</td>
          <td><span className={`amenity-status ${amenity.availability_status.toLowerCase()}`}>{amenity.availability_status}</span></td>
          <td><strong className="booking-count">{Number(amenity.total_bookings || 0)}</strong>{Number(amenity.open_bookings || 0) > 0 && <small> · {Number(amenity.open_bookings)} open</small>}</td>
          <td><button className="admin-row-action" type="button" onClick={() => openEditFacility(amenity)}>Edit</button></td>
        </tr>) : <tr><td colSpan="7" className="no-amenities">{error ? "Amenities could not be loaded." : "No amenities found."}</td></tr>}
      </tbody></table></div>
    </div>

    <div className="amenities-card addon-admin-card"><div className="amenities-card-header"><div><h2>Facility Booking Add-ons</h2><p>Optional items available to residents when booking a facility.</p></div><span className="record-count">{addons.length} Records</span></div>
      <div className="amenities-table-wrapper"><table className="amenities-table"><thead><tr><th>Add-on ID</th><th>Add-on</th><th>Description</th><th>Charge Type</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="7">Loading add-ons…</td></tr> : addons.length ? addons.map((addon) => <tr key={addon.addon_id}>
          <td><span className="amenity-id">ADD{addon.addon_id}</span></td><td><strong>{addon.addon_name}</strong></td><td>{addon.description || "—"}</td><td>{addon.charge_type}</td>
          <td>₹{Number(addon.price || 0).toLocaleString("en-IN")}</td><td><span className={`amenity-status ${addon.status.toLowerCase()}`}>{addon.status}</span></td>
          <td><button className="admin-row-action" type="button" onClick={() => openEditAddon(addon)}>Edit</button></td>
        </tr>) : <tr><td colSpan="7">No facility add-ons found.</td></tr>}
      </tbody></table></div>
    </div>
  </div>;
};

export default Amenities;
