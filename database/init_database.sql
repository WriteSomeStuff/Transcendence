-- CREATE TABLES

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
	score		INTEGER	DEFAULT 0,
	
	PRIMARY KEY (match_id, user_id),
	FOREIGN KEY (match_id) REFERENCES match_state(match_id),
	FOREIGN KEY (user_id) REFERENCES user(user_id)
);


CREATE TABLE IF NOT EXISTS tournament (
	tournament_id		INTEGER	PRIMARY KEY,
	tournament_name		TEXT,
	created_at			TEXT	DEFAULT (datetime('now', 'localtime')),
	tournament_status	TEXT	DEFAULT "ongoing"
);

-- INDEXES

CREATE INDEX idx_user_username ON user(username);

CREATE INDEX idx_match_state_tournament_id ON match_state(tournament_id);

CREATE INDEX idx_tournament_tournament_status ON tournament(tournament_status);


-- TRIGGERS

-- Update last_updated in match_state.
CREATE TRIGGER IF NOT EXISTS update_last_updated_match
	AFTER UPDATE ON match_state
	FOR EACH ROW
BEGIN
	UPDATE match_state
	SET last_updated = (datetime('now', 'localtime'))
	WHERE rowid = NEW.rowid;
END;


-- VIEWS

-- match winner view
CREATE VIEW IF NOT EXISTS match_winner AS
SELECT
	ms.match_id,
	ms.match_date,
	ms.tournament_id,
	mp.user_id AS winner_id, -- AS renames the column name in the view (to clarify)
	u.username AS winner_name
FROM
	match_state ms -- create alias ms for readability
JOIN
	match_participant mp ON ms.match_id = mp.match_id -- only get the rows where match ids match
JOIN
	user u ON mp.user_id = u.user_id
WHERE
	ms.match_status = 'completed'
	AND mp.score = (
		SELECT MAX(score)
		FROM match_participant mp
		WHERE ms.match_id = mp.match_id
	);

-- SELECT
-- 	[columns you want in the final table]
-- FROM
-- 	[table to get the colums from]
-- JOIN
-- 	[join a table (table2) to get more columns from table2 accorinding to corresponding data]
-- WHERE
-- 	[constraints]

/** TODO
* user_statistics -> view
* update documentation: views
*/