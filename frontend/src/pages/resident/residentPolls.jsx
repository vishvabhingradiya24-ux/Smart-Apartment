import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import "../../css/resident/residentPolls.css";

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

  const renderPoll = (poll) => {
    const isOpen = poll.status === "Active";
    const hasVoted = poll.my_vote_option_id !== null;
    const submitting = submittingId === poll.poll_id;

    return (
      <div className="resident-poll-card" key={poll.poll_id}>
        <div className="resident-poll-card-top">
          <div className="resident-poll-icon">?</div>

          <span className={`resident-poll-status${isOpen ? "" : " closed"}`}>
            {isOpen ? "ACTIVE" : "CLOSED"}
          </span>
        </div>

        <h3>{poll.question}</h3>

        {poll.description && <p className="resident-poll-description">{poll.description}</p>}

        <div className="resident-poll-meta">
          <div>
            <span>{isOpen ? "VOTING ENDS" : "VOTING ENDED"}</span>
            <strong>{formatDate(poll.end_date)}</strong>
          </div>

          <div>
            <span>YOUR STATUS</span>
            <strong>{hasVoted ? "Voted" : isOpen ? "Not voted yet" : "Did not vote"}</strong>
          </div>
        </div>

        {poll.show_results ? (
          <div className="resident-poll-results">
            <span className="resident-poll-options-title">Results</span>

            {poll.options.map((option) => {
              const mine = option.option_id === poll.my_vote_option_id;

              return (
                <div className={`resident-poll-result${mine ? " mine" : ""}`} key={option.option_id}>
                  <div className="resident-poll-result-top">
                    <span>
                      {option.option_text}
                      {mine && (
                        <em className="resident-poll-mine-tag">
                          <Check size={12} strokeWidth={3} aria-hidden="true" /> Your vote
                        </em>
                      )}
                    </span>

                    <strong>
                      {option.percent}% <small>({option.votes})</small>
                    </strong>
                  </div>

                  <div className="resident-poll-bar">
                    <i style={{ width: `${option.percent}%` }} />
                  </div>
                </div>
              );
            })}

            <p className="resident-poll-total">
              {poll.total_votes} {poll.total_votes === 1 ? "vote" : "votes"} in total
            </p>
          </div>
        ) : (
          <div className="resident-poll-options">
            <span className="resident-poll-options-title">Select your answer</span>

            {poll.options.map((option) => (
              <label className="resident-poll-option" key={option.option_id}>
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

                <span className="resident-poll-radio"></span>

                <span>{option.option_text}</span>
              </label>
            ))}

            {cardErrors[poll.poll_id] && (
              <p className="resident-poll-error" role="alert">{cardErrors[poll.poll_id]}</p>
            )}

            <button
              className="resident-poll-vote-button"
              type="button"
              disabled={submitting}
              onClick={() => submitVote(poll)}
            >
              {submitting ? "Submitting…" : "Submit Vote"}
              {!submitting && <ArrowRight size={16} aria-hidden="true" />}
            </button>

            <p className="resident-poll-note">You can vote only once, and your vote cannot be changed.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="resident-polls-page">
      <header className="resident-polls-header">
        <div>
          <span className="resident-polls-overline">COMMUNITY</span>
          <h1>Polls &amp; Voting</h1>
          <p>Share your opinion on active community decisions.</p>
        </div>
      </header>

      {loading ? (
        <section className="resident-polls-empty">
          <h2>Loading polls…</h2>
        </section>
      ) : loadError ? (
        <section className="resident-polls-empty">
          <div className="resident-polls-empty-icon" aria-hidden="true">!</div>
          <h2>Unable to load polls</h2>
          <p>{loadError}</p>
          <button type="button" className="resident-poll-vote-button resident-polls-retry" onClick={fetchPolls}>
            Try again
          </button>
        </section>
      ) : polls.length === 0 ? (
        <section className="resident-polls-empty">
          <div className="resident-polls-empty-icon" aria-hidden="true">✓</div>
          <span>COMMUNITY POLLS</span>
          <h2>No active polls</h2>
          <p>
            There are no community polls available right now. Published polls will
            appear here when they are opened for voting.
          </p>
        </section>
      ) : (
        <>
          <section className="resident-polls-section">
            <div className="resident-polls-section-heading">
              <div>
                <span>ACTIVE POLLS</span>
                <h2>Open for voting</h2>
              </div>

              <div className="resident-polls-count">{activePolls.length} Active</div>
            </div>

            {activePolls.length === 0 ? (
              <p className="resident-polls-none">No polls are open for voting right now.</p>
            ) : (
              <div className="resident-polls-grid">{activePolls.map(renderPoll)}</div>
            )}
          </section>

          {closedPolls.length > 0 && (
            <section className="resident-polls-section resident-polls-history">
              <div className="resident-polls-section-heading">
                <div>
                  <span>PAST POLLS</span>
                  <h2>Closed polls</h2>
                </div>

                <div className="resident-polls-count">{closedPolls.length} Closed</div>
              </div>

              <div className="resident-polls-grid">{closedPolls.map(renderPoll)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default ResidentPolls;
