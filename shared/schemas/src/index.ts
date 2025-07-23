export {
  Vector2Schema,
  PaddleStateSchema,
  CourtStateSchema,
  CourtGeometrySchema,
  CourtSchema,
  PongPlayerInputSchema,
} from "./game/pong_schemas.js";
export type {
  Vector2,
  PaddleState,
  CourtState,
  CourtGeometry,
  Court,
  PongPlayerInput,
} from "./game/pong_schemas.js";
export {
  RegisterSchema,
  LoginSchema,
  AuthResultSchema,
  Enable2FAResultSchema,
} from "./auth_schemas.js";
export type {
  Credentials,
  AuthResult,
  Enable2FAResult,
} from "./auth_schemas.js";
export {
  UserIdSchema,
  UserSchema,
  FriendSchema,
  FriendListResponseSchema,
  FriendRequestListResponseSchema,
	HistorySchema,
  HistoryResponseSchema
} from "./user_schemas.js";
export type {
  UserId,
  User,
  Friend,
  FriendListResponse,
  Friendship,
	MatchHistory
} from "./user_schemas.js";
export {
  RoomPermissionsSchema,
  RoomGameDataSchema,
  RoomSchema,
  MatchmakingMessageSchema,
} from "./matchmaking_schemas.js";
export type {
  RoomPermissions,
  RoomGameData,
  Room,
  MatchmakingMessage,
} from "./matchmaking_schemas.js";
export { GameInputMessageSchema, GameUpdateMessageSchema, MatchResultSchema } from "./game.js";
export type { GameInputMessage, GameUpdateMessage, MatchResult } from "./game.js";
