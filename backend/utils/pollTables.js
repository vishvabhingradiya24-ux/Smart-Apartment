const { pool } = require("../config/db");

// Polls & Voting tables. They are created the first time the polls feature is
// used, so nobody has to run a separate SQL file after pulling the code.

let ready = null;

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS polls (
      poll_id INT NOT NULL AUTO_INCREMENT,
      question VARCHAR(200) NOT NULL,
      description TEXT NULL,
      end_date DATE NOT NULL,
      status ENUM('Active', 'Closed') NOT NULL DEFAULT 'Active',
      created_by INT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (poll_id)
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS poll_options (
      option_id INT NOT NULL AUTO_INCREMENT,
      poll_id INT NOT NULL,
      option_text VARCHAR(120) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      PRIMARY KEY (option_id),
      CONSTRAINT fk_poll_options_poll FOREIGN KEY (poll_id) REFERENCES polls (poll_id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS poll_votes (
      vote_id INT NOT NULL AUTO_INCREMENT,
      poll_id INT NOT NULL,
      option_id INT NOT NULL,
      resident_id INT NOT NULL,
      voted_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (vote_id),
      UNIQUE KEY uq_poll_votes_resident (poll_id, resident_id),
      CONSTRAINT fk_poll_votes_poll FOREIGN KEY (poll_id) REFERENCES polls (poll_id) ON DELETE CASCADE,
      CONSTRAINT fk_poll_votes_option FOREIGN KEY (option_id) REFERENCES poll_options (option_id) ON DELETE CASCADE,
      CONSTRAINT fk_poll_votes_resident FOREIGN KEY (resident_id) REFERENCES residents (id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);
};

const ensurePollTables = () => {
  if (!ready) {
    ready = createTables().catch((error) => {
      ready = null;
      throw error;
    });
  }

  return ready;
};

module.exports = { ensurePollTables };
