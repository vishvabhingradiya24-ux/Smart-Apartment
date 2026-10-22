import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Lock, LockOpen, Pencil, Plus, Trash2, Users, Vote, X } from "lucide-react";
import AdminFormModal from "./AdminFormModal";
import "../../css/notices.css";
import "../../css/admin_polls.css";

const API = "http://localhost:5000/api/admin/polls";

const MAX_OPTIONS = 6;

const todayInput = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const blankForm = () => ({
  question: "",
  description: "",
  end_date: "",
  options: ["", ""],
});

const FILTERS = ["All", "Active", "Closed"];

const AdminPolls = () => {
  const [polls, setPolls] = useState([]);
  const [totalResidents, setTotalResidents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const token = sessionStorage.getItem("token");

  const request = useCallback(
    (url, options = {}) =>
      fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.body ? { "Content-Type": "application/json" } : {}),
        },
      }),
    [token]
  );

  const fetchPolls = useCallback(async () => {
    try {
      const response = await request(API);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to load polls.");

      setPolls(data.polls || []);
      setTotalResidents(Number(data.total_residents) || 0);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load polls.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    const loadPolls = async () => {
      await fetchPolls();
    };

    loadPolls();
  }, [fetchPolls]);

  // Answer options can only change while nobody has voted.
  const optionsLocked = Boolean(editingPoll && editingPoll.total_votes > 0);

  const openCreate = () => {
    setEditingPoll(null);
    setForm(blankForm());
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (poll) => {
    setEditingPoll(poll);
    setForm({
      question: poll.question,
      description: poll.description || "",
      end_date: poll.end_date,
      options: poll.options.map((option) => option.option_text),
    });
    setFormError("");
    setShowForm(true);
  };

  const setOption = (index, value) =>
    setForm((current) => ({
      ...current,
      options: current.options.map((option, i) => (i === index ? value : option)),
    }));

  const addOption = () =>
    setForm((current) =>
      current.options.length >= MAX_OPTIONS
        ? current
        : { ...current, options: [...current.options, ""] }
    );

  const removeOption = (index) =>
    setForm((current) =>
      current.options.length <= 2
        ? current
        : { ...current, options: current.options.filter((_, i) => i !== index) }
    );

  const submitForm = async (event) => {
    event.preventDefault();
    setFormError("");

    const question = form.question.trim();
    const options = form.options.map((option) => option.trim()).filter(Boolean);

    if (!question) {
      setFormError("Please enter the poll question.");
      return;
    }

    if (!form.end_date) {
      setFormError("Please choose the last voting date.");
      return;
    }

    if (!optionsLocked) {
      if (options.length < 2) {
        setFormError("Add at least 2 answer options.");
        return;
      }

      if (new Set(options.map((option) => option.toLowerCase())).size !== options.length) {
        setFormError("The options must be different from each other.");
        return;
      }
    }

    setSaving(true);

    try {
      const response = await request(editingPoll ? `${API}/${editingPoll.poll_id}` : API, {
        method: editingPoll ? "PUT" : "POST",
        body: JSON.stringify({
          question,
          description: form.description.trim(),
          end_date: form.end_date,
          options,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to save the poll.");

      setShowForm(false);
      setMessage(data.message);
      await fetchPolls();
    } catch (err) {
      setFormError(err.message || "Unable to save the poll.");
    } finally {
      setSaving(false);
    }
  };

  const act = async (poll, url, options, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;

    setBusyId(poll.poll_id);
    setMessage("");
    setError("");

    try {
      const response = await request(url, options);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong.");

      setMessage(data.message);
      await fetchPolls();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  const closePoll = (poll) =>
    act(
      poll,
      `${API}/${poll.poll_id}/close`,
      { method: "PUT" },
      `Close the poll "${poll.question}"? Residents will not be able to vote any more.`
    );

  const reopenPoll = (poll) => act(poll, `${API}/${poll.poll_id}/reopen`, { method: "PUT" });

  const deletePoll = (poll) =>
    act(
      poll,
      `${API}/${poll.poll_id}`,
      { method: "DELETE" },
      `Delete the poll "${poll.question}" and all of its votes? This cannot be undone.`
    );

  const visible = useMemo(
    () => polls.filter((poll) => filter === "All" || poll.status === filter),
    [polls, filter]
  );

  const activeCount = polls.filter((poll) => poll.status === "Active").length;
  const totalVotes = polls.reduce((sum, poll) => sum + poll.total_votes, 0);

  return (
    <div className="notices-page adminpoll-page">
      <div className="notices-header">
        <div>
          <span className="notices-overline">COMMUNITY MANAGEMENT</span>
          <h1>Polls & Voting</h1>
          <p>Create polls for the residents and see how they vote. Each resident can vote once per poll.</p>
        </div>

        <button type="button" className="add-notice-btn" onClick={openCreate}>
          <span>＋</span> Create Poll
        </button>
      </div>

      <div className="notice-stats-grid">
        <div className="notice-stat-card">
          <div className="notice-stat-icon"><Vote size={18} strokeWidth={1.8} aria-hidden="true" /></div>
          <div><span>Total Polls</span><strong>{polls.length}</strong></div>
        </div>

        <div className="notice-stat-card">
          <div className="notice-stat-icon"><CheckCircle2 size={18} strokeWidth={1.8} aria-hidden="true" /></div>
          <div><span>Active</span><strong>{activeCount}</strong></div>
        </div>

        <div className="notice-stat-card">
          <div className="notice-stat-icon"><Lock size={18} strokeWidth={1.8} aria-hidden="true" /></div>
          <div><span>Closed</span><strong>{polls.length - activeCount}</strong></div>
        </div>

        <div className="notice-stat-card">
          <div className="notice-stat-icon"><Users size={18} strokeWidth={1.8} aria-hidden="true" /></div>
          <div><span>Total Votes</span><strong>{totalVotes}</strong></div>
        </div>
      </div>

      {showForm && (
        <AdminFormModal title={editingPoll ? "Edit Poll" : "Create Poll"} onClose={() => setShowForm(false)} saving={saving}>
          <form className="notice-form" onSubmit={submitForm}>
            <div className="notice-form-grid">
              <label className="notice-description-field">
                Question
                <input
                  maxLength={200}
                  value={form.question}
                  placeholder="For example: Should we start a monthly cleanliness drive?"
                  onChange={(event) => setForm({ ...form, question: event.target.value })}
                />
              </label>

              <label className="notice-description-field">
                Description (optional)
                <textarea
                  rows="2"
                  maxLength={1000}
                  value={form.description}
                  placeholder="Add a few words so residents understand the poll."
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </label>

              <label>
                Last voting date
                <input
                  type="date"
                  min={editingPoll ? undefined : todayInput()}
                  value={form.end_date}
                  onChange={(event) => setForm({ ...form, end_date: event.target.value })}
                />
              </label>

              <div className="notice-description-field adminpoll-options-field">
                <span className="adminpoll-options-label">
                  Answer options <small>(2 to {MAX_OPTIONS})</small>
                </span>

                {optionsLocked && (
                  <p className="adminpoll-locked-note">
                    Residents have already voted, so the answer options can no longer be changed.
                  </p>
                )}

                {form.options.map((option, index) => (
                  <div className="adminpoll-option-row" key={index}>
                    <input
                      maxLength={120}
                      value={option}
                      disabled={optionsLocked}
                      placeholder={`Option ${index + 1}`}
                      aria-label={`Option ${index + 1}`}
                      onChange={(event) => setOption(index, event.target.value)}
                    />

                    <button
                      type="button"
                      className="adminpoll-icon-btn"
                      title="Remove option"
                      aria-label={`Remove option ${index + 1}`}
                      disabled={optionsLocked || form.options.length <= 2}
                      onClick={() => removeOption(index)}
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="adminpoll-add-option"
                  disabled={optionsLocked || form.options.length >= MAX_OPTIONS}
                  onClick={addOption}
                >
                  <Plus size={14} aria-hidden="true" /> Add option
                </button>
              </div>
            </div>

            {formError && <p className="notice-error" role="alert">{formError}</p>}

            <div className="notice-form-actions">
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingPoll ? "Save Changes" : "Publish Poll"}
              </button>
            </div>
          </form>
        </AdminFormModal>
      )}

      {message && <p className="adminpoll-message" role="status">{message}</p>}
      {error && <p className="notice-error" role="alert">{error}</p>}

      <div className="notice-toolbar">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={`adminpoll-filter${filter === item ? " active" : ""}`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}

        <span className="adminpoll-count">{visible.length} of {polls.length} polls</span>
      </div>

      {loading ? (
        <div className="adminpoll-state">Loading polls…</div>
      ) : visible.length === 0 ? (
        <div className="adminpoll-state">
          <strong>{polls.length === 0 ? "No polls yet" : "No polls in this list"}</strong>
          <p>
            {polls.length === 0
              ? "Residents only see polls that you create here. Click Create Poll to add the first one."
              : "Try another filter."}
          </p>
        </div>
      ) : (
        <div className="adminpoll-grid">
          {visible.map((poll) => (
            <article className="adminpoll-card" key={poll.poll_id}>
              <div className="adminpoll-card-top">
                <span className={`adminpoll-status ${poll.status.toLowerCase()}`}>{poll.status}</span>
                <span className="adminpoll-date">
                  {poll.status === "Active" ? "Ends" : "Ended"} {formatDate(poll.end_date)}
                </span>
              </div>

              <h3>{poll.question}</h3>
              {poll.description && <p className="adminpoll-description">{poll.description}</p>}

              <div className="adminpoll-results">
                {poll.options.map((option) => (
                  <div className="adminpoll-result" key={option.option_id}>
                    <div className="adminpoll-result-top">
                      <span>{option.option_text}</span>
                      <strong>
                        {option.percent}% <small>({option.votes})</small>
                      </strong>
                    </div>

                    <div className="adminpoll-bar">
                      <i style={{ width: `${option.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="adminpoll-card-foot">
                <span>
                  {poll.total_votes} {poll.total_votes === 1 ? "vote" : "votes"}
                  {totalResidents > 0 && (
                    <> · {Math.round((poll.total_votes / totalResidents) * 100)}% of {totalResidents} residents</>
                  )}
                </span>

                <div className="adminpoll-actions">
                  <button type="button" disabled={busyId === poll.poll_id} onClick={() => openEdit(poll)}>
                    <Pencil size={14} aria-hidden="true" /> Edit
                  </button>

                  {poll.status === "Active" ? (
                    <button type="button" disabled={busyId === poll.poll_id} onClick={() => closePoll(poll)}>
                      <Lock size={14} aria-hidden="true" /> Close
                    </button>
                  ) : (
                    <button type="button" disabled={busyId === poll.poll_id} onClick={() => reopenPoll(poll)}>
                      <LockOpen size={14} aria-hidden="true" /> Reopen
                    </button>
                  )}

                  <button
                    type="button"
                    className="danger"
                    disabled={busyId === poll.poll_id}
                    onClick={() => deletePoll(poll)}
                  >
                    <Trash2 size={14} aria-hidden="true" /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPolls;
