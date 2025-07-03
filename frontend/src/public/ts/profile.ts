import { Friend, FriendListResponse } from "./types/types";

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

export async function displayUsername() {
	const user: any = await fetchUserData();
	if (!user) return;
	const fetchedUsername: string = user.data.username;
	const username = document.getElementById("username") as HTMLHeadingElement;
	if (username) {
		username.textContent = fetchedUsername;
	}
}

async function fetchFriendList(): Promise<Friend[] | string> {
	try {
		const response: Response = await fetch('/api/user/friends/list', { method: 'GET' });

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		const parsedResponse: FriendListResponse = await response.json();
		console.log(parsedResponse);

		if (parsedResponse.success === false && parsedResponse.error) {
			return parsedResponse.error;
		}

		return parsedResponse.data as Friend[];
	} catch (e: any) {
		console.error('Error fetching user data:', e);
		return e.message;
	}
}

export async function displayFriendList() {
	const list: Friend[] | string = await fetchFriendList();

	if (typeof list === "string") { // something went wrong
		const docUser = document.getElementById(`friend0`) as HTMLSpanElement;
		docUser.textContent = 'Something went wrong:' + list;
		return;
	} else if (!list[0]) { // no friends
		const docUser = document.getElementById(`friend0`) as HTMLSpanElement;
		docUser.textContent = "lol no friends, loser";
		return;
	}

	const numFriends = 5;
	const docFriendsList = document.getElementById('friends-list');

	for (let i = 0; i < numFriends; i++) {
		const li = document.createElement('li');
		li.className = 'flex justify-between items-center gap-4';

		const usernameSpan = document.createElement('span');
		usernameSpan.textContent = list[i].username;
		usernameSpan.className = 'min-w-[8rem] truncate';

		const statusSpan = document.createElement('span');
		statusSpan.textContent = list[i].accountStatus;
		statusSpan.className = 'text-right';

		li.appendChild(usernameSpan);
		li.appendChild(statusSpan);
		docFriendsList?.appendChild(li);
	}
}

export async function displayAvatar() {
	try {
		const response: Response = await fetch('/api/user/avatar', { method: 'GET' });

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		const blob = await response.blob();
		const url = URL.createObjectURL(blob);
		const avatarImg = document.getElementById('avatarImg') as HTMLImageElement;
		if (avatarImg) {
			avatarImg.src = url;
		}
	} catch (e: any) {
		console.error("Error displaying avatar:" + e.message);
	}
}