import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, PackagePlus, Search } from "lucide-react";
import AdminFormModal from "./AdminFormModal";
import "../../css/admin.css";
import "../../css/admin_assets.css";

const emptyForm = {
  asset_name: "",
  category: "",
  quantity: "",
  condition_status: "Good",
  location: "",
  status: "Available",
};

const assetCategories = ["Electrical", "Plumbing", "Cleaning", "Maintenance", "Security", "Gardening", "Other"];
const assetLocations = ["Store Room", "Maintenance Room", "Security Office", "Clubhouse", "Gym", "Garden", "Parking", "Other"];

const AdminAssets = () => {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const fetchAssets = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin session expired. Please log in again.");

      const response = await fetch("http://localhost:5000/api/admin/assets", {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to load inventory.");
      }
      setAssets(data.assets || []);
    } catch (fetchError) {
      if (fetchError.name === "AbortError") return;
      setError(fetchError.message || "Unable to load inventory.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadAssets = async () => {
      await fetchAssets(controller.signal);
    };
    loadAssets();
    return () => controller.abort();
  }, [fetchAssets]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setSuccessMessage("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin session expired. Please log in again.");

      const response = await fetch("http://localhost:5000/api/admin/assets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to add asset.");
      }

      setAssets((current) =>
        [...current, data.asset].sort((left, right) =>
          left.asset_name.localeCompare(right.asset_name)
        )
      );
      setFormData(emptyForm);
      setSuccessMessage(data.message || "Asset added successfully.");
      setShowForm(false);
    } catch (submitError) {
      setFormError(submitError.message || "Unable to add asset.");
    } finally {
      setSaving(false);
    }
  };

  const filteredAssets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return assets;
    return assets.filter((asset) => [
      asset.asset_id,
      asset.asset_name,
      asset.category,
      asset.condition_status,
      asset.location,
      asset.status,
    ].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [assets, searchTerm]);

  const totalQuantity = assets.reduce((total, asset) => total + Number(asset.quantity || 0), 0);
  const totalAvailable = assets.reduce((total, asset) => total + Number(asset.available || 0), 0);
  const maintenanceCount = assets.filter((asset) => asset.status === "Maintenance").length;

  return (
    <div className="admin-records-page">
      <header className="admin-records-header">
        <div>
          <span className="admin-records-eyebrow">INVENTORY MANAGEMENT</span>
          <h1>Assets &amp; Inventory</h1>
          <p>Add and manage the inventory available to staff.</p>
        </div>
        <button type="button" className="admin-records-secondary" onClick={() => { setFormError(""); setSuccessMessage(""); setShowForm(true); }}>
          <PackagePlus size={16} aria-hidden="true" /> Add Asset
        </button>
      </header>

      {successMessage && <p className="admin-assets-success" role="status">{successMessage}</p>}

      <section className="admin-records-stats">
        <article>
          <span><Boxes size={18} aria-hidden="true" /></span>
          <div><small>Asset types</small><strong>{loading ? "—" : assets.length}</strong></div>
        </article>
        <article>
          <span>▦</span>
          <div><small>Total quantity</small><strong>{loading ? "—" : totalQuantity}</strong></div>
        </article>
        <article>
          <span>✓</span>
          <div><small>Available</small><strong>{loading ? "—" : totalAvailable}</strong></div>
        </article>
        <article>
          <span>⚙</span>
          <div><small>In maintenance</small><strong>{loading ? "—" : maintenanceCount}</strong></div>
        </article>
      </section>

      {showForm && (
        <AdminFormModal title="Add an asset" onClose={() => setShowForm(false)} saving={saving}>
          <form className="admin-assets-form" onSubmit={handleSubmit}>
          <label>
            Asset name
            <input
              value={formData.asset_name}
              onChange={(event) => setFormData({ ...formData, asset_name: event.target.value })}
              maxLength={150}
              placeholder="e.g. Ladder"
              required
            />
          </label>
          <label>
            Category
            <select
              required
              value={formData.category}
              onChange={(event) => setFormData({ ...formData, category: event.target.value })}
            >
              <option value="" disabled>Select category</option>
              {assetCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="0"
              step="1"
              value={formData.quantity}
              onChange={(event) => setFormData({ ...formData, quantity: event.target.value })}
              required
            />
          </label>
          <label>
            Condition
            <select
              value={formData.condition_status}
              onChange={(event) => setFormData({ ...formData, condition_status: event.target.value })}
            >
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
          </label>
          <label>
            Location
            <select
              value={formData.location}
              onChange={(event) => setFormData({ ...formData, location: event.target.value })}
            >
              <option value="">Select location</option>
              {assetLocations.map((location) => <option key={location} value={location}>{location}</option>)}
            </select>
          </label>
          <label>
            Status
            <select
              value={formData.status}
              onChange={(event) => setFormData({ ...formData, status: event.target.value })}
            >
              <option>Available</option>
              <option>In Use</option>
              <option>Maintenance</option>
            </select>
          </label>
          <div className="admin-assets-form-actions">
            {formError && <p role="alert">{formError}</p>}
            <button type="button" className="admin-assets-cancel" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
            <button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Add asset"}
            </button>
          </div>
          </form>
        </AdminFormModal>
      )}

      <section className="admin-records-card">
        <div className="admin-records-card-header">
          <div>
            <h2>Inventory</h2>
            <p>{filteredAssets.length} of {assets.length} asset types</p>
          </div>
          <label className="admin-records-search">
            <Search size={16} aria-hidden="true" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search assets"
            />
          </label>
        </div>

        {loading ? (
          <div className="admin-records-state">Loading inventory...</div>
        ) : error ? (
          <div className="admin-records-state error">
            <strong>Unable to load inventory</strong>
            <p>{error}</p>
            <button type="button" onClick={() => fetchAssets()}>Try again</button>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="admin-records-state">
            {assets.length === 0
              ? "No assets have been added yet. Use Add Asset to add inventory."
              : "No assets match this search."}
          </div>
        ) : (
          <div className="admin-records-table-wrap">
            <table className="admin-records-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Assigned</th>
                  <th>Available</th>
                  <th>Condition</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.asset_id}>
                    <td><strong>{asset.asset_name}</strong><small>#{asset.asset_id}</small></td>
                    <td>{asset.category}</td>
                    <td>{asset.quantity}</td>
                    <td>{asset.assigned}</td>
                    <td>{asset.available}</td>
                    <td>{asset.condition_status}</td>
                    <td>{asset.location || "—"}</td>
                    <td>{asset.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminAssets;
