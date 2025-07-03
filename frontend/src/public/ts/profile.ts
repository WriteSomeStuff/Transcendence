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
			throw new Error("Error fetching friend list");
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

	for (const i in list) { // display up to 5 friends
		console.log(`Friend ${i}: ${String(list[i].friendId)} ${list[i].accountStatus}`)
		const docUser = document.getElementById(`friend${i}`) as HTMLSpanElement;
		const docStatus = document.getElementById(`status${i}`) as HTMLSpanElement;
		if (docUser && docStatus) {
			docUser.textContent = String(list[i].friendId);
			docStatus.textContent = list[i].accountStatus;
		}

		if (i === "4") break;
	}
}