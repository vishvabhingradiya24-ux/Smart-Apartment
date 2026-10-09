import { useCallback, useEffect, useMemo, useState } from "react";
import "../../css/admin.css";
import "../../css/admin_residents.css";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const Residents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);

  const fetchResidents = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5000/api/admin/residents", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load residents.");
      setResidents(data.residents || []);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to load residents.");
      setResidents([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchResidents(controller.signal);
    return () => controller.abort();
  }, [fetchResidents]);

  const filteredResidents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return residents;
    return residents.filter((resident) => [
      resident.first_name, resident.last_name, resident.email, resident.phone,
      resident.block_wing, resident.flat_number, resident.id,
    ].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [residents, searchTerm]);

  const occupiedFlats = new Set(residents.map((resident) =>
    `${resident.block_wing || ""}-${resident.flat_number || ""}`
  ).filter((flat) => flat !== "-"));
  const now = new Date();
  const joinedThisMonth = residents.filter((resident) => {
    const date = new Date(resident.created_at);
    return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

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

      <section className="admin-residents-hero">
        <div className="admin-residents-hero-copy">
          <span>COMMUNITY DIRECTORY</span>
          <h2>Know your community, resident by resident.</h2>
          <p>Find a household quickly, review their flat details and open contact information when you need it.</p>
          <div className="admin-residents-hero-prompt"><span>⌕</span> Search the directory or select a resident to see their profile.</div>
        </div>
        <div className="admin-residents-hero-art" aria-hidden="true">
          <div className="resident-building-mark">⌂</div>
          <div className="resident-building-caption"><strong>{loading ? "—" : residents.length}</strong><span>registered<br />residents</span></div>
          <i></i><b></b>
        </div>
      </section>

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
          <div className="admin-records-state error" role="alert">
            <span className="admin-records-error-icon" aria-hidden="true">!</span>
            <strong>Residents load થઈ શક્યા નહીં</strong>
            <p>{error === "Admin access required" ? "Admin તરીકે ફરી login કરો, પછી Residents page ખોલો." : error}</p>
            <button type="button" onClick={() => fetchResidents()}>↻ ફરી પ્રયાસ કરો</button>
          </div>
        ) : filteredResidents.length === 0 ? <div className="admin-records-state">No residents match this search.</div> : (
          <div className="admin-records-table-wrap">
            <table className="admin-records-table">
              <thead><tr><th>Resident</th><th>Flat</th><th>Phone</th><th>Registered</th><th>Profile</th></tr></thead>
              <tbody>{filteredResidents.map((resident) => {
                const name = `${resident.first_name || ""} ${resident.last_name || ""}`.trim() || "Resident";
                return <tr key={resident.id}>
                  <td><div className="admin-records-person"><span>{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><small>{resident.email || "No email on file"}</small></div></div></td>
                  <td><span className="admin-records-badge">{[resident.block_wing, resident.flat_number].filter(Boolean).join(" - ") || "Not assigned"}</span></td>
                  <td>{resident.phone || "—"}</td>
                  <td>{formatDate(resident.created_at)}</td>
                  <td><button type="button" className="admin-resident-open" onClick={() => setSelectedResident(resident)} aria-label={`View ${name}'s details`}>View profile <span>→</span></button></td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        )}
      </section>

      {selectedResident && (() => {
        const name = `${selectedResident.first_name || ""} ${selectedResident.last_name || ""}`.trim() || "Resident";
        const flat = [selectedResident.block_wing, selectedResident.flat_number].filter(Boolean).join(" · ") || "Not assigned";
        return (
          <div className="admin-resident-drawer-backdrop" onClick={() => setSelectedResident(null)}>
            <aside className="admin-resident-drawer" role="dialog" aria-modal="true" aria-labelledby="resident-drawer-title" onClick={(event) => event.stopPropagation()}>
              <div className="admin-resident-drawer-top"><span>RESIDENT PROFILE</span><button type="button" onClick={() => setSelectedResident(null)} aria-label="Close resident profile">×</button></div>
              <div className="admin-resident-drawer-profile"><span>{name.charAt(0).toUpperCase()}</span><div><h2 id="resident-drawer-title">{name}</h2><p>{flat}</p></div></div>
              <div className="admin-resident-drawer-details">
                <div><small>EMAIL ADDRESS</small><strong>{selectedResident.email || "Not provided"}</strong></div>
                <div><small>PHONE NUMBER</small><strong>{selectedResident.phone || "Not provided"}</strong></div>
                <div><small>REGISTERED ON</small><strong>{formatDate(selectedResident.created_at)}</strong></div>
                <div><small>RESIDENT ID</small><strong>#{selectedResident.id}</strong></div>
              </div>
              <div className="admin-resident-drawer-actions">
                {selectedResident.email && <a href={`mailto:${selectedResident.email}`}>✉ Email resident</a>}
                {selectedResident.phone && <a href={`tel:${selectedResident.phone}`}>☎ Call resident</a>}
                {!selectedResident.email && !selectedResident.phone && <p>No contact method is available for this resident.</p>}
              </div>
            </aside>
          </div>
        );
      })()}
    </div>
  );
};

export default Residents;
