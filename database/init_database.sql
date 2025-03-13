-- CREATE TABLES

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
	points		INTEGER	DEFAULT 0,

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
	match_date		TEXT,
	winner_id		INTEGER,
	tournament_id	INTEGER,

	FOREIGN KEY (match_id) REFERENCES match_state(match_id), 			-- Maybe not make foreign key so game_state gets deleted
	FOREIGN KEY (tournament_id) REFERENCES tournament(tournament_id)	-- same story with this one, maybe make tournament history table?
);

CREATE TABLE IF NOT EXISTS user_statistics (
	user_id							INTEGER	PRIMARY KEY,
	total_games_played				INTEGER	DEFAULT 0,
	total_wins						INTEGER	DEFAULT 0,
	total_losses					INTEGER	DEFAULT 0,
	win_rate						REAL	DEFAULT 0,
	total_points					INTEGER DEFAULT 0,
	average_points_per_match		INTEGER	DEFAULT 0,
	
	FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- INDEXES

CREATE INDEX idx_user_username ON user (username);

CREATE INDEX idx_match_state_tournament_id ON match_state (tournament_id);

CREATE INDEX idx_match_participant_match_id_user_id ON match_participant (match_id, user_id);

CREATE INDEX idx_points_match_id ON points (match_id, user_id);

CREATE INDEX idx_tournament_tournament_status ON tournament (tournament_status);

CREATE INDEX idx_game_history_match_id ON game_history (match_id);
CREATE INDEX idx_game_history_tournament_id ON game_history (tournament_id);

CREATE INDEX idx_user_statistics_user_id ON user_statistics (user_id);

-- TRIGGERS

-- Create game_history row when game_state is created.
CREATE TRIGGER IF NOT EXISTS fill_game_history_row
	AFTER UPDATE OF match_status ON match_state
	FOR EACH ROW
	WHEN NEW.match_status = 'completed'
BEGIN
	UPDATE game_history
	INSERT OR REPLACE INTO game_history (match_id, match_date, winner_id, tournament_id)
	VALUES (NEW.match_id, NEW.match_date, NEW.winner_id, NEW.tournament_id);
END;

-- Update last_updated in match_state.
CREATE TRIGGER IF NOT EXISTS update_last_updated_match
	AFTER UPDATE ON game_state
	FOR EACH ROW
BEGIN
	UPDATE game_state
	SET last_updated = datetime('now', 'localtime')
	WHERE rowid = NEW.rowid;
END;

-- Update user_statistics when a match where this user participated in finishes
CREATE TRIGGER IF NOT EXISTS update_user_statistics
	AFTER UPDATE OF match_status ON match_state
	FOR EACH ROW
	WHEN NEW.match_status = 'completed'
BEGIN
	FOR EACH ROW IN
	(SELECT user_id FROM match_participant WHERE match_id = NEW.match_id)
	BEGIN
		UPDATE user_statistics
		SET
			total_games_played = total_games_played + 1,
			total_wins = total_wins + CASE WHEN NEW.winner_id = user_id THEN 1 ELSE 0 END,
			total_losses = total_losses + CASE WHEN NEW.winner_id = user_id THEN 0 ELSE 1 END,
			total_points = total_points + (SELECT points FROM score WHERE match_id = NEW.match_id AND user_id = user_id),
			win_rate =	CASE
							WHEN total_games_played = 0 THEN 0
							ELSE round(total_points / total_games_played)
						END,
			average_points_per_match =	CASE
											WHEN total_games_played = 0 THEN 0
											ELSE round(total_points / total_games_played)
										END
		WHERE user_id = user_id;
	END;
END;