import { useEffect, useState } from "react";
import StaffLayout from "../../components/StaffLayout";
import { useStaffDepartment } from "../../hooks/useStaffDepartment";
import { formatDateTime } from "../../utils/time";

const API = "http://localhost:5000/api/staff/reports";

const SEVERITIES = ["Low", "Medium", "High", "Critical"];

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

const authHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  "Content-Type": "application/json"
});

// Value for <input type="datetime-local"> in the user's own time zone.
const nowForInput = () => {
  const now = new Date();

  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  return now.toISOString().slice(0, 16);
};

const blankForm = () => ({
  title: "",
  description: "",
  location: "",
  occurred_at: nowForInput(),
  severity: "Medium"
});

// One page for two jobs: Security files incident reports, technical staff
// report unsafe or complex issues to the supervisor.
function StaffReportIssue() {
  const department = useStaffDepartment();
  const isSecurity = department === "Security";

  const [form, setForm] = useState(blankForm);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/mine`, { headers: authHeaders() })
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => {
        if (cancelled) return;

        if (!ok) throw new Error(data.message || "Unable to load your reports.");

        setReports(data.reports || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Unable to load your reports.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Please add a title and describe what happened.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          ...form,
          occurred_at: new Date(form.occurred_at).toISOString()
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to send the report.");

      setMessage(data.message);
      setForm(blankForm());
      setReloadKey((key) => key + 1);
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Unable to send the report.");
    } finally {
      setSending(false);
    }
  };

  return (
    <StaffLayout
      badge={isSecurity ? "INCIDENT REPORT" : "REPORT AN ISSUE"}
      title={isSecurity ? "Incident Report" : "Report an Issue"}
      subtitle={
        isSecurity
          ? "Report suspicious activity or incidents to the Supervisor and Admin."
          : "Report unsafe or complex problems that need the supervisor's attention."
      }
    >
      <section className="sx-card sx-report-intro-card">
        <div className="sx-card-head">
          <div>
            <h2>{isSecurity ? "Incident reports" : "Issue reports"}</h2>
            <p>Report an issue to your supervisor for follow-up.</p>
          </div>
          <button
            type="button"
            className="sx-btn sx-btn-primary sx-report-add-btn"
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
          >
            Add Report &amp; Issue
          </button>
        </div>

        {message && <p className="sx-alert sx-alert-success">{message}</p>}
        {error && <p className="sx-alert sx-alert-error">{error}</p>}
      </section>

      <section className="sx-card sx-report-history-card">
        <div className="sx-card-head">
          <div>
            <h2>Your previous reports</h2>
            <p>{reports.length} report{reports.length === 1 ? "" : "s"} sent</p>
          </div>
        </div>

        {loading ? (
          <div className="sx-empty">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="sx-empty">
            <strong>No reports yet</strong>
            Reports you send will be listed here.
          </div>
        ) : (
          <div className="sx-table-wrap">
            <table className="sx-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Location</th>
                  <th>When</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((report) => (
                  <tr key={report.report_id}>
                    <td>
                      <strong>{report.title}</strong>
                      <small>{report.description}</small>
                    </td>
                    <td>{report.location || "-"}</td>
                    <td>{formatDateTime(report.occurred_at)}</td>
                    <td>
                      <span className={`sx-pill ${SEVERITY_PILL[report.severity] || ""}`}>
                        {report.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`sx-pill ${STATUS_PILL[report.status] || ""}`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="sx-modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget && !sending) setShowForm(false);
          }}
        >
          <form
            className="sx-modal sx-report-modal"
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-form-title"
          >
            <h3 id="report-form-title">{isSecurity ? "New incident report" : "Report an issue"}</h3>
            <p>Your supervisor is notified as soon as you send this.</p>

            {error && <p className="sx-alert sx-alert-error">{error}</p>}

            <div className="sx-grid-2">
              <div className="sx-field sx-field-wide">
                <label htmlFor="report-title">Title</label>
                <input
                  id="report-title"
                  value={form.title}
                  maxLength={150}
                  placeholder={isSecurity ? "For example: Unknown person at the gate" : "For example: Sparking switchboard"}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </div>

              <div className="sx-field sx-field-wide">
                <label htmlFor="report-description">What happened?</label>
                <textarea
                  id="report-description"
                  value={form.description}
                  maxLength={2000}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </div>

              <div className="sx-field">
                <label htmlFor="report-location">Location</label>
                <input
                  id="report-location"
                  value={form.location}
                  maxLength={150}
                  placeholder="Block, floor or area"
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                />
              </div>

              <div className="sx-field">
                <label htmlFor="report-time">Date and time</label>
                <input
                  id="report-time"
                  type="datetime-local"
                  value={form.occurred_at}
                  max={nowForInput()}
                  onChange={(event) => setForm({ ...form, occurred_at: event.target.value })}
                />
              </div>

              <div className="sx-field">
                <label htmlFor="report-severity">How serious is it?</label>
                <select
                  id="report-severity"
                  value={form.severity}
                  onChange={(event) => setForm({ ...form, severity: event.target.value })}
                >
                  {SEVERITIES.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sx-modal-actions">
              <button
                type="button"
                className="sx-btn sx-btn-ghost"
                onClick={() => setShowForm(false)}
                disabled={sending}
              >
                Cancel
              </button>
              <button type="submit" className="sx-btn sx-btn-primary" disabled={sending}>
                {sending ? "Sending..." : "Send Report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </StaffLayout>
  );
}

export default StaffReportIssue;
