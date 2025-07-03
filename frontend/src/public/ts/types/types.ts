export interface Friend {
	friendshipId:	number;
	friendId:		number;
	accountStatus:	string;
}

export interface FriendListResponse {
	success: boolean,
	data?: Friend[],
	error?: string
}