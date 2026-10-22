import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck, Check, Clock3, Search } from "lucide-react";
import "../../css/amenities.css";

const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const formatTime = (value) => value ? String(value).slice(0, 5) : "";
const formatDateTime = (value) => value ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const bookingState = (booking) => {
  if (booking.status === "Approved") return booking.payment_status === "Paid" || !booking.payment_status ? "Confirmed" : "Awaiting payment";
  return booking.status;
};

const FacilityBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [paymentWindowDays, setPaymentWindowDays] = useState(2);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const token = sessionStorage.getItem("token");

  const request = useCallback((url, options = {}) => fetch(`http://localhost:5000${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  }), [token]);

  const load = useCallback(async () => {
    try {
      const response = await request("/api/admin/facility-bookings");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Bookings could not be loaded");
      setBookings(data.bookings || []);
      setPaymentWindowDays(data.paymentWindowDays || 2);
      setError("");
    } catch (err) {
      setError(err.message || "Bookings could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    const run = async () => load();
    run();
  }, [load]);

  const review = async (booking, action) => {
    let remarks = "";
    if (action === "reject") {
      remarks = window.prompt("Reason for rejection (optional):");
      if (remarks === null) return;
    } else if (!window.confirm(`Approve this booking? The resident will have ${paymentWindowDays} days to pay ₹${Number(booking.total_amount).toLocaleString("en-IN")}.`)) {
      return;
    }
    setBusyId(booking.booking_id);
    setError("");
    setMessage("");
    try {
      const response = await request(`/api/admin/facility-bookings/${booking.booking_id}/${action}`, {
        method: "PUT",
        body: JSON.stringify({ remarks }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Action failed");
      setMessage(data.message);
      await load();
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => bookings.filter((booking) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = [booking.facility_name, booking.first_name, booking.last_name, booking.flat_number, booking.booking_id]
      .some((value) => String(value || "").toLowerCase().includes(search));
    return matchesSearch && (statusFilter === "All" || bookingState(booking) === statusFilter);
  }), [bookings, searchTerm, statusFilter]);

  const count = (state) => bookings.filter((booking) => bookingState(booking) === state).length;

  return <div className="amenities-page">
    <div className="amenities-header"><div><span className="amenities-overline">FACILITY MANAGEMENT</span><h1>Facility Bookings</h1><p>Approve resident booking requests. After approval the resident has {paymentWindowDays} days to pay, otherwise the booking is cancelled.</p></div></div>

    <div className="amenity-stats-grid">
      <div className="amenity-stat-card"><div className="amenity-stat-icon"><Clock3 size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><span>Pending approval</span><strong>{count("Pending")}</strong></div></div>
      <div className="amenity-stat-card"><div className="amenity-stat-icon"><Clock3 size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><span>Awaiting payment</span><strong>{count("Awaiting payment")}</strong></div></div>
      <div className="amenity-stat-card"><div className="amenity-stat-icon"><Check size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><span>Confirmed</span><strong>{count("Confirmed")}</strong></div></div>
      <div className="amenity-stat-card"><div className="amenity-stat-icon"><CalendarCheck size={18} strokeWidth={1.8} aria-hidden="true" /></div><div><span>Total bookings</span><strong>{bookings.length}</strong></div></div>
    </div>

    {error && <p className="page-error" role="alert">{error}</p>}
    {message && <p className="page-success" role="status">{message}</p>}

    <div className="amenity-toolbar">
      <div className="amenity-search"><Search size={16} aria-hidden="true" /><input placeholder="Search amenity, resident or flat..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div>
      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="amenity-filter">
        {["All", "Pending", "Awaiting payment", "Confirmed", "Rejected", "Cancelled"].map((state) => <option key={state}>{state}</option>)}
      </select>
    </div>

    <div className="amenities-card"><div className="amenities-card-header"><div><h2>Booking Requests</h2><p>Pending requests are listed first.</p></div><span className="record-count">{filtered.length} Records</span></div>
      <div className="amenities-table-wrapper"><table className="amenities-table"><thead><tr><th>ID</th><th>Resident</th><th>Amenity</th><th>Date &amp; Time</th><th>Add-ons</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="8">Loading bookings…</td></tr> : filtered.length ? filtered.map((booking) => {
          const state = bookingState(booking);
          return <tr key={booking.booking_id}>
            <td><span className="amenity-id">BK{booking.booking_id}</span></td>
            <td><strong>{booking.first_name} {booking.last_name}</strong><br /><small>Flat {booking.block_wing || ""}-{booking.flat_number || "—"}</small></td>
            <td><strong>{booking.facility_name}</strong><br /><small>{booking.number_of_people} people · {booking.purpose}</small></td>
            <td>{formatDate(booking.booking_date)}<br /><small>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</small></td>
            <td>{booking.addons?.length ? booking.addons.map((addon) => `${addon.addon_name} × ${addon.quantity}`).join(", ") : "—"}</td>
            <td>₹{Number(booking.total_amount || 0).toLocaleString("en-IN")}</td>
            <td><span className={`amenity-status ${state === "Confirmed" ? "available" : state === "Pending" || state === "Awaiting payment" ? "maintenance" : "unavailable"}`}>{state}</span>
              {state === "Awaiting payment" && <><br /><small>Pay by {formatDateTime(booking.payment_due_at)}</small></>}
              {booking.admin_remarks && <><br /><small>{booking.admin_remarks}</small></>}</td>
            <td>{booking.status === "Pending" ? <>
              <button className="admin-row-action" type="button" disabled={busyId === booking.booking_id} onClick={() => review(booking, "approve")}>Approve</button>{" "}
              <button className="admin-row-action" type="button" disabled={busyId === booking.booking_id} onClick={() => review(booking, "reject")}>Reject</button>
            </> : "—"}</td>
          </tr>;
        }) : <tr><td colSpan="8" className="no-amenities">No bookings found.</td></tr>}
      </tbody></table></div>
    </div>
  </div>;
};

export default FacilityBookings;
