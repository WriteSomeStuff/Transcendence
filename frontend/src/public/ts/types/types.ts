export interface Friend {
	friendshipId:	number;
	userId:			number;
	username:		string;
	accountStatus:	string;
}

export interface FriendListResponse {
	success: boolean,
	data?: Friend[],
	error?: string
}