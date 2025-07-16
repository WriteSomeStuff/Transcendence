export const fetchUserIdByUsername = async (username: string): Promise<number> => {
	const url = process.env['USER_SERVICE_URL'] + '/get-userid?username=' + encodeURIComponent(username);
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const data = await response.json() as { success: boolean, userId?: number, error?: string };

	if (data.success && typeof data.userId === "number") {
		return data.userId;
	} else {
		throw new Error("User not found");
	}
}

export const fetchUsernameByUserId = async (userId: number): Promise<string> => {
	const url = process.env['USER_SERVICE_URL'] + '/get-username?userId=' + encodeURIComponent(userId);
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const data = await response.json() as { success: boolean, username?: string, error?: string };

	if (data.success && typeof data.username === "string") {
		return data.username;
	} else {
		throw new Error("Username not found");
	}
}