match_making creates a room where users are held until the desired amount of players is reached. Or in the case of
a tournament, the host starts the tournament.

it will take the PORT defined in the .env of the docker container or default to port:8080 with a warning

the output will be a list of userId's who will be in the room or tournament.
in the case of a non-tournament, single game it will also send the unique matchId with the users.
in the case of a tournament, it will route the users to the tournament module, which will handle the matches.


## Usage
- **POST /joinRoom**  
  - Expects a `gameMode`, a 'userId' and a 'gameType 
  - Locates or creates a room, adds the user, and attempts to start the game if all required players are present.

- **POST /leaveRoom** 
	-Expects a 'userId' and removes the player from any room they occupy and deletes the room if it becomes empty.


### Inputs

- 'userId':  
	expects a userId in the cookies from the request : TODO: coordinate with the routing module how this is sent

- `gameMode`:
	The selected game mode (e.g., `pong_2`, `pong_3`, `pong_4` `memory`).

- 'gameType':
	'singleGame' or 'tournament'

it expects the input as followed:

	{"action":"joinRoom"/"leaveRoom",
	"payload": {
		"playerId":"",
		"gameMode":"pong_2"/"pong_3"/"pong_4"/"memory",
		"gameType":"singleGame"/"tournament"
		}
	}

It needs the browser to make a connection request for a socket. once established it can send the above request

it uses the values defined in ../.env (MATCH_MAKING_PORT, TOURNAMENT_PORT, GAME_MODULE_PORT) to receive and send data.