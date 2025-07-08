import { z } from "zod";

import { ProfileViewSchema } from "./views.js";
import { bindNavbar } from "./utils.js";
import type { App } from "../app.js";
import { FriendListResponseSchema } from "schemas";
import type { Friend } from "schemas";

function bindAvatarForm() {
  const form = document.getElementById("avatarForm") as HTMLFormElement;
  if (!form) return;

  form.addEventListener("submit", async function (event: Event) {
    event.preventDefault();
    console.log("[formHandlers] Handling avatar upload");

    const input = document.getElementById("avatarInput") as HTMLInputElement;
    if (!input || !input.files) return;

    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch("/api/user/avatar", {
      method: "PUT",
      body: formData,
    });

    const data = (await response.json()) as {
      success: boolean;
      error?: string;
    };

    if (!response.ok || data.success === false) {
      console.error("[formHandlers] Uploading new avatar failed");
      alert(data.error || `HTTP error; status: ${response.status}`);
      // further handling
      // throw new Error(data.error || `HTTP error; status: ${response.status}`);
    }

    console.log("[formHandlers] Uploading new avatar successful");
    alert(`Avatar successfully uploaded!`);

    (window as any).selectView?.("profile", false);
  });
}

function bindUserInfoUpdateForm(infoType: string) {
  if (infoType != "username" && infoType != "password") {
    alert("Incorrect usage of bindUserInfoUpdateForm function");
    // throw new Error("Incorrect usage of bindUserInfoUpdateForm function");
  }

  const form = document.getElementById(`${infoType}Form`) as HTMLFormElement;
  if (!form) return;

  form.addEventListener("submit", async function (event: Event) {
    event.preventDefault();
    console.log(`[formHandlers] Handling ${infoType} update`);

    const infoTypeCapitalized =
      infoType.charAt(0).toUpperCase() + infoType.slice(1);
    const input = document.getElementById(
      `new${infoTypeCapitalized}`,
    ) as HTMLInputElement;
    if (!input) return;

    const newValue = input.value;

    console.log("new username:", newValue);

    const response = await fetch(`/api/user/${infoType}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newValue }),
    });

    const data = (await response.json()) as {
      success: boolean;
      error?: string;
    };

    if (!response.ok || data.success === false) {
      console.error(`[formHandlers] Updating ${infoType} failed`);
      alert(data.error || `HTTP error; status: ${response.status}`);
      // throw new Error(data.error || `HTTP error; status: ${response.status}`);
    }

    console.log(`[formHandlers] Updating ${infoType} successful`);
    alert(`${infoTypeCapitalized} successfully updated!`);

    (window as any).selectView?.("profile", false);
  });
}

function bindProfileModal() {
  const modal = document.getElementById("modal") as HTMLDialogElement;
  const openModal = document.getElementById(
    "openUserInfoEditor",
  ) as HTMLButtonElement;
  const closeModal = document.getElementById(
    "closeUserInfoEditor",
  ) as HTMLButtonElement;

  if (!modal || !openModal || !closeModal) return;

  openModal.addEventListener("click", () => {
    modal.showModal();
  });

  closeModal.addEventListener("click", () => {
    modal.close();
  });
}

async function fetchUserData() {
  try {
    const response: Response = await fetch("/api/user/profile", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error fetching profile data");
    }

    const userData: any = await response.json();
    console.log(userData);
    return userData;
  } catch (e) {
    console.error("Error fetching user data:", e);
  }
}

async function displayUsername() {
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
    const response: Response = await fetch("/api/user/friends/list", {
      method: "GET",
    });

    if (!response.ok) {
      return response.statusText;
    }

    const parsedResponse = FriendListResponseSchema.safeParse(
      await response.json(),
    );
    console.log(parsedResponse);

    if (!parsedResponse.success) {
      return parsedResponse.error.toString();
    }
    if (!parsedResponse.data.success) {
      return parsedResponse.data.error;
    }
    return parsedResponse.data.data;
  } catch (e: any) {
    console.error("Error fetching user data:", e);
    return e.message;
  }
}

async function displayFriendList() {
  const list: Friend[] | string = await fetchFriendList();
  const friendsList = document.getElementById(
    "friendsList",
  ) as HTMLUListElement;
  if (!friendsList) return;

  if (typeof list === "string") {
    // something went wrong
    friendsList.textContent = "Something went wrong:" + list;
    return;
  } else if (list.length === 0) {
    // no friends
    friendsList.textContent = "You don't have any friends (yet)";
    return;
  }

  for (const friend of list) {
    // display up to 5 friends
    console.log(
      `Friend: ${String(friend.userId)} ${friend.username} ${friend.accountStatus}`,
    );
    const docUser = document.createElement("span");
    docUser.className = "min-w-[8rem] truncate";
    const docStatus = document.createElement("span");
    docStatus.className = "text-right";
    docUser.textContent = friend.username;
    docStatus.textContent = friend.accountStatus;
    const listElement = document.createElement("li");
    listElement.className = "flex justify-between items-center gap-4";
    listElement.appendChild(docUser);
    listElement.appendChild(docStatus);
    friendsList.appendChild(listElement);
  }
}

async function displayAvatar() {
  try {
    const response: Response = await fetch("/api/user/avatar", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const avatarImg = document.getElementById("avatarImg") as HTMLImageElement;
    if (avatarImg) {
      avatarImg.src = url;
    }
  } catch (e: any) {
    console.error("Error displaying avatar:" + e.message);
  }
}

async function logOut() {
	const logOutBtn = document.getElementById("logout");
	if (!logOutBtn) return;
	
	logOutBtn.addEventListener("click", async (event) => {
		event.preventDefault();
		console.log("Logging out");
		
		const url = "/api/auth/logout";
		const response = await fetch(url, { method: 'DELETE' });
		
		const data = (await response.json()) as {
			  success: boolean;
			  error?: string;
		};
		
		if (!response.ok || data.success === false) {
			console.error("Error, something went wrong logging out: " + data.error);
			  alert(data.error || `HTTP error; status: ${response.status}`);
		}

		console.log("User logged out successfully");
		alert("Log out successful");

		// Go back to home page
	});
	
}

export function bind2FAButtons() {
	const enable2FAButton = document.getElementById('enable-2fa') as HTMLButtonElement;
	const disable2FAButton = document.getElementById('disable-2fa') as HTMLButtonElement;
	const qrCodeImage = document.getElementById('qr-code') as HTMLImageElement;
	const twoFAModal = document.getElementById('2FAModal') as HTMLDialogElement;
	const close2FAModal = document.getElementById('close2FAModal') as HTMLButtonElement;

	if (enable2FAButton) {
		enable2FAButton.addEventListener('click', async () => {
			enable2FAButton.disabled = true;
			disable2FAButton?.removeAttribute('disabled');
			try {
				const response = await fetch('/api/auth/enable2fa', {
					method: 'POST'
				});
				const data = await response.json();
				if (!response.ok || !data.success) {
					throw new Error(data.error || `HTTP error; status: ${response.status}`);
				}

				// Set QR code and open modal
				if (qrCodeImage && data.qrCode) {
					qrCodeImage.src = data.qrCode;
				}
				if (twoFAModal) {
					twoFAModal.showModal();
				}

				alert('2FA enabled successfully!');

			} catch (error) {
				console.error('Error enabling 2FA:', error);
				const message = error instanceof Error ? error.message : String(error);
				alert(`Failed to enable 2FA: ${message}`);
			}
		});
	}

	if (close2FAModal && twoFAModal) {
		close2FAModal.addEventListener('click', () => {
			twoFAModal.close();
		});
	}

	if (disable2FAButton) {
		disable2FAButton.addEventListener('click', async () => {
			disable2FAButton.disabled = true;
			enable2FAButton?.removeAttribute('disabled');
			try {
				const response = await fetch('/api/auth/disable2fa', {
					method: 'POST'
				});
				const data = await response.json();
				if (!response.ok || !data.success) {
					throw new Error(data.error || `HTTP error; status: ${response.status}`);
				}
				alert('2FA disabled successfully!');

				(window as any).selectView?.("profile", false);
			} catch (error) {
				console.error('Error disabling 2FA:', error);
				const message = error instanceof Error ? error.message : String(error);
				alert(`Failed to disable 2FA: ${message}`);
			}
		});
	}
}

function bindProfileViewElements() {
  displayUsername();
  displayFriendList();
  displayAvatar();
  bindAvatarForm();
  bindProfileModal();
  bindUserInfoUpdateForm("username");
  bindUserInfoUpdateForm("password");
  bind2FAButtons();
  logOut();
}

export async function renderProfileView(
  view: z.infer<typeof ProfileViewSchema>,
  app: App,
): Promise<void> {
  app.appContainer.innerHTML = await fetch("/views/profile.html").then((res) =>
    res.text(),
  );
  bindNavbar(app);
  bindProfileViewElements();
  void view;
}
