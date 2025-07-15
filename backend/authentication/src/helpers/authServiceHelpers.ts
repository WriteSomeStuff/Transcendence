export const fetchUserIdByUsername = async (username: string): Promise<number> => {
	const url = process.env['USER_SERVICE_URL'] + '/get-userid?username=' + encodeURIComponent(username);
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

export const fetchUserInfoFrom42 = async (token: string): Promise<{ email: string, username: string }> => {
	try {
		console.log(`[Auth Service] Fetching user info with access token`);
		const response = await fetch('https://api.intra.42.fr/v2/me', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			console.error('[Auth Service] Failed to fetch user info from 42:', response.statusText);
			throw new Error("Failed to fetch user info from 42");
		}

		console.log(`[Auth Service] User info fetched successfully`);
		const userData = await response.json() as { email: string, login: string };
		console.log(`[Auth Service] User info: ${JSON.stringify(userData)}`);
		return {
			email: userData.email,
			username: userData.login
		};
	} catch (e) {
		console.error('[Auth Service] Error fetching user info from 42:', e);
		throw new Error("An error occurred while fetching user info from 42");
	}
}
