async function fetchUserData() {
	try {
		const response = await fetch('/profile', { method: 'GET' });

		if (!response.ok) {
			alert('Fetching user data failed');
			throw new Error("Error fetchin profile data");
		}

		const result = await response.json();
		
		console.log('User data:', result.data);
		return result.data;
	} catch {
		console.error('Error fetching user data:', e);
	}
}

async function displayUserData() {
	const userData = await fetchUserData();
	if (userData && userData.lenght > 0) {
		const user = userData[0];
		document.getElementById('username').textContent = user.username;
	}
}

displayUserData();