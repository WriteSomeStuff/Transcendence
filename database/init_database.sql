-- CREATE TABLES ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user (
	user_id			INTEGER	PRIMARY KEY,
	username		TEXT	NOT NULL	UNIQUE,
	password_hash	TEXT	NOT NULL,
	created_at		TEXT	DEFAULT (datetime('now', 'localtime')),
	last_login		TEXT,
	profile_picture	BLOB,
	account_status	TEXT
);

CREATE TABLE IF NOT EXISTS match_state (
	match_id		INTEGER	PRIMARY KEY,
	match_date		TEXT	DEFAULT (datetime('now', 'localtime')),
	match_status	TEXT,
	last_updated	TEXT	DEFAULT (datetime('now', 'localtime')),
	tournament_id	INTEGER,
	
	FOREIGN KEY (tournament_id) REFERENCES tournament(tournament_id)
);

CREATE TABLE IF NOT EXISTS match_participant (
	match_id	INTEGER	NOT NULL,
	user_id		INTEGER	NOT NULL,
	score		INTEGER	DEFAULT (0),
	
	PRIMARY KEY (match_id, user_id),
	FOREIGN KEY (match_id) REFERENCES match_state(match_id),
	FOREIGN KEY (user_id) REFERENCES user(user_id)
);


CREATE TABLE IF NOT EXISTS tournament (
	tournament_id		INTEGER	PRIMARY KEY,
	tournament_name		TEXT,
	created_at			TEXT	DEFAULT (datetime('now', 'localtime')),
	tournament_status	TEXT	DEFAULT ("ongoing")
);

-- INDEXES ---------------------------------------------------------------------

CREATE INDEX idx_user_username ON user(username);

CREATE INDEX idx_match_state_tournament_id ON match_state(tournament_id);

CREATE INDEX idx_tournament_tournament_status ON tournament(tournament_status);

-- TRIGGERS --------------------------------------------------------------------

-- Update last_updated in match_state.
CREATE TRIGGER IF NOT EXISTS update_last_updated_match
	AFTER UPDATE ON match_state
	FOR EACH ROW
BEGIN
	UPDATE match_state
	SET last_updated = (datetime('now', 'localtime'))
	WHERE rowid = NEW.rowid;
END;

-- VIEWS -----------------------------------------------------------------------

-- Match winner view.
CREATE VIEW IF NOT EXISTS match_winner AS
SELECT
	ms.match_id,
	ms.match_date,
	ms.tournament_id,
	mp.user_id AS winner_id,
	u.username AS winner_name
FROM
	match_state ms
JOIN
	match_participant mp ON ms.match_id = mp.match_id
JOIN
	user u ON mp.user_id = u.user_id
WHERE
	ms.match_status = 'completed'
	AND mp.score = (
		SELECT MAX(score)
		FROM match_participant mp
		WHERE ms.match_id = mp.match_id
	);

-- Wins per user view.
CREATE VIEW IF NOT EXISTS wins_per_user AS
SELECT
	winner_id,
	COUNT(*) AS total_wins
FROM
	match_winner mw
GROUP BY
	winner_id;

-- Match history
CREATE VIEW IF NOT EXISTS match_history AS
SELECT
	ms.match_id,
    ms.match_date,
    ms.tournament_id,
	mp1.user_id AS p1_id,
    u1.username AS p1_name,
    mp1.score AS p1_score,
	mp2.user_id AS p2_id,
    u2.username AS p2_name,
    mp2.score AS p2_score,
    CASE
    	WHEN mp1.score > mp2.score THEN u1.user_id
        ELSE u2.user_id
    END AS winner_id,
    CASE
    	WHEN mp1.score > mp2.score THEN u1.username
        ELSE u1.username
    END AS winner_name
FROM
	match_participant mp1
JOIN
	match_participant mp2 ON mp1.match_id = mp2.match_id
    AND mp1.user_id < mp2.user_id
JOIN
	user u1 ON mp1.user_id = u1.user_id
JOIN
	user u2 ON mp2.user_id = u2.user_id
JOIN
	match_state ms USING (match_id)
WHERE
	ms.match_status = 'completed';

-- User statistics view.
CREATE VIEW IF NOT EXISTS user_statistics AS
WITH basic_user_stats as (
	SELECT
		mp.user_id,
		COUNT(DISTINCT mp.match_id) AS total_matches_played,
		COALESCE(wpu.total_wins, 0) AS total_wins,
		SUM(mp.score) AS total_score
	FROM
		match_participant mp
	LEFT JOIN
		wins_per_user wpu ON mp.user_id = wpu.winner_id
	JOIN
		match_state ms USING (match_id)
	WHERE
		ms.match_status = 'completed'
	GROUP BY
		mp.user_id
)
SELECT
	u.user_id,
	u.username,
	COALESCE(bus.total_matches_played, 0) AS total_matches_played,
	COALESCE(bus.total_wins, 0) AS total_wins,
	COALESCE(bus.total_matches_played - bus.total_wins, 0) AS total_losses,
	CASE
		WHEN bus.total_matches_played THEN CAST(bus.total_wins AS REAL) / bus.total_matches_played * 100
		ELSE 0.0
	END AS win_rate,
	COALESCE(bus.total_score, 0) AS total_score,
	CASE
		WHEN bus.total_matches_played THEN bus.total_score / bus.total_matches_played
		ELSE 0
	END AS average_score
FROM
	user u
LEFT JOIN basic_user_stats bus USING (user_id);
-- ORDER BY bus.total_wins DESC;


-- User match history get from match history

-- Ongoing matches.

/** TODO
* update documentation: views
*/