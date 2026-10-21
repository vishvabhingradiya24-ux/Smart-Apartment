import { useState } from "react";
import StaffLayout from "../../components/StaffLayout";
import { formatDate } from "../../utils/time";
import { staffApi, useStaffApi } from "../../utils/staffApi";

const FILTERS = [
  { key: "all", label: "All", query: "" },
  { key: "pending", label: "Pending", query: "status=Pending" },
  { key: "progress", label: "In Progress", query: "status=In%20Progress" },
  { key: "completed", label: "Completed", query: "status=Completed" },
  { key: "overdue", label: "Overdue", query: "overdue=1" }
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const STATUS_PILL = {
  Pending: "sx-pill-amber",
  "In Progress": "sx-pill-blue",
  Completed: "sx-pill-green"
};

const PRIORITY_PILL = {
  Low: "sx-pill-green",
  Medium: "sx-pill-blue",
  Normal: "sx-pill-blue",
  High: "sx-pill-amber",
  Urgent: "sx-pill-red"
};

const blankTask = { task_name: "", description: "", assigned_to: "", priority: "Medium", due_date: "", location: "" };

const personName = (task) =>
  [task.staff_first_name, task.staff_last_name].filter(Boolean).join(" ") || "Not assigned";

function StaffSupervisorTasks() {
  const [filter, setFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("");

  const query = [FILTERS.find((item) => item.key === filter).query, staffFilter && `staff_id=${staffFilter}`]
    .filter(Boolean)
    .join("&");

  const tasks = useStaffApi(`/supervisor/tasks${query ? `?${query}` : ""}`);
  const staff = useStaffApi("/supervisor/staff");

  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(blankTask);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [moving, setMoving] = useState(null);
  const [newAssignee, setNewAssignee] = useState("");

  const staffList = staff.data?.staff || [];
  const taskList = tasks.data?.tasks || [];

  const createTask = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.task_name.trim() || !form.assigned_to || !form.due_date) {
      setFormError("Please fill the task name, staff member and deadline.");
      return;
    }

    setSaving(true);

    try {
      const data = await staffApi("/supervisor/tasks", {
        method: "POST",
        body: { ...form, assigned_to: Number(form.assigned_to) }
      });

      setMessage(data.message);
      setShowCreate(false);
      setForm(blankTask);
      tasks.reload();
      staff.reload();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const reassign = async () => {
    if (!newAssignee) {
      setActionError("Select the staff member to move this task to.");
      return;
    }

    setSaving(true);
    setActionError("");

    try {
      const data = await staffApi(`/supervisor/tasks/${moving.task_id}/reassign`, {
        method: "PUT",
        body: { assigned_to: Number(newAssignee) }
      });

      setMessage(data.message);
      setMoving(null);
      setNewAssignee("");
      tasks.reload();
      staff.reload();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <StaffLayout
      badge="FACILITY SUPERVISOR"
      title="Task Management"
      subtitle="Create and assign tasks, set priority and deadline, reassign and track progress."
      actions={
        <button type="button" className="sx-btn sx-btn-primary" onClick={() => setShowCreate(true)}>
          + New Task
        </button>
      }
    >
      <section className="controls-bar">
        <div className="filter-tabs">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`filter-tab-btn ${filter === item.key ? "active" : ""}`}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="sx-field" style={{ minWidth: 220 }}>
          <select
            aria-label="Filter by staff member"
            value={staffFilter}
            onChange={(event) => setStaffFilter(event.target.value)}
          >
            <option value="">All staff</option>
            {staffList.map((person) => (
              <option key={person.id} value={person.id}>
                {person.first_name} {person.last_name} · {person.department || "No type"}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="sx-card">
        {message && <p className="sx-alert sx-alert-success">{message}</p>}
        {(tasks.error || actionError) && (
          <p className="sx-alert sx-alert-error">{tasks.error || actionError}</p>
        )}

        {tasks.loading ? (
          <div className="sx-empty">Loading tasks...</div>
        ) : taskList.length === 0 ? (
          <div className="sx-empty">
            <strong>No tasks here</strong>
            Create a task and assign it to a staff member.
          </div>
        ) : (
          <div className="sx-table-wrap">
            <table className="sx-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned to</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {taskList.map((task) => (
                  <tr key={task.task_id}>
                    <td>
                      <strong>{task.task_name}</strong>
                      {task.location && <small>📍 {task.location}</small>}
                      {task.description && <small>{task.description}</small>}
                    </td>

                    <td>
                      {personName(task)}
                      <small>{task.staff_department || ""}</small>
                    </td>

                    <td>
                      <span className={`sx-pill ${PRIORITY_PILL[task.priority] || ""}`}>{task.priority}</span>
                    </td>

                    <td>
                      {formatDate(task.due_date) || "-"}
                      {task.is_overdue && (
                        <small>
                          <span className="sx-pill sx-pill-red">Overdue</span>
                        </small>
                      )}
                    </td>

                    <td>
                      <span className={`sx-pill ${STATUS_PILL[task.status] || ""}`}>{task.status}</span>
                      {task.status === "Completed" && (
                        <small>{task.verified_at ? "Verified" : "Waiting for verification"}</small>
                      )}
                      {task.status !== "Completed" && !task.accepted_at && <small>Not accepted yet</small>}
                    </td>

                    <td>
                      {task.status !== "Completed" && (
                        <button
                          type="button"
                          className="sx-btn sx-btn-ghost sx-btn-small"
                          onClick={() => {
                            setMoving(task);
                            setNewAssignee("");
                            setActionError("");
                          }}
                        >
                          Reassign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCreate && (
        <div className="sx-modal-backdrop" role="dialog" aria-modal="true" aria-label="New task">
          <form className="sx-modal" onSubmit={createTask}>
            <h3>New task</h3>
            <p>The staff member is notified as soon as you create it.</p>

            {formError && <p className="sx-alert sx-alert-error">{formError}</p>}

            <div className="sx-grid-2">
              <div className="sx-field sx-field-wide">
                <label htmlFor="task-name">Task name</label>
                <input
                  id="task-name"
                  value={form.task_name}
                  maxLength={150}
                  onChange={(event) => setForm({ ...form, task_name: event.target.value })}
                />
              </div>

              <div className="sx-field sx-field-wide">
                <label htmlFor="task-description">Description (optional)</label>
                <textarea
                  id="task-description"
                  value={form.description}
                  maxLength={1000}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </div>

              <div className="sx-field">
                <label htmlFor="task-staff">Assign to</label>
                <select
                  id="task-staff"
                  value={form.assigned_to}
                  onChange={(event) => setForm({ ...form, assigned_to: event.target.value })}
                >
                  <option value="">Select staff</option>
                  {staffList.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.first_name} {person.last_name} · {person.department || "No type"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sx-field">
                <label htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value })}
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sx-field">
                <label htmlFor="task-due">Deadline</label>
                <input
                  id="task-due"
                  type="date"
                  value={form.due_date}
                  onChange={(event) => setForm({ ...form, due_date: event.target.value })}
                />
              </div>

              <div className="sx-field">
                <label htmlFor="task-location">Location (optional)</label>
                <input
                  id="task-location"
                  value={form.location}
                  maxLength={150}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                />
              </div>
            </div>

            <div className="sx-modal-actions">
              <button type="button" className="sx-btn sx-btn-ghost" onClick={() => setShowCreate(false)} disabled={saving}>
                Cancel
              </button>

              <button type="submit" className="sx-btn sx-btn-primary" disabled={saving}>
                {saving ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {moving && (
        <div className="sx-modal-backdrop" role="dialog" aria-modal="true" aria-label="Reassign task">
          <div className="sx-modal">
            <h3>Reassign task</h3>
            <p>{moving.task_name} (now with {personName(moving)})</p>

            {actionError && <p className="sx-alert sx-alert-error">{actionError}</p>}

            <div className="sx-field">
              <label htmlFor="reassign-staff">Move to</label>
              <select id="reassign-staff" value={newAssignee} onChange={(event) => setNewAssignee(event.target.value)}>
                <option value="">Select staff</option>
                {staffList
                  .filter((person) => person.id !== moving.assigned_to)
                  .map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.first_name} {person.last_name} · {person.department || "No type"}
                    </option>
                  ))}
              </select>
              <small>The new person has to accept and start the task again.</small>
            </div>

            <div className="sx-modal-actions">
              <button type="button" className="sx-btn sx-btn-ghost" onClick={() => setMoving(null)} disabled={saving}>
                Cancel
              </button>

              <button type="button" className="sx-btn sx-btn-primary" onClick={reassign} disabled={saving}>
                {saving ? "Saving..." : "Reassign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default StaffSupervisorTasks;
