import runTransaction from "../db.js";

// export const fetchUserIdByUsername = async (username: string): Promise<number> => {
// 	const url = process.env['USER_SERVICE_URL'] + '/get-userid?username=' + encodeURIComponent(username);
// 	const response = await fetch(url, {
// 		method: 'GET',
// 		headers: {
// 			'Content-Type': 'application/json'
// 		}
// 	});

// 	const data = await response.json() as { success: boolean, userId?: number, error?: string };

// 	if (data.success && typeof data.userId === "number") {
// 		return data.userId;
// 	} else {
// 		throw new Error("User not found");
// 	}
// }

export const fetchUserIdByEmail = async (email: string): Promise<number> => {
  console.log(`[Auth Service] Fetching corresponding user id for '${email}'`);
  const userId = runTransaction((db) => {
    const stmt = db.prepare(`
			SELECT user_id
			FROM user
			WHERE email = ?
		`);
    const result = stmt.get(email);
    if (!result) {
      console.log(
        `[Auth Service] User '${email}' not found in auth service db`,
      );
      throw new Error("User not found");
    }
    return result.user_id;
  });
  console.log(`[Auth Service] User ID for '${email}' is ${userId}`);
  return userId;
};

// export const fetchUsernameByUserId = async (userId: number): Promise<string> => {
// 	const url = process.env['USER_SERVICE_URL'] + '/get-username?userId=' + encodeURIComponent(userId);
// 	const response = await fetch(url, {
// 		method: 'GET',
// 		headers: {
// 			'Content-Type': 'application/json'
// 		}
// 	});

// 	const data = await response.json() as { success: boolean, username?: string, error?: string };

// 	if (data.success && typeof data.username === "string") {
// 		return data.username;
// 	} else {
// 		throw new Error("Username not found");
// 	}
// }

export const fetchEmailByUserId = async (userId: number): Promise<string> => {
  console.log(
    `[Auth Service] Fetching corresponding email for user ID '${userId}'`,
  );
  const email = runTransaction((db) => {
    const stmt = db.prepare(`
			SELECT email
			FROM user
			WHERE user_id = ?
		`);
    const result = stmt.get(userId);
    if (!result) {
      console.log(
        `[Auth Service] User with ID '${userId}' not found in auth service db`,
      );
      throw new Error("User not found");
    }
    return result.email;
  });
  console.log(`[Auth Service] Email for user ID '${userId}' is ${email}`);
  return email;
};

export const fetchUserStatusById = async (userId: number): Promise<string> => {
  console.log(`[Auth Service] Fetching status for user ID '${userId}'`);
  const url = process.env['USER_SERVICE_URL'] + '/get-status?userId=' + encodeURIComponent(userId);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
	});

  const data = await response.json() as { success: boolean, status?: string, error?: string };

  if (data.success && typeof data.status === "string") {
    return data.status;
  } else {
    throw new Error("Status not found");
  }
};

export const processOAuthLogin = async (
  code: string,
): Promise<{ token: string }> => {
  try {
    console.log(`[Auth Service] Processing OAuth login with code: ${code}`);
    const response = await fetch("https://api.intra.42.fr/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env["OAUTH_CLIENT_ID"],
        client_secret: process.env["OAUTH_CLIENT_SECRET"],
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env["OAUTH_REDIRECT_URI"],
      }),
    });
    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.statusText}`);
    }
    console.log(`[Auth Service] OAuth token exchange successful`);

    const data = await response.json();
    const token = data.access_token;
    if (!token) {
      throw new Error("OAuth token not found in response");
    }
    return { token };
  } catch (e) {
    console.error("[Auth Service] Error during OAuth login:", e);
    throw new Error("An error occurred during OAuth login");
  }
};

export const fetchUserInfoFrom42 = async (
  token: string,
): Promise<{ email: string; username: string }> => {
  try {
    console.log(`[Auth Service] Fetching user info with access token`);
    const response = await fetch("https://api.intra.42.fr/v2/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(
        "[Auth Service] Failed to fetch user info from 42:",
        response.statusText,
      );
      throw new Error("Failed to fetch user info from 42");
    }

    console.log(`[Auth Service] User info fetched successfully`);
    const responseData = await response.json();
    const email = responseData.email;
    const username = responseData.login;
    if (!email || !username) {
      throw new Error("Email or username not found in user info");
    }
    console.log(`[Auth Service] User email fetched: ${email}`);
    console.log(`[Auth Service] User username fetched: ${username}`);
    return { email, username };
  } catch (e) {
    console.error("[Auth Service] Error fetching user info from 42:", e);
    throw new Error("An error occurred while fetching user info from 42");
  }
};
