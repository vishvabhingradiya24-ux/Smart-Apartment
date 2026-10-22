import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, ShieldAlert } from "lucide-react";
import "../../css/admin.css";

const API = "http://localhost:5000/api/admin/incident-reports";

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

const FILTERS = ["All", "Open", "Acknowledged", "Closed"];

const AdminIncidents = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("Open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const headers = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    "Content-Type": "application/json"
  });

  const fetchReports = useCallback(async (signal) => {
    try {
      const response = await fetch(API, { headers: headers(), signal });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to load incident reports.");

      setReports(data.reports || []);
      setError("");
    } catch (err) {
      if (err.name === "AbortError") return;

      setError(err.message || "Unable to load incident reports.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      await fetchReports(controller.signal);
    };

    load();

    return () => controller.abort();
  }, [fetchReports]);

  const update = async (report, status) => {
    setBusyId(report.report_id);
    setError("");

    try {
      const response = await fetch(`${API}/${report.report_id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ status })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to update the report.");

      await fetchReports();
    } catch (err) {
      setError(err.message || "Unable to update the report.");
    } finally {
      setBusyId(null);
    }
  };

  const visible = useMemo(
    () => reports.filter((report) => filter === "All" || report.status === filter),
    [reports, filter]
  );

  const count = (status) => reports.filter((report) => report.status === status).length;

  return (
    <div className="admin-records-page">
      <header className="admin-records-header">
        <div>
          <span className="admin-records-eyebrow">STAFF & SECURITY</span>
          <h1>Incident Reports</h1>
          <p>Incidents reported by Security and issues reported by technical staff.</p>
        </div>

        <div className="admin-records-header-actions">
          <button type="button" className="admin-records-refresh" onClick={() => { setLoading(true); fetchReports(); }} disabled={loading}>
            ↻ Refresh
          </button>
        </div>
      </header>

      <section className="admin-records-stats">
        <article>
          <span><ShieldAlert size={18} strokeWidth={1.8} aria-hidden="true" /></span>
          <div><small>Open</small><strong>{loading ? "—" : count("Open")}</strong></div>
        </article>
        <article>
          <span><Eye size={18} strokeWidth={1.8} aria-hidden="true" /></span>
          <div><small>Acknowledged</small><strong>{loading ? "—" : count("Acknowledged")}</strong></div>
        </article>
        <article>
          <span><CheckCircle2 size={18} strokeWidth={1.8} aria-hidden="true" /></span>
          <div><small>Closed</small><strong>{loading ? "—" : count("Closed")}</strong></div>
        </article>
        <article>
          <span><AlertTriangle size={18} strokeWidth={1.8} aria-hidden="true" /></span>
          <div><small>Critical / High, not closed</small><strong>{loading ? "—" : reports.filter((r) => r.status !== "Closed" && ["Critical", "High"].includes(r.severity)).length}</strong></div>
        </article>
      </section>

      <section className="admin-records-card">
        <div className="admin-records-card-header">
          <div>
            <h2>Reports</h2>
            <p>{visible.length} of {reports.length} reports</p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                className="admin-records-refresh"
                style={
                  filter === item
                    ? { background: "#157461", color: "#fff", border: "1px solid #157461" }
                    : { background: "#fff", color: "#157461", border: "1px solid #cfe5df" }
                }
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="admin-records-state">Loading incident reports...</div>
        ) : error ? (
          <div className="admin-records-state error">
            <strong>Something went wrong</strong>
            <p>{error}</p>
            <button type="button" onClick={() => { setLoading(true); fetchReports(); }}>Try again</button>
          </div>
        ) : visible.length === 0 ? (
          <div className="admin-records-state">No reports in this list.</div>
        ) : (
          <div className="admin-records-table-wrap">
            <table className="admin-records-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Reported by</th>
                  <th>Location / time</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {visible.map((report) => (
                  <tr key={report.report_id}>
                    <td>
                      <strong>{report.title}</strong>
                      <small>{report.report_type} · {report.description}</small>
                    </td>

                    <td>
                      {[report.reporter_first_name, report.reporter_last_name].filter(Boolean).join(" ") || "Unknown"}
                      <small>{report.reporter_department || ""}</small>
                    </td>

                    <td>
                      {report.location || "—"}
                      <small>{formatDateTime(report.occurred_at)}</small>
                    </td>

                    <td>{report.severity}</td>
                    <td>{report.status}</td>

                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {report.status === "Open" && (
                          <button type="button" className="admin-records-refresh" disabled={busyId === report.report_id} onClick={() => update(report, "Acknowledged")}>
                            Acknowledge
                          </button>
                        )}

                        {report.status !== "Closed" && (
                          <button type="button" className="admin-records-refresh" disabled={busyId === report.report_id} onClick={() => update(report, "Closed")}>
                            Close
                          </button>
                        )}
                      </div>
                    </td>
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

export default AdminIncidents;
