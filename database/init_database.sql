-- Create tables.

CREATE TABLE IF NOT EXISTS user (
	user_id			INTEGER	PRIMARY KEY,
	username		TEXT	NOT NULL	UNIQUE, -- index
	password_hash	TEXT	NOT NULL,
	created_at		TEXT	DEFAULT datetime('now', 'localtime'),
	last_login		TEXT,
	profile_picture	BLOB,
	account_status	TEXT
);

CREATE TABLE IF NOT EXISTS match_state (
	match_id		INTEGER	PRIMARY KEY, -- index
	match_date		TEXT	DEFAULT datetime('now', 'localtime'),
	match_status	TEXT,
	last_updated	TEXT	DEFAULT datetime('now', 'localtime'),
	winner_id		INTEGER,
	tournament_id	INTEGER, -- index
	
	FOREIGN KEY (tournament_id) REFERENCES tournament(tournament_id)
);

CREATE TABLE IF NOT EXISTS match_participant (
	match_id	INTEGER	NOT NULL, -- composite index
	user_id		INTEGER	NOT NULL, -- composite index
	
	FOREIGN KEY (match_id) REFERENCES match_state(match_id),
	FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE IF NOT EXISTS score (
	score_id	INTEGER	PRIMARY KEY,
	match_id	INTEGER, -- index
	user_id		INTEGER, -- index
	score		INTEGER	DEFAULT 0; \

	FOREIGN KEY (match_id) REFERENCES match_state(match_id),
	FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE IF NOT EXISTS tournament (
	tournament_id		INTEGER	PRIMARY KEY,
	tournament_name		TEXT,
	created_at			TEXT	DEFAULT datetime('now', 'localtime'),
	tournament_status	TEXT	DEFAULT "ongoing" -- index maybe if queried often
);


CREATE TABLE IF NOT EXISTS game_history (
	match_id		INTEGER	PRIMARY KEY, -- index
	match_date		TEXT, -- get from match_state when finished
	winner_id		INTEGER, -- get from match_state when finished
	tournament_id	INTEGER,

	FOREIGN KEY (match_id) REFERENCES match_state(match_id),
	FOREIGN KEY (tournament_id) REFERENCES tournament(tournament_id)
);

CREATE TABLE IF NOT EXISTS user_statistics (
	user_id				INTEGER	PRIMARY KEY, -- index
	total_games_played	INTEGER	DEFAULT 0,
	total_wins			INTEGER	DEFAULT 0,
	total_losses		INTEGER	DEFAULT 0,
	win_rate			REAL	default 0, -- add TRIGGER (when games_played is updated): in % -> total_wins / total_games_played * 100
	total_score			INTEGER default 0,
	average_score		INTEGER	DEFAULT 0, -- add TRIGGER (when games_played is updated): ROUND(total_score / total_games_played)
	
	FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- Set indexes.

-- Set triggers.