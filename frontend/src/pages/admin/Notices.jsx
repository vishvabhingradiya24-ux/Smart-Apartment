import { useCallback, useEffect, useMemo, useState } from "react";
import "../../css/notices.css";

const blankForm = { title: "", description: "", notice_type: "General", publish_date: new Date().toISOString().slice(0, 10), expiry_date: "", status: "Active" };
const Notices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const request = (url, options = {}) => fetch(`http://localhost:5000${url}`, { ...options, headers: { Authorization: `Bearer ${token}`, ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers } });

  const loadNotices = useCallback(async () => {
    try {
      const response = await request("/api/notices/");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Notices load થઈ શક્યા નહીં");
      setNotices((data.data || []).map((row) => ({ ...row, id: row.notice_id, category: row.notice_type || "General", status: row.status === "Active" ? "Published" : "Draft", publishDate: row.publish_date ? new Date(row.publish_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—", createdBy: row.posted_by_name || `Admin #${row.posted_by}` })));
      setError("");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadNotices(); }, [loadNotices]);

  const filteredNotices = useMemo(() => notices.filter((notice) => {
    const search = searchTerm.toLowerCase();
    return [notice.title, String(notice.id), notice.description].some((value) => value.toLowerCase().includes(search)) &&
      (categoryFilter === "All" || notice.category === categoryFilter) && (statusFilter === "All" || notice.status === statusFilter);
  }), [notices, searchTerm, categoryFilter, statusFilter]);
  const openCreate = () => { setEditingId(null); setForm(blankForm); setShowForm(true); };
  const openEdit = (notice) => { setEditingId(notice.id); setForm({ title: notice.title, description: notice.description, notice_type: notice.notice_type || "General", publish_date: String(notice.publish_date || "").slice(0, 10), expiry_date: notice.expiry_date ? String(notice.expiry_date).slice(0, 10) : "", status: notice.status === "Active" ? "Active" : "Inactive" }); setShowForm(true); };
  const submitForm = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await request(editingId ? `/api/notices/${editingId}` : "/api/notices/", { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Notice save થઈ શકી નહીં");
      setShowForm(false); await loadNotices();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };
  const toggleStatus = async (notice) => {
    const payload = { title: notice.title, description: notice.description, notice_type: notice.notice_type, publish_date: notice.publish_date, expiry_date: notice.expiry_date, status: notice.status === "Published" ? "Inactive" : "Active" };
    try { const response = await request(`/api/notices/${notice.id}`, { method: "PUT", body: JSON.stringify(payload) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Notice update થઈ શકી નહીં"); await loadNotices(); }
    catch (err) { setError(err.message); }
  };
  const deleteNotice = async (notice) => {
    if (!window.confirm(`“${notice.title}” notice delete કરવી છે?`)) return;
    try { const response = await request(`/api/notices/${notice.id}`, { method: "DELETE" }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Notice delete થઈ શકી નહીં"); await loadNotices(); }
    catch (err) { setError(err.message); }
  };
  const published = notices.filter((notice) => notice.status === "Published").length;
  const drafts = notices.length - published;
  const categories = [...new Set(notices.map((notice) => notice.category))];

  return <div className="notices-page">
    <div className="notices-header"><div><span className="notices-overline">COMMUNICATION MANAGEMENT</span><h1>Notices</h1><p>Create and manage society announcements stored in MySQL.</p></div><button className="add-notice-btn" onClick={openCreate}><span>＋</span> Create Notice</button></div>
    <div className="notice-stats-grid"><div className="notice-stat-card"><div className="notice-stat-icon">📢</div><div><span>Total Notices</span><strong>{notices.length}</strong></div></div><div className="notice-stat-card"><div className="notice-stat-icon">✅</div><div><span>Published</span><strong>{published}</strong></div></div><div className="notice-stat-card"><div className="notice-stat-icon">📝</div><div><span>Drafts</span><strong>{drafts}</strong></div></div><div className="notice-stat-card"><div className="notice-stat-icon">📂</div><div><span>Categories</span><strong>{categories.length}</strong></div></div></div>
    {showForm && <form className="notice-form" onSubmit={submitForm}><h2>{editingId ? "Edit Notice" : "Create Notice"}</h2><div className="notice-form-grid"><label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Category<input required value={form.notice_type} onChange={(e) => setForm({ ...form, notice_type: e.target.value })} /></label><label>Publish date<input type="date" required value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} /></label><label>Expiry date<input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></label><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="Active">Published</option><option value="Inactive">Draft</option></select></label><label className="notice-description-field">Description<textarea required rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label></div><div className="notice-form-actions"><button type="button" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Notice"}</button></div></form>}
    {error && <p className="notice-error" role="alert">{error}</p>}
    <div className="notice-toolbar"><div className="notice-search"><span>🔍</span><input placeholder="Search notice, ID or description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><select className="notice-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="All">All Categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select><select className="notice-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="All">All Status</option><option value="Published">Published</option><option value="Draft">Draft</option></select></div>
    <div className="notices-card"><div className="notices-card-header"><div><h2>Society Notices</h2><p>Database notices and their publishing status.</p></div><span className="notice-record-count">{filteredNotices.length} Records</span></div><div className="notices-table-wrapper"><table className="notices-table"><thead><tr><th>Notice ID</th><th>Notice</th><th>Category</th><th>Publish Date</th><th>Created By</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {loading ? <tr><td colSpan="7">Loading notices…</td></tr> : filteredNotices.length ? filteredNotices.map((notice) => <tr key={notice.id}><td><span className="notice-id">NT{notice.id}</span></td><td><div className="notice-title-cell"><div className="notice-avatar">📢</div><div><strong>{notice.title}</strong><p>{notice.description}</p></div></div></td><td><span className="notice-category">{notice.category}</span></td><td><span className="notice-date">{notice.publishDate}</span></td><td><span className="created-by">{notice.createdBy}</span></td><td><span className={`notice-status ${notice.status.toLowerCase()}`}>{notice.status}</span></td><td><div className="notice-actions"><button className="notice-action-btn edit" onClick={() => openEdit(notice)} title="Edit">✏️</button><button className="notice-action-btn publish" onClick={() => toggleStatus(notice)} title={notice.status === "Published" ? "Save as draft" : "Publish"}>{notice.status === "Published" ? "📝" : "📢"}</button><button className="notice-action-btn delete" onClick={() => deleteNotice(notice)} title="Delete">🗑️</button></div></td></tr>) : <tr><td colSpan="7" className="no-notices">No notices found.</td></tr>}
    </tbody></table></div></div>
  </div>;
};
export default Notices;
