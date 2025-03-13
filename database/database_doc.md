# Database Schema Documentation

## Overview
This documentation provides a detailed description of the database schema for the Pong game application. It includes information about tables, columns, relationships, and example queries.
## Tables

### User Table
**Purpose**: Stores user account information.
| **Columns** | **Type** | **Constraints** | **Description** | **Default** | **Options** |
| --- | --- | --- | --- | --- | --- |
| `user_id`         | INTEGER    | PRIMARY KEY     | Unique identifier for the user     | | |
| `username`        | TEXT       | NOT NULL, UNIQUE| Username of the user               | | |
| `password_hash`   | TEXT       | NOT NULL        | Hashed password of the user        | | |
| `created_at`      | TEXT       |                 | Account creation timestamp 		| datetime('now', 'localtime') | |
| `last_login`      | TEXT       |                 | Last login timestamp               | | |
| `profile_picture` | BLOB       |                 | Profile picture of the user        | | |
| `account_status`  | TEXT       |                 | Status of the user account         | | 'online', 'offline', 'suspended', 'banned' |

### Match State Table
**Purpose**: Stores information about each match.
| **Columns** | **Type** | **Constraints** | **Description** | **Default** | **Options** |
| --- | --- | --- | --- | --- | --- |
| `match_id`        | INTEGER    | PRIMARY KEY     | Unique identifier for the match    | | |
| `match_date`      | TEXT       |                 | Date of the match 					| datetime('now', 'localtime') | |
| `match_status`    | TEXT       |                 | Status of the match                | | 'ongoing', 'finished' |
| `last_updated`    | TEXT       |                 | Last updated timestamp 			| datetime('now', 'localtime') | |
| `winner_id`       | INTEGER    |                 | Identifier of the winning user     | | |
| `tournament_id`   | INTEGER    | FOREIGN KEY     | Identifier of the related tournament| | |

### Match Participant Table
**Purpose**: Stores information about participants in each match.
| **Columns** | **Type** | **Constraints** | **Description** | **Default** | **Options** |
| --- | --- | --- | --- | --- | --- |
| `match_id`        | INTEGER    | NOT NULL, FOREIGN KEY        | Identifier of the match            | | |
| `user_id`         | INTEGER    | NOT NULL, FOREIGN KEY        | Identifier of the user             | | |

### Score Table
**Purpose**: Stores amount of points for a user in a match.
| **Columns** | **Type** | **Constraints** | **Description** | **Default** | **Options** |
| --- | --- | --- | --- | --- | --- |
| `score_id`        | INTEGER    | PRIMARY KEY     | Unique identifier for the score    | | |
| `match_id`        | INTEGER    | FOREIGN KEY     | Identifier of the match            | | |
| `user_id`         | INTEGER    | FOREIGN KEY     | Identifier of the user             | | |
| `points`           | INTEGER    |                 | Points of the user 				    | 0 | |

### Tournament Table
**Purpose**: Stores information about tournaments.
| **Columns** | **Type** | **Constraints** | **Description** | **Default** | **Options** |
| --- | --- | --- | --- | --- | --- |
| `tournament_id`           | INTEGER    | PRIMARY KEY     | Unique identifier for the tournament| | |
| `tournament_name`         | TEXT       |                 | Name of the tournament             | | |
| `created_at`              | TEXT       |                 | Tournament creation timestamp 		| datetime('now', 'localtime') | |
| `tournament_status`       | TEXT       |                 | Status of the tournament 			| "ongoing" | 'ongoing', 'finished' |

### Game History Table
**Purpose**: Stores historical data of finished matches.
| **Columns** | **Type** | **Constraints** | **Description** | **Default** | **Options** |
| --- | --- | --- | --- | --- | --- |
| `match_id`        | INTEGER    | PRIMARY KEY, FOREIGN KEY     | Unique identifier for the match    | | |
| `match_date`      | TEXT       |                 | Date of the match                  | | |
| `winner_id`       | INTEGER    |                 | Identifier of the winning user     | | |
| `tournament_id`   | INTEGER    | FOREIGN KEY                | Identifier of the related tournament| | |

### User Statistics Table
**Purpose**: Stores statistical data for users.
| **Columns** | **Type** | **Constraints** | **Description** | **Default** | **Options** |
| --- | --- | --- | --- | --- | --- |
| `user_id`                 | INTEGER    | PRIMARY KEY, FOREIGN KEY     | Unique identifier for the user     | | |
| `total_games_played`      | INTEGER    |                 | Total number of games played 		| 0 | |
| `total_wins`              | INTEGER    |                 | Total number of wins 				| 0 | |
| `total_losses`            | INTEGER    |                 | Total number of losses 			| 0 | |
| `win_rate`                | REAL       |                 | Win rate of the user 				| 0 | |
| `total_points`             | INTEGER    |                 | Total points of the user 			| 0 | |
| `average_points_per_match`           | INTEGER    |                 | Average points of the user 			| 0 | |

#### Notes
- Dates in TEXT type as ISO-8601 string (e.g., YYYY-MM-DD HH:MM:SS)

## Indexes
**Purpose**: Helps improve query performance. Normal lookup is on `rowid` (INTEGER PRIMARY KEY) with relationship: (rowid, row). Index adds an opposite relationship: (row, rowid). SQLite uses a Balanced-tree (B-tree) structure to organize indexes, assuring the amount of data is balanced on both sides. Therefore the number of levels traversed to locate a row is always the same approximate number. So the index gets added to the B-tree structure, ensuring faster query performance on this row.
| **Table** | **Indexed Column** |
| --- | --- |
| user | `username` |
| match_state | `tournament_id` |
| match_participant | `match_id`, `user_id` |
| score | `match_id`, `user_id` |
| tournament | `tournament_status` |
| game_history | `match_id` |
| game_history | `tournament_id` |
| user_statistics | `user_id` |

## Triggers
**Purpose**: Data (Table: Updated Column) gets automattically update with certain conditions (When). 
| **Table** | **Updated Column** | **When** |
| --- | --- | --- |
| game_history | all | game_state.match_status = 'completed' |
| game_state | `last_updated` | UPDATE on any column |
| user_statistics | all | game_state.match_status = 'completed' |

#### Notes

---

### Relationships (Foreign Keys)
- Foreign keys describe how tables are related. Any value inserted into the foreign key column of one table MUST exist in the referenced table.
	- Example: `match_id` in *match_history* table must exist in `match_id` in *match_state* table since it's a foreign key to this column. 
		```sql 
		FOREIGN KEY (match_id) REFERENCES match_state(match_id) [ON DELETE CASCADE];
- A record in *match_state* can't be deleted if it has corresponding records through a foreign key elsewhere.</br>
- ON DELETE CASCADE or ON UPDATE CASCADE: updates foreign keys automatically if refrenced column is deleted or updated.

### Example Queries
- **Retrieve User Information**:
  ```sql
  SELECT * FROM user WHERE username = tymon;