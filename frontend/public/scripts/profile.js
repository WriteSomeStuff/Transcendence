
// Fetch profile data from backend
async function fetchUserData() {
	try {
		const response = await fetch('/profile', { method: 'GET' });
		
		if (!response.ok) {
			alert('Fetching user data failed');
			window.location.href = '/index.html';
			throw new Error("Error fetching profile data");
		}
		
		const result = await response.json();
		return result.data;

	} catch (e) {
		console.error('Error fetching user data:', e);
	}
}

// display data
async function displayUserData() {
	const userData = await fetchUserData();
	if (userData && userData.length > 0) {
		const user = userData[0];
		document.getElementById('username').textContent = user.username;
	}
}

displayUserData();