import { useState } from "react";
import StaffLayout from "../../components/StaffLayout";
import { formatDateTime } from "../../utils/time";
import { downloadCsv, useStaffApi } from "../../utils/staffApi";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "Last 7 days" },
  { key: "month", label: "Last 30 days" }
];

const personName = (row) =>
  [row.staff_first_name || row.first_name, row.staff_last_name || row.last_name].filter(Boolean).join(" ") || "-";

function StaffSupervisorReports() {
  const [range, setRange] = useState("today");

  const { data, error, loading } = useStaffApi(`/supervisor/reports?range=${range}`);

  const summary = data?.summary;
  const completed = data?.completed || [];
  const staffWise = data?.staffWise || [];

  const rangeLabel = RANGES.find((item) => item.key === range).label;
  const today = new Date().toISOString().slice(0, 10);

  const exportCompleted = () =>
    downloadCsv(`work-completed-${range}-${today}.csv`, [
      ["Task", "Staff", "Staff type", "Location", "Priority", "Completed on", "Verified", "Work notes"],
      ...completed.map((task) => [
        task.task_name,
        personName(task),
        task.staff_department,
        task.location,
        task.priority,
        formatDateTime(task.completed_date),
        task.verified_at ? "Yes" : "No",
        task.work_notes
      ])
    ]);

  const exportStaffWise = () =>
    downloadCsv(`staff-wise-tasks-${today}.csv`, [
      ["Staff", "Staff type", "Assigned", "Pending", "In progress", "Completed", "Overdue"],
      ...staffWise.map((row) => [
        personName(row),
        row.department,
        row.assigned,
        row.pending,
        row.in_progress,
        row.completed,
        row.overdue
      ])
    ]);

  const cards = summary
    ? [
        ["Assigned tasks", summary.tasks_total, "All tasks"],
        ["Pending", summary.tasks_pending, "Waiting to start"],
        ["In progress", summary.tasks_in_progress, "Being worked on"],
        ["Completed", summary.tasks_completed, "Finished by staff"],
        ["Overdue", summary.tasks_overdue, "Past the deadline"],
        ["Awaiting verification", summary.awaiting_verification, "Completed, not checked"]
      ]
    : [];

  return (
    <StaffLayout
      badge="FACILITY SUPERVISOR"
      title="Reports"
      subtitle="Daily work, staff-wise tasks, and pending, completed and overdue work."
    >
      <section className="controls-bar">
        <div className="filter-tabs">
          {RANGES.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`filter-tab-btn ${range === item.key ? "active" : ""}`}
              onClick={() => setRange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {error && <p className="sx-alert sx-alert-error">{error}</p>}

      {loading ? (
        <section className="sx-card">
          <div className="sx-empty">Building the report...</div>
        </section>
      ) : (
        <div className="sx-stack">
          <section className="stats-grid">
            {cards.map(([title, value, note], index) => (
              <div key={title} className={`stat-card ${index === 0 ? "stat-active" : ""}`}>
                <div className="stat-info">
                  <h3>{title}</h3>
                  <span className="stat-value">{value}</span>
                  <small>{note}</small>
                </div>
              </div>
            ))}
          </section>

          <section className="sx-card">
            <div className="sx-card-head">
              <div>
                <h2>Work completed - {rangeLabel.toLowerCase()}</h2>
                <p>{completed.length} task{completed.length === 1 ? "" : "s"} finished</p>
              </div>

              <button type="button" className="sx-btn sx-btn-ghost sx-btn-small" onClick={exportCompleted} disabled={completed.length === 0}>
                ⬇ Download CSV
              </button>
            </div>

            {completed.length === 0 ? (
              <div className="sx-empty">No work was completed in this period.</div>
            ) : (
              <div className="sx-table-wrap">
                <table className="sx-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Staff</th>
                      <th>Completed</th>
                      <th>Verified</th>
                    </tr>
                  </thead>

                  <tbody>
                    {completed.map((task) => (
                      <tr key={task.task_id}>
                        <td>
                          <strong>{task.task_name}</strong>
                          {task.work_notes && <small>{task.work_notes}</small>}
                        </td>
                        <td>
                          {personName(task)}
                          <small>{task.staff_department || ""}</small>
                        </td>
                        <td>{formatDateTime(task.completed_date)}</td>
                        <td>
                          <span className={`sx-pill ${task.verified_at ? "sx-pill-green" : "sx-pill-amber"}`}>
                            {task.verified_at ? "Verified" : "Waiting"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="sx-card">
            <div className="sx-card-head">
              <div>
                <h2>Staff-wise tasks</h2>
                <p>Every staff member and how their tasks stand</p>
              </div>

              <button type="button" className="sx-btn sx-btn-ghost sx-btn-small" onClick={exportStaffWise} disabled={staffWise.length === 0}>
                ⬇ Download CSV
              </button>
            </div>

            <div className="sx-table-wrap">
              <table className="sx-table">
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Assigned</th>
                    <th>Pending</th>
                    <th>In progress</th>
                    <th>Completed</th>
                    <th>Overdue</th>
                  </tr>
                </thead>

                <tbody>
                  {staffWise.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {personName(row)}
                        <small>{row.department || "No type"}</small>
                      </td>
                      <td>{row.assigned}</td>
                      <td>{row.pending}</td>
                      <td>{row.in_progress}</td>
                      <td>{row.completed}</td>
                      <td>
                        {row.overdue > 0 ? <span className="sx-pill sx-pill-red">{row.overdue}</span> : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </StaffLayout>
  );
}

export default StaffSupervisorReports;
