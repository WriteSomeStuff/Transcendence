export function bindProfileModal() {
	const modal = document.getElementById("modal") as HTMLDialogElement;
	const openModal = document.getElementById("openUserInfoEditor") as HTMLButtonElement;
	const closeModal = document.getElementById("closeUserInfoEditor") as HTMLButtonElement;
	
	if (!modal || !openModal || !closeModal) return;

	openModal.addEventListener('click', () => {
		modal.showModal();
	});
	
	closeModal.addEventListener('click', () => {
		modal.close();
	});
}

async function fetchUserData() {
	try {
		const response: Response = await fetch('/api/user/profile', { method: 'GET' });

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

export async function displayUsername()
{
	const user: any = await fetchUserData();
	if (!user) return;
	const fetchedUsername: string = user.data.username;
	const username = document.getElementById("username") as HTMLHeadingElement;
	if (username) {
		username.textContent = fetchedUsername;
	}
}