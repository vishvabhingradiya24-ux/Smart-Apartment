import { useState } from "react";
import StaffLayout from "../../components/StaffLayout";
import { formatDate } from "../../utils/time";
import { useStaffApi } from "../../utils/staffApi";

const STATUSES = ["All", "Pending", "Assigned", "In Progress", "Resolved"];
const CATEGORIES = ["All", "Maintenance", "Plumbing", "Electrical", "Cleaning", "Security", "Other"];

const STATUS_PILL = {
  Pending: "sx-pill-amber",
  Assigned: "sx-pill-purple",
  "In Progress": "sx-pill-blue",
  Resolved: "sx-pill-green"
};

const PRIORITY_PILL = {
  Low: "sx-pill-green",
  Medium: "sx-pill-blue",
  High: "sx-pill-amber",
  Urgent: "sx-pill-red"
};

function StaffSupervisorComplaints() {
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");

  const query = [
    status !== "All" && `status=${encodeURIComponent(status)}`,
    category !== "All" && `category=${encodeURIComponent(category)}`
  ]
    .filter(Boolean)
    .join("&");

  const { data, error, loading, reload } = useStaffApi(`/supervisor/complaints${query ? `?${query}` : ""}`);

  const complaints = data?.complaints || [];

  return (
    <StaffLayout
      badge="FACILITY SUPERVISOR"
      title="Complaint Monitoring"
      subtitle="Follow every complaint: its category, the resident, who is handling it and its status."
      actions={
        <button type="button" className="sx-btn sx-btn-ghost" onClick={reload}>
          ↻ Refresh
        </button>
      }
    >
      <section className="controls-bar">
        <div className="filter-tabs">
          {STATUSES.map((item) => (
            <button
              key={item}
              type="button"
              className={`filter-tab-btn ${status === item ? "active" : ""}`}
              onClick={() => setStatus(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="sx-field" style={{ minWidth: 190 }}>
          <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All categories" : item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="sx-card">
        {error && <p className="sx-alert sx-alert-error">{error}</p>}

        {loading ? (
          <div className="sx-empty">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="sx-empty">
            <strong>No complaints found</strong>
            Complaints raised by residents will be listed here.
          </div>
        ) : (
          <div className="sx-table-wrap">
            <table className="sx-table">
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Resident / flat</th>
                  <th>Assigned staff</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Raised</th>
                </tr>
              </thead>

              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.complaint_id}>
                    <td>
                      <strong>
                        CMP-{String(complaint.complaint_id).padStart(4, "0")} · {complaint.category}
                      </strong>
                      <small>{complaint.complaint_title}</small>
                    </td>

                    <td>
                      {[complaint.resident_first_name, complaint.resident_last_name].filter(Boolean).join(" ") || "-"}
                      <small>
                        {[complaint.block_wing, complaint.flat_number].filter(Boolean).join(" - ") || "-"}
                      </small>
                    </td>

                    <td>
                      {complaint.assigned_staff_id
                        ? `${complaint.staff_first_name} ${complaint.staff_last_name}`
                        : "Not assigned yet"}
                      {complaint.staff_department && <small>{complaint.staff_department}</small>}
                    </td>

                    <td>
                      <span className={`sx-pill ${PRIORITY_PILL[complaint.priority] || ""}`}>
                        {complaint.priority}
                      </span>
                    </td>

                    <td>
                      <span className={`sx-pill ${STATUS_PILL[complaint.status] || ""}`}>{complaint.status}</span>
                    </td>

                    <td>
                      {formatDate(complaint.complaint_date)}
                      {complaint.assigned_at && <small>Assigned {formatDate(complaint.assigned_at)}</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </StaffLayout>
  );
}

export default StaffSupervisorComplaints;
