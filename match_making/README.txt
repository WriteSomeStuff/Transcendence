match_making creates a room where users are held until the desired amount of players is reached. Or in the case of
a tournament, the host starts the tournament.

it will take the PORT defined in the env of the docker container or default to port:8080 with a warning

the output will be a list of userId's who will be in the room or tournament.
in the case of a non-tournament, single game it will also send the unique matchId with the users.
in the case of a tournament, it will route the users to the tournament module, which will handle the unique matches.
the unique matchId had to be made here because the tournament needs it to keep track of which matches are played.
the single game matchId is created here for the uniformity of the API of the game module


## Usage
- **POST /joinRoom**  
  - Expects a `gameMode` in form data (e.g., `pong_2`).  
  - Locates or creates a room, adds the user, and attempts to start the game if all required players are present.

- **POST /leaveRoom**  
  - Removes the player from any room they occupy and deletes the room if it becomes empty.

- **POST /joinTournament**  
  - Expects a `gameMode` in form data (e.g., `pong_2`).  
  - Locates or creates a tournament room, adds the user. The first player becomes the host.
  - Tournament rooms can hold up to 64 players and require the host to manually start the tournament.

- **POST /leaveTournament**  
  - Removes the player from any tournament room they occupy.
  - If the host leaves, assigns a new host from remaining players.
  - Deletes the tournament room if it becomes empty.

### Inputs

- userId:  
  - expects a userId in the cookies from the request : TODO: coordinate with the routing module how this is sent
- Form data (for `/joinRoom`):  
  - `gameMode`: The selected game mode (e.g., `pong_2`, `memory`).




