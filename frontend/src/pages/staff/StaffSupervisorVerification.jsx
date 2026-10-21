import { useState } from "react";
import StaffLayout from "../../components/StaffLayout";
import { formatDateTime } from "../../utils/time";
import { staffApi, useStaffApi } from "../../utils/staffApi";

const personName = (task) =>
  [task.staff_first_name, task.staff_last_name].filter(Boolean).join(" ") || "Unknown";

function StaffSupervisorVerification() {
  const { data, error, loading, reload } = useStaffApi("/supervisor/verification");

  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [reopening, setReopening] = useState(null);
  const [note, setNote] = useState("");

  const awaiting = data?.awaiting || [];
  const verified = data?.verified || [];

  const decide = async (task, action, text = "") => {
    setBusyId(task.task_id);
    setActionError("");
    setMessage("");

    try {
      const result = await staffApi(`/supervisor/tasks/${task.task_id}/verify`, {
        method: "PUT",
        body: { action, note: text }
      });

      setMessage(result.message);
      setReopening(null);
      setNote("");
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
      title="Work Verification"
      subtitle="Review the work notes of completed tasks, then approve the work or reopen it."
      actions={
        <button type="button" className="sx-btn sx-btn-ghost" onClick={reload}>
          ↻ Refresh
        </button>
      }
    >
      {message && <p className="sx-alert sx-alert-success">{message}</p>}
      {(error || actionError) && <p className="sx-alert sx-alert-error">{error || actionError}</p>}

      <section className="sx-stack">
        <div className="sx-card">
          <div className="sx-card-head">
            <div>
              <h2>Waiting for your check</h2>
              <p>{awaiting.length} task{awaiting.length === 1 ? "" : "s"} completed by staff</p>
            </div>
          </div>

          {loading ? (
            <div className="sx-empty">Loading...</div>
          ) : awaiting.length === 0 ? (
            <div className="sx-empty">
              <strong>Nothing to verify</strong>
              Completed work will appear here for your approval.
            </div>
          ) : (
            <ul className="sx-list">
              {awaiting.map((task) => (
                <li key={task.task_id} className="sx-card" style={{ boxShadow: "none" }}>
                  <div className="sx-card-head" style={{ marginBottom: 6 }}>
                    <div>
                      <h2>{task.task_name}</h2>
                      <p>
                        {personName(task)} · {task.staff_department || "No type"}
                        {task.location ? ` · 📍 ${task.location}` : ""}
                      </p>
                    </div>

                    <span className="sx-pill sx-pill-amber">Completed {formatDateTime(task.completed_date)}</span>
                  </div>

                  {task.description && <p className="sx-meta">{task.description}</p>}

                  <div className="sx-notes-box">
                    <strong>Work notes:</strong> {task.work_notes || "The staff member did not add any notes."}
                  </div>

                  <div className="sx-actions" style={{ marginTop: 14 }}>
                    <button
                      type="button"
                      className="sx-btn sx-btn-primary sx-btn-small"
                      disabled={busyId === task.task_id}
                      onClick={() => decide(task, "approve")}
                    >
                      Approve work
                    </button>

                    <button
                      type="button"
                      className="sx-btn sx-btn-danger sx-btn-small"
                      disabled={busyId === task.task_id}
                      onClick={() => {
                        setReopening(task);
                        setNote("");
                        setActionError("");
                      }}
                    >
                      Reopen
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sx-card">
          <div className="sx-card-head">
            <div>
              <h2>Recently verified</h2>
              <p>The last 20 approved tasks</p>
            </div>
          </div>

          {verified.length === 0 ? (
            <div className="sx-empty">No approved work yet.</div>
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
                  {verified.map((task) => (
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
                        {formatDateTime(task.verified_at)}
                        {task.verification_note && <small>{task.verification_note}</small>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {reopening && (
        <div className="sx-modal-backdrop" role="dialog" aria-modal="true" aria-label="Reopen task">
          <div className="sx-modal">
            <h3>Reopen this work</h3>
            <p>{reopening.task_name}</p>

            <div className="sx-field">
              <label htmlFor="reopen-note">What is still incomplete?</label>
              <textarea
                id="reopen-note"
                value={note}
                maxLength={500}
                placeholder="The staff member will see this note and a notification."
                onChange={(event) => setNote(event.target.value)}
                autoFocus
              />
            </div>

            <div className="sx-modal-actions">
              <button type="button" className="sx-btn sx-btn-ghost" onClick={() => setReopening(null)}>
                Cancel
              </button>

              <button
                type="button"
                className="sx-btn sx-btn-danger"
                disabled={!note.trim() || busyId === reopening.task_id}
                onClick={() => decide(reopening, "reopen", note.trim())}
              >
                Reopen task
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default StaffSupervisorVerification;
