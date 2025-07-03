import { acceptFriendRequestHandler } from "../userController";

export interface UserObj {
	user_id: number;
	username: string;
	created_at: string;
	last_login: string;
	avatar_url: string;
	account_status: string;
}

export interface FriendRequest {
	friendship_id:	number;
	user_id:		number;
	friend_id:		number;
	accepted:		boolean;
}