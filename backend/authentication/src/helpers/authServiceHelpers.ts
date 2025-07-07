export const fetchUserIdByUsername = async (username: string): Promise<number> => {
	const url = process.env["USER_SERVICE_URL"] + '/get-username?username=' + encodeURIComponent(username);
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const data = await response.json() as { success: boolean, user_id?: number, error?: string };

	if (data.success && typeof data.user_id === "number") {
		return data.user_id;
	} else {
		throw new Error("User not found");
	}
}