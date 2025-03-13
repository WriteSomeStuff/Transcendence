-- Create tables.

CREATE TABLE IF NOT EXISTS user (
	user_id			INTEGER	PRIMARY KEY,
	username		TEXT	NOT NULL	UNIQUE,
	password_hash	TEXT	NOT NULL,
	created_at		TEXT	DEFAULT datetime('now', 'localtime'),
	last_login		TEXT,
	profile_picture	BLOB,
	account_status	TEXT
);

CREATE TABLE IF NOT EXISTS match_state (
	match_id		INTEGER	PRIMARY KEY,
	match_date		TEXT	DEFAULT datetime('now', 'localtime'),
	match_status	TEXT,
	last_updated	TEXT	DEFAULT datetime('now', 'localtime'),
	winner_id		INTEGER,
	tournament_id	INTEGER,
	
	FOREIGN KEY (tournament_id) REFERENCES tournament(tournament_id)
);

CREATE TABLE IF NOT EXISTS match_participant (
	match_id	INTEGER	NOT NULL,
	user_id		INTEGER	NOT NULL,
	
	FOREIGN KEY (match_id) REFERENCES match_state(match_id),
	FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE IF NOT EXISTS score (
	score_id	INTEGER	PRIMARY KEY,
	match_id	INTEGER,
	user_id		INTEGER,
	score		INTEGER	DEFAULT 0,

	FOREIGN KEY (match_id) REFERENCES match_state(match_id),
	FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE IF NOT EXISTS tournament (
	tournament_id		INTEGER	PRIMARY KEY,
	tournament_name		TEXT,
	created_at			TEXT	DEFAULT datetime('now', 'localtime'),
	tournament_status	TEXT	DEFAULT "ongoing"
);


CREATE TABLE IF NOT EXISTS game_history (
	match_id		INTEGER	PRIMARY KEY,
	match_date		TEXT, -- get from match_state when finished
	winner_id		INTEGER, -- get from match_state when finished
	tournament_id	INTEGER,

	FOREIGN KEY (match_id) REFERENCES match_state(match_id),
	FOREIGN KEY (tournament_id) REFERENCES tournament(tournament_id)
);

CREATE TABLE IF NOT EXISTS user_statistics (
	user_id				INTEGER	PRIMARY KEY,
	total_games_played	INTEGER	DEFAULT 0,
	total_wins			INTEGER	DEFAULT 0,
	total_losses		INTEGER	DEFAULT 0,
	win_rate			REAL	default 0, -- add TRIGGER (when games_played is updated): in % -> total_wins / total_games_played * 100
	total_score			INTEGER default 0,
	average_score		INTEGER	DEFAULT 0, -- add TRIGGER (when games_played is updated): ROUND(total_score / total_games_played)
	
	FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- Set indexes for more efficient lookups.

CREATE INDEX idx_user_username ON user (username);

CREATE INDEX idx_match_state_tournament_id ON match_state (tournament_id);

CREATE INDEX idx_match_participant_match_id_user_id ON match_participant (match_id, user_id);

CREATE INDEX idx_score_match_id ON score (match_id, user_id);

CREATE INDEX idx_tournament_tournament_status ON tournament (tournament_status);

CREATE INDEX idx_game_history_match_id ON game_history (match_id);
CREATE INDEX idx_game_history_tournament_id ON game_history (tournament_id);

CREATE INDEX idx_user_statistics_user_id ON user_statistics (user_id);

-- Set triggers.

-- Update win_rate if either total_games_played or total_wins is updated.
CREATE TRIGGER IF NOT EXISTS update_win_rate_games_played
	AFTER UPDATE OF total_games_played ON user_statistics
BEGIN
	UPDATE user_statistics
	SET win_rate =	CASE
						WHEN total_games_played = 0 THEN 0
						ELSE (total_wins / total_games_played) * 100
					END
	WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER IF NOT EXISTS update_win_rate_total_wins
	AFTER UPDATE OF total_wins ON user_statistics
BEGIN
	UPDATE user_statistics
	SET win_rate =	CASE
						WHEN total_games_played = 0 THEN 0
						ELSE (total_wins / total_games_played) * 100
					END
	WHERE user_id = NEW.user_id;
END;

-- Update average_score if either total_games_played or total_score is updated.
CREATE TRIGGER IF NOT EXISTS update_average_score_total_games
	AFTER UPDATE OF total_games_played ON user_statistics
BEGIN
	UPDATE user_statistics
	SET average_score =	CASE
							WHEN total_games_played = 0 THEN 0
							ELSE round(total_score / total_games_played)
						END
	WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER IF NOT EXISTS update_average_score_total_score
	AFTER UPDATE OF total_score ON user_statistics
BEGIN
	UPDATE user_statistics
	SET average_score =	CASE
							WHEN total_games_played = 0 THEN 0
							ELSE round(total_score / total_games_played)
						END
	WHERE user_id = NEW.user_id;
END;