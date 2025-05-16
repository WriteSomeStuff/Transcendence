
// Fetch profile data from backend
async function fetchUserData() {
	try {
		const response = await fetch('/profile', { method: 'GET' });

		if (!response.ok) {
			throw new Error("Error fetching profile data");
		}

		const userData = await response.json();
		return userData;

	} catch (e) {
		console.error('Error fetching user data:', e);
	}
}

// display data
async function displayUserData() {
	const user = await fetchUserData();
	if (user) {
		document.getElementById('username').textContent = user.username;
	}
}

displayUserData();