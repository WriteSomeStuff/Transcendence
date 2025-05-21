
// Fetch profile data from backend
async function fetchUserData() {
	try {
		const response = await fetch('/profile', { method: 'GET' });
		
		if (!response.ok) {
			alert('Fetching user data failed');
			window.location.href = '/';
			throw new Error("Error fetching profile data");
		}
		
		const result = await response.json();
		console.log('Userdata in profile.js:', result.data);
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

		console.log('Avatar path:', user.avatar_path);
		document.getElementById('avatar').src = user.avatar_path;
	}
}

displayUserData();