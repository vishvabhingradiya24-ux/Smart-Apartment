import { useState } from "react";
import StaffLayout from "../../components/StaffLayout";
import { formatDateTime } from "../../utils/time";
import { staffApi, useStaffApi } from "../../utils/staffApi";

const FILTERS = ["All", "Open", "Acknowledged", "Closed"];

const SEVERITY_PILL = {
  Low: "sx-pill-green",
  Medium: "sx-pill-blue",
  High: "sx-pill-amber",
  Critical: "sx-pill-red"
};

const STATUS_PILL = {
  Open: "sx-pill-amber",
  Acknowledged: "sx-pill-blue",
  Closed: "sx-pill-green"
};

function StaffSupervisorIncidents() {
  const [filter, setFilter] = useState("Open");

  const { data, error, loading, reload } = useStaffApi(
    `/supervisor/incidents${filter === "All" ? "" : `?status=${filter}`}`
  );

  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const reports = data?.reports || [];

  const update = async (report, status) => {
    setBusyId(report.report_id);
    setMessage("");
    setActionError("");

    try {
      const result = await staffApi(`/supervisor/incidents/${report.report_id}`, {
        method: "PUT",
        body: { status }
      });

      setMessage(result.message);
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <StaffLayout
      badge="FACILITY SUPERVISOR"
      title="Incident Reports"
      subtitle="Incidents reported by Security and issues reported by technical staff."
      actions={
        <button type="button" className="sx-btn sx-btn-ghost" onClick={reload}>
          ↻ Refresh
        </button>
      }
    >
      <section className="controls-bar">
        <div className="filter-tabs">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              className={`filter-tab-btn ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="sx-card">
        {message && <p className="sx-alert sx-alert-success">{message}</p>}
        {(error || actionError) && <p className="sx-alert sx-alert-error">{error || actionError}</p>}

        {loading ? (
          <div className="sx-empty">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="sx-empty">
            <strong>No reports here</strong>
            Reports sent by staff will appear in this list.
          </div>
        ) : (
          <ul className="sx-list">
            {reports.map((report) => (
              <li key={report.report_id} className="sx-card" style={{ boxShadow: "none" }}>
                <div className="sx-card-head" style={{ marginBottom: 6 }}>
                  <div>
                    <h2>{report.title}</h2>
                    <p>
                      {report.report_type} by {[report.reporter_first_name, report.reporter_last_name].filter(Boolean).join(" ") || "Unknown"}
                      {report.reporter_department ? ` (${report.reporter_department})` : ""}
                    </p>
                  </div>

                  <div className="sx-actions">
                    <span className={`sx-pill ${SEVERITY_PILL[report.severity] || ""}`}>{report.severity}</span>
                    <span className={`sx-pill ${STATUS_PILL[report.status] || ""}`}>{report.status}</span>
                  </div>
                </div>

                <p style={{ margin: "0 0 8px", fontSize: 14, color: "#34505d" }}>{report.description}</p>

                <div className="sx-meta">
                  {report.location && <span>📍 {report.location}</span>}
                  <span>🕒 {formatDateTime(report.occurred_at)}</span>
                </div>

                {report.status !== "Closed" && (
                  <div className="sx-actions" style={{ marginTop: 12 }}>
                    {report.status === "Open" && (
                      <button
                        type="button"
                        className="sx-btn sx-btn-ghost sx-btn-small"
                        disabled={busyId === report.report_id}
                        onClick={() => update(report, "Acknowledged")}
                      >
                        Acknowledge
                      </button>
                    )}

                    <button
                      type="button"
                      className="sx-btn sx-btn-primary sx-btn-small"
                      disabled={busyId === report.report_id}
                      onClick={() => update(report, "Closed")}
                    >
                      Close report
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </StaffLayout>
  );
}

export default StaffSupervisorIncidents;
