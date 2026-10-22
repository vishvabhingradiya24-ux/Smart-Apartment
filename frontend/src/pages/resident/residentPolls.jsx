import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, CheckCircle2, Clock3, Info, Lock, Vote } from "lucide-react";
import "../../css/resident/resident_shared.css";

const API = "http://localhost:5000/api/resident/polls";

const formatDate = (value) => {
  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const ResidentPolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [cardErrors, setCardErrors] = useState({});

  const token = sessionStorage.getItem("token");

  const fetchPolls = useCallback(async () => {
    try {
      if (!token) throw new Error("Login session not found. Please log in again.");

      const response = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to load polls.");

      setPolls(data.polls || []);
      setLoadError("");
    } catch (error) {
      setLoadError(error.message || "Unable to load polls.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const loadPolls = async () => {
      await fetchPolls();
    };

    loadPolls();
  }, [fetchPolls]);

  const submitVote = async (poll) => {
    const optionId = selected[poll.poll_id];

    if (!optionId) {
      setCardErrors((current) => ({ ...current, [poll.poll_id]: "Please select an answer first." }));
      return;
    }

    setSubmittingId(poll.poll_id);
    setCardErrors((current) => ({ ...current, [poll.poll_id]: "" }));

    try {
      const response = await fetch(`${API}/${poll.poll_id}/vote`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ option_id: optionId }),
      });
      const data = await response.json();

      // 409 means the vote was already counted, so refresh to show the results.
      if (!response.ok && response.status !== 409) {
        throw new Error(data.message || "Unable to record your vote.");
      }

      await fetchPolls();
    } catch (error) {
      setCardErrors((current) => ({ ...current, [poll.poll_id]: error.message || "Unable to record your vote." }));
    } finally {
      setSubmittingId(null);
    }
  };

  const activePolls = polls.filter((poll) => poll.status === "Active");
  const closedPolls = polls.filter((poll) => poll.status === "Closed");
  const waitingCount = activePolls.filter((poll) => poll.my_vote_option_id === null).length;
  const votedCount = polls.filter((poll) => poll.my_vote_option_id !== null).length;

  const renderPoll = (poll) => {
    const isOpen = poll.status === "Active";
    const hasVoted = poll.my_vote_option_id !== null;
    const submitting = submittingId === poll.poll_id;

    return (
      <article className={`rp-card${isOpen && !hasVoted ? " is-warn" : ""}${isOpen ? "" : " is-muted"}`} key={poll.poll_id}>
        <div className="rp-card-top">
          <span className={`rp-pill${isOpen ? "" : " is-muted"}`}>
            {isOpen ? <Vote size={12} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}
            {isOpen ? "Active" : "Closed"}
          </span>

          <span className={`rp-pill${hasVoted ? "" : " is-warn"}`}>
            {hasVoted ? <><Check size={12} aria-hidden="true" /> Voted</> : isOpen ? "Your vote needed" : "Did not vote"}
          </span>
        </div>

        <h3>{poll.question}</h3>

        {poll.description && <p className="rp-card-text">{poll.description}</p>}

        <div className="rp-meta">
          <div><small>{isOpen ? "Voting ends" : "Voting ended"}</small><strong>{formatDate(poll.end_date)}</strong></div>
          <div><small>Your status</small><strong>{hasVoted ? "Voted" : isOpen ? "Not voted yet" : "Did not vote"}</strong></div>
        </div>

        {poll.show_results ? (
          <div className="rp-results">
            {poll.options.map((option) => {
              const mine = option.option_id === poll.my_vote_option_id;

              return (
                <div className={`rp-result${mine ? " is-mine" : ""}`} key={option.option_id}>
                  <div className="rp-result-top">
                    <span>
                      {option.option_text}
                      {mine && (
                        <em className="rp-mine">
                          <Check size={12} strokeWidth={3} aria-hidden="true" /> Your vote
                        </em>
                      )}
                    </span>

                    <strong>
                      {option.percent}% <small>({option.votes})</small>
                    </strong>
                  </div>

                  <div className="rp-bar">
                    <i style={{ width: `${option.percent}%` }} />
                  </div>
                </div>
              );
            })}

            <p className="rp-card-foot">
              {poll.total_votes} {poll.total_votes === 1 ? "vote" : "votes"} in total
            </p>
          </div>
        ) : (
          <div className="rp-options">
            {poll.options.map((option) => (
              <label className="rp-option" key={option.option_id}>
                <input
                  type="radio"
                  name={`poll-${poll.poll_id}`}
                  checked={selected[poll.poll_id] === option.option_id}
                  disabled={submitting}
                  onChange={() => {
                    setSelected((current) => ({ ...current, [poll.poll_id]: option.option_id }));
                    setCardErrors((current) => ({ ...current, [poll.poll_id]: "" }));
                  }}
                />

                <span className="rp-radio" aria-hidden="true"></span>

                <span>{option.option_text}</span>
              </label>
            ))}

            {cardErrors[poll.poll_id] && (
              <p className="rp-error-text" role="alert">{cardErrors[poll.poll_id]}</p>
            )}

            <button
              className="rp-btn is-block"
              type="button"
              disabled={submitting}
              onClick={() => submitVote(poll)}
            >
              {submitting ? "Submitting…" : "Submit vote"}
              {!submitting && <ArrowRight size={16} aria-hidden="true" />}
            </button>

            <p className="rp-hint">You can vote only once, and your vote cannot be changed.</p>
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="rp-page">
      <header className="rp-banner">
        <div className="rp-banner-text">
          <span className="rp-banner-eyebrow">COMMUNITY</span>
          <h1>Polls &amp; Voting</h1>
          <p>Share your opinion on active community decisions.</p>
        </div>
        <span className="rp-banner-icon" aria-hidden="true"><Vote size={28} strokeWidth={1.6} /></span>
      </header>

      <section className="rp-stats" aria-label="Poll summary">
        <div className="rp-stat">
          <span className="rp-stat-icon"><Vote size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>Open for voting</small><strong>{loading ? "—" : activePolls.length}</strong></div>
        </div>
        <div className={`rp-stat${waitingCount > 0 ? " is-warn" : ""}`}>
          <span className="rp-stat-icon"><Clock3 size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>Waiting for your vote</small><strong>{loading ? "—" : waitingCount}</strong></div>
        </div>
        <div className="rp-stat">
          <span className="rp-stat-icon"><CheckCircle2 size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>Polls you voted in</small><strong>{loading ? "—" : votedCount}</strong></div>
        </div>
        <div className="rp-stat">
          <span className="rp-stat-icon"><Lock size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div className="rp-stat-body"><small>Closed polls</small><strong>{loading ? "—" : closedPolls.length}</strong></div>
        </div>
      </section>

      {loading ? (
        <div className="rp-loading">
          <span className="rp-spinner" aria-hidden="true" />
          Loading polls…
        </div>
      ) : loadError ? (
        <div className="rp-empty is-error">
          <span className="rp-empty-icon" aria-hidden="true"><Info size={24} strokeWidth={1.7} /></span>
          <h3>Unable to load polls</h3>
          <p>{loadError}</p>
          <button type="button" className="rp-btn" onClick={fetchPolls}>
            Try again
          </button>
        </div>
      ) : polls.length === 0 ? (
        <div className="rp-empty">
          <span className="rp-empty-icon" aria-hidden="true"><Vote size={24} strokeWidth={1.7} /></span>
          <h3>No active polls</h3>
          <p>
            There are no community polls available right now. Published polls will
            appear here when they are opened for voting.
          </p>
        </div>
      ) : (
        <>
          <section className="rp-section">
            <div className="rp-section-head">
              <div>
                <span className="rp-eyebrow">ACTIVE POLLS</span>
                <h2>Open for voting</h2>
              </div>

              <span className="rp-chip">{activePolls.length} Active</span>
            </div>

            {activePolls.length === 0 ? (
              <div className="rp-empty">
                <span className="rp-empty-icon" aria-hidden="true"><CheckCircle2 size={24} strokeWidth={1.7} /></span>
                <h3>No polls are open right now</h3>
                <p>You will see new polls here as soon as the administration publishes them.</p>
              </div>
            ) : (
              <div className="rp-grid">{activePolls.map(renderPoll)}</div>
            )}
          </section>

          {closedPolls.length > 0 && (
            <section className="rp-section">
              <div className="rp-section-head">
                <div>
                  <span className="rp-eyebrow">PAST POLLS</span>
                  <h2>Closed polls</h2>
                </div>

                <span className="rp-chip">{closedPolls.length} Closed</span>
              </div>

              <div className="rp-grid">{closedPolls.map(renderPoll)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default ResidentPolls;
