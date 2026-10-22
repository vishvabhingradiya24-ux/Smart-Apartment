const { pool } = require("../config/db");
const { ensurePollTables } = require("../utils/pollTables");

// A poll is open while the admin has not closed it and its last day has not passed.
const IS_OPEN_SQL = "(p.status = 'Active' AND p.end_date >= CURDATE())";

const MAX_OPTIONS = 6;

const isValidDateOnly = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const todayText = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
};

// Validates the create / edit form. Returns { error } or the cleaned values.
const readPollBody = (body, { needOptions }) => {
  const question = String(body.question || "").trim();
  const description = String(body.description || "").trim();
  const endDate = body.end_date;

  if (!question) return { error: "Please enter the poll question" };
  if (question.length > 200) return { error: "The question can have at most 200 characters" };
  if (description.length > 1000) return { error: "The description can have at most 1000 characters" };
  if (!isValidDateOnly(endDate)) return { error: "Please choose the last voting date" };

  let options = null;

  if (needOptions) {
    options = (Array.isArray(body.options) ? body.options : [])
      .map((option) => String(option || "").trim())
      .filter(Boolean);

    if (options.length < 2) return { error: "Add at least 2 answer options" };
    if (options.length > MAX_OPTIONS) return { error: `A poll can have at most ${MAX_OPTIONS} options` };
    if (options.some((option) => option.length > 120)) {
      return { error: "Each option can have at most 120 characters" };
    }
    if (new Set(options.map((option) => option.toLowerCase())).size !== options.length) {
      return { error: "The options must be different from each other" };
    }
  }

  return { question, description, endDate, options };
};

const insertOptions = (connection, pollId, options) =>
  Promise.all(
    options.map((option, index) =>
      connection.query(
        "INSERT INTO poll_options (poll_id, option_text, sort_order) VALUES (?, ?, ?)",
        [pollId, option, index]
      )
    )
  );

// Loads polls with their options and vote counts. `residentId` adds that
// resident's own choice to every poll.
const loadPolls = async ({ residentId = null } = {}) => {
  const [polls] = await pool.query(
    `SELECT p.poll_id, p.question, p.description,
            DATE_FORMAT(p.end_date, '%Y-%m-%d') AS end_date,
            p.created_at, ${IS_OPEN_SQL} AS is_open
     FROM polls p
     ORDER BY ${IS_OPEN_SQL} DESC, p.end_date ASC, p.poll_id DESC`
  );

  if (polls.length === 0) return [];

  const ids = polls.map((poll) => poll.poll_id);

  const [options] = await pool.query(
    `SELECT o.option_id, o.poll_id, o.option_text, COUNT(v.vote_id) AS votes
     FROM poll_options o
     LEFT JOIN poll_votes v ON v.option_id = o.option_id
     WHERE o.poll_id IN (?)
     GROUP BY o.option_id
     ORDER BY o.sort_order ASC, o.option_id ASC`,
    [ids]
  );

  let myVotes = [];

  if (residentId) {
    [myVotes] = await pool.query(
      "SELECT poll_id, option_id FROM poll_votes WHERE resident_id = ? AND poll_id IN (?)",
      [residentId, ids]
    );
  }

  return polls.map((poll) => {
    const pollOptions = options
      .filter((option) => option.poll_id === poll.poll_id)
      .map((option) => ({
        option_id: option.option_id,
        option_text: option.option_text,
        votes: Number(option.votes)
      }));

    const totalVotes = pollOptions.reduce((sum, option) => sum + option.votes, 0);

    return {
      poll_id: poll.poll_id,
      question: poll.question,
      description: poll.description,
      end_date: poll.end_date,
      status: poll.is_open ? "Active" : "Closed",
      created_at: poll.created_at,
      total_votes: totalVotes,
      my_vote_option_id: myVotes.find((vote) => vote.poll_id === poll.poll_id)?.option_id || null,
      options: pollOptions.map((option) => ({
        ...option,
        percent: totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100)
      }))
    };
  });
};

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

const getAdminPolls = async (req, res) => {
  try {
    await ensurePollTables();

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM residents WHERE is_active = 1"
    );

    res.status(200).json({ polls: await loadPolls(), total_residents: Number(total) });
  } catch (error) {
    console.error("Admin polls error:", error);
    res.status(500).json({ message: "Unable to load polls" });
  }
};

const createPoll = async (req, res) => {
  let connection;

  try {
    const values = readPollBody(req.body, { needOptions: true });

    if (values.error) return res.status(400).json({ message: values.error });

    if (values.endDate < todayText()) {
      return res.status(400).json({ message: "The last voting date cannot be in the past" });
    }

    await ensurePollTables();

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      "INSERT INTO polls (question, description, end_date, status, created_by) VALUES (?, ?, ?, 'Active', ?)",
      [values.question, values.description || null, values.endDate, req.user?.id || null]
    );

    await insertOptions(connection, result.insertId, values.options);

    await connection.commit();

    res.status(201).json({ message: "Poll created. Residents can vote now.", poll_id: result.insertId });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Create poll error:", error);
    res.status(500).json({ message: "Unable to create the poll" });
  } finally {
    if (connection) connection.release();
  }
};

// Question, description and last date can always change. The answer options can
// only change while nobody has voted, otherwise the votes would lose their meaning.
const updatePoll = async (req, res) => {
  let connection;

  try {
    await ensurePollTables();

    const [polls] = await pool.query(
      "SELECT DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date FROM polls WHERE poll_id = ?",
      [req.params.id]
    );

    if (polls.length === 0) return res.status(404).json({ message: "Poll not found" });

    const [[{ votes }]] = await pool.query(
      "SELECT COUNT(*) AS votes FROM poll_votes WHERE poll_id = ?",
      [req.params.id]
    );

    const hasVotes = Number(votes) > 0;
    const values = readPollBody(req.body, { needOptions: !hasVotes });

    if (values.error) return res.status(400).json({ message: values.error });

    if (values.endDate !== polls[0].end_date && values.endDate < todayText()) {
      return res.status(400).json({ message: "The last voting date cannot be in the past" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query(
      "UPDATE polls SET question = ?, description = ?, end_date = ? WHERE poll_id = ?",
      [values.question, values.description || null, values.endDate, req.params.id]
    );

    if (!hasVotes) {
      await connection.query("DELETE FROM poll_options WHERE poll_id = ?", [req.params.id]);
      await insertOptions(connection, req.params.id, values.options);
    }

    await connection.commit();

    res.status(200).json({ message: "Poll updated" });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Update poll error:", error);
    res.status(500).json({ message: "Unable to update the poll" });
  } finally {
    if (connection) connection.release();
  }
};

const closePoll = async (req, res) => {
  try {
    await ensurePollTables();

    const [result] = await pool.query(
      "UPDATE polls SET status = 'Closed' WHERE poll_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json({ message: "Poll closed. Residents can no longer vote." });
  } catch (error) {
    console.error("Close poll error:", error);
    res.status(500).json({ message: "Unable to close the poll" });
  }
};

const reopenPoll = async (req, res) => {
  try {
    await ensurePollTables();

    const [polls] = await pool.query(
      "SELECT DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date FROM polls WHERE poll_id = ?",
      [req.params.id]
    );

    if (polls.length === 0) return res.status(404).json({ message: "Poll not found" });

    if (polls[0].end_date < todayText()) {
      return res.status(400).json({ message: "The last voting date has passed. Edit the poll and choose a new date first." });
    }

    await pool.query("UPDATE polls SET status = 'Active' WHERE poll_id = ?", [req.params.id]);

    res.status(200).json({ message: "Poll reopened. Residents can vote again." });
  } catch (error) {
    console.error("Reopen poll error:", error);
    res.status(500).json({ message: "Unable to reopen the poll" });
  }
};

const deletePoll = async (req, res) => {
  try {
    await ensurePollTables();

    const [result] = await pool.query("DELETE FROM polls WHERE poll_id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json({ message: "Poll deleted" });
  } catch (error) {
    console.error("Delete poll error:", error);
    res.status(500).json({ message: "Unable to delete the poll" });
  }
};

// ---------------------------------------------------------------------------
// Resident
// ---------------------------------------------------------------------------

// Staff and admin tokens carry a role; resident tokens do not.
const residentOnly = (req, res) => {
  if (req.user?.role || !req.user?.id) {
    res.status(403).json({ message: "Only residents can use polls" });
    return false;
  }

  return true;
};

const getResidentPolls = async (req, res) => {
  try {
    if (!residentOnly(req, res)) return;

    await ensurePollTables();

    const polls = await loadPolls({ residentId: req.user.id });

    // Results stay hidden until the resident has voted or the poll has ended,
    // so nobody is influenced by the running totals.
    res.status(200).json({
      polls: polls.map((poll) => {
        const showResults = poll.status === "Closed" || poll.my_vote_option_id !== null;

        return {
          ...poll,
          show_results: showResults,
          options: poll.options.map((option) =>
            showResults ? option : { option_id: option.option_id, option_text: option.option_text }
          ),
          total_votes: showResults ? poll.total_votes : undefined
        };
      })
    });
  } catch (error) {
    console.error("Resident polls error:", error);
    res.status(500).json({ message: "Unable to load polls" });
  }
};

const votePoll = async (req, res) => {
  try {
    if (!residentOnly(req, res)) return;

    const optionId = Number(req.body.option_id);

    if (!Number.isInteger(optionId) || optionId <= 0) {
      return res.status(400).json({ message: "Please choose an answer" });
    }

    await ensurePollTables();

    const [residents] = await pool.query(
      "SELECT id FROM residents WHERE id = ? AND is_active = 1",
      [req.user.id]
    );

    if (residents.length === 0) {
      return res.status(403).json({ message: "Only active residents can vote" });
    }

    const [polls] = await pool.query(
      `SELECT p.poll_id, ${IS_OPEN_SQL} AS is_open FROM polls p WHERE p.poll_id = ?`,
      [req.params.id]
    );

    if (polls.length === 0) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (!polls[0].is_open) {
      return res.status(400).json({ message: "Voting for this poll has ended" });
    }

    const [options] = await pool.query(
      "SELECT option_id FROM poll_options WHERE option_id = ? AND poll_id = ?",
      [optionId, polls[0].poll_id]
    );

    if (options.length === 0) {
      return res.status(400).json({ message: "That answer does not belong to this poll" });
    }

    // One vote per resident per poll is enforced by the unique key (poll_id, resident_id).
    try {
      await pool.query(
        "INSERT INTO poll_votes (poll_id, option_id, resident_id) VALUES (?, ?, ?)",
        [polls[0].poll_id, optionId, req.user.id]
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "You have already voted in this poll" });
      }

      throw error;
    }

    res.status(201).json({ message: "Your vote has been recorded" });
  } catch (error) {
    console.error("Vote poll error:", error);
    res.status(500).json({ message: "Unable to record your vote" });
  }
};

module.exports = {
  getAdminPolls,
  createPoll,
  updatePoll,
  closePoll,
  reopenPoll,
  deletePoll,
  getResidentPolls,
  votePoll
};
