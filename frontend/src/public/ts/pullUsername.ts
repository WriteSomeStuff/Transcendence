// Milana used this to fetch data when logged in, can use to pull username
// fetch("/user-management/profile").then(response => response.json()).then(data => console.log(data))

async function fetchUserData() {
	try {
		const response: Response = await fetch('/api/users/profile', { method: 'GET' });

		if (!response.ok) {
			throw new Error("Error fetching profile data");
		}

		const userData: any = await response.json();
		console.log(userData);
		return userData;

	} catch (e) {
		console.error('Error fetching user data:', e);
	}
}

export async function displayLeaderboardData()
{
	const user: any = await fetchUserData();
	let tempUsername: string = user.data.username;
	let tempWins: number = 1;
	const username: HTMLElement | null = document.getElementById("usernameScript");
	const p: HTMLParagraphElement = document.createElement("p");
	p.textContent = `1. ${tempUsername} ${tempWins}\n`;
	username?.appendChild(p);
}
