import { z } from "zod";

import { ProfileViewSchema } from "./views.js";
import { bindNavbar } from "./utils.js";
import type { App } from "../app.js";
import {
  FriendListResponseSchema,
  FriendRequestListResponseSchema,
  HistoryResponseSchema,
} from "schemas";
import type { Friend, MatchHistory, Friendship } from "schemas";

function bindAvatarForm(app: App) {
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
      return;
      // further handling
      // throw new Error(data.error || `HTTP error; status: ${response.status}`);
    }

    console.log("[formHandlers] Uploading new avatar successful");
    alert(`Avatar successfully uploaded!`);

    app.resetView();
  });
}

function bindUserInfoUpdateForm(app: App, infoType: string) {
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
      return;
    }

    console.log(`[formHandlers] Updating ${infoType} successful`);
    alert(`${infoTypeCapitalized} successfully updated!`);

    app.resetView();
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

async function fetchMatchHistory(): Promise<MatchHistory[] | string> {
  try {
    const response: Response = await fetch("/api/user/match/history", {
      method: "GET",
    });
    if (!response.ok) {
      return response.statusText;
    }

    const parsedResponse = HistoryResponseSchema.safeParse(
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

async function displayMatchHistory() {
  const list: MatchHistory[] | string = await fetchMatchHistory();
  const matchHistory = document.getElementById(
    "matchHistory",
  ) as HTMLUListElement;
  const matchWins = document.getElementById(
    "winsAndLosses",
  ) as HTMLUListElement;
  if (!matchHistory || !matchWins) return;

  if (typeof list === "string") {
    matchHistory.textContent = "Something went wrong:" + list;
    return;
  } else if (list.length === 0) {
    matchHistory.textContent = "You don't have any matches (yet)";
    matchWins.textContent = `0 / 0`;
    return;
  }

  var winAmount: number = 0;
  var lossAmount: number = 0;
  for (const history of list) {
    const docDate: HTMLSpanElement = document.createElement("span");
    docDate.textContent = `${history.date.getDate().toString().padStart(2, "0")}/${(history.date.getMonth() + 1).toString().padStart(2, "0")}/${history.date.getFullYear()}`;

    const docScore: HTMLSpanElement = document.createElement("span");
    docScore.textContent = history.userScore.toString() + " points";

    var win: boolean = true;
    for (const opponent of history.opponentInfo) {
      if (history.userScore < opponent.opponentScore) {
        win = false;
        break;
      }
    }
    if (win === false) {
      lossAmount++;
      var docWin: HTMLSpanElement = document.createElement("span");
      docWin.textContent = "Defeat";
    } else {
      winAmount++;
      var docWin: HTMLSpanElement = document.createElement("span");
      docWin.textContent = "Victory";
    }

    const listElement = document.createElement("li");
    listElement.className = "flex justify-between items-center gap-4";
    listElement.appendChild(docDate);
    listElement.appendChild(docScore);
    listElement.appendChild(docWin);
    matchHistory.appendChild(listElement);
  }

  matchWins.textContent = `${winAmount} / ${lossAmount}`;
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

async function displayFriendList(app: App) {
  const list: Friend[] | string = await fetchFriendList();
  const friendsList = document.getElementById(
    "friendsList",
  ) as HTMLUListElement;
  if (!friendsList) return;

  if (typeof list === "string") {
    friendsList.textContent = "Something went wrong:" + list;
    return;
  } else if (list.length === 0) {
    friendsList.textContent = "You don't have any friends (yet)";
    return;
  }

  for (const friend of list) {
    console.log(
      `Friend: ${String(friend.userId)} ${friend.username} ${friend.accountStatus}`,
    );
    const docUser = document.createElement("span");
    docUser.className = "min-w-[8rem] truncate";
    docUser.textContent = friend.username;

    const docStatus = document.createElement("span");
    docStatus.className = "text-right";
    docStatus.textContent = friend.accountStatus;

    // button to remove friend
    const removeBtn: HTMLButtonElement = document.createElement("button");
    removeBtn.className =
      "cursor-pointer px-1 py-1 sm:text-base rounded-md border-2 border-red-500 bg-red-700 hover:border-purple-500 hover:bg-purple-950 mt-2";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", async function () {
      const response: Response = await fetch(
        `/api/user/friends/remove?userIdToRemove=${friend.userId}`,
        { method: "DELETE" },
      );

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !data.success) {
        console.log(
          "Could not remove friend: " + data.error ||
            `HTTP error; status: ${response.status}`,
        );
        alert("Something went wrong removing the friend");
        return;
      }

      console.log("Friend removed");
      app.resetView();
    });

    const listElement = document.createElement("li");

    listElement.className = "flex justify-between items-center gap-4";
    listElement.appendChild(docUser);
    listElement.appendChild(docStatus);
    listElement.appendChild(removeBtn);
    friendsList.appendChild(listElement);
  }
}

async function fetchRequestList(): Promise<Friendship[] | string> {
  try {
    const response: Response = await fetch("/api/user/friends/requests", {
      method: "GET",
    });

    const data = (await response.json()) as {
      success: boolean;
      error?: string;
      data?: Friendship[];
    };

    console.log(`data: ${JSON.stringify(data)}`);
    if (!response.ok || data.success === false) {
      return data.error || response.statusText;
    }

    const parsedResponse = FriendRequestListResponseSchema.safeParse(data);
    console.log(`parsedResponse: ${JSON.stringify(parsedResponse)}`);
    if (!parsedResponse.success) {
      return parsedResponse.error.toString();
    }
    if (!parsedResponse.data.success) {
      return parsedResponse.data.error;
    }
    return parsedResponse.data.data;
  } catch (e: any) {
    console.error("Error fetching friend requests:", e);
    return e.message;
  }
}

async function displayFriendRequestList(app: App) {
  const list: Friendship[] | string = await fetchRequestList();
  const requestList = document.getElementById("requests") as HTMLUListElement;
  if (!requestList) return;

  if (typeof list === "string") {
    requestList.textContent = "Something went wrong:" + list;
    return;
  } else if (list.length === 0) {
    requestList.textContent = "You don't have any friend requests (yet)";
    return;
  }

  for (const request of list) {
    console.log(
      `Request ${String(request.friendshipId)} from ${String(request.userId)} to ${String(request.friendId)}`,
    );

    // user
    const docSender = document.createElement("span");
    docSender.className = "min-w-[8rem] truncate";
    docSender.textContent = String(request.usernameSender);

    // buttons
    const acceptBtn: HTMLButtonElement = document.createElement("button");
    acceptBtn.className =
      "cursor-pointer px-1 py-1 sm:text-base rounded-md border-2 border-emerald-500 bg-emerald-700 hover:border-purple-500 hover:bg-purple-950 mt-2";
    acceptBtn.textContent = "Accept";
    acceptBtn.addEventListener("click", async function () {
      const response: Response = await fetch("/api/user/friends/accept", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIdSender: request.userId }),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !data.success) {
        console.log(
          "Could not accept friend request: " + data.error ||
            `HTTP error; status: ${response.status}`,
        );
        alert("Something went wrong accepting the friend request");
        return;
      }

      console.log("Friend request accepted");
      app.resetView();
    });

    const rejectBtn: HTMLButtonElement = document.createElement("button");
    rejectBtn.className =
      "cursor-pointer px-1 py-1 sm:text-base rounded-md border-2 border-red-500 bg-red-700 hover:border-purple-500 hover:bg-purple-950 mt-2";
    rejectBtn.textContent = "Reject";
    rejectBtn.addEventListener("click", async function () {
      const response: Response = await fetch("/api/user/friends/reject", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIdSender: request.userId }),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !data.success) {
        console.log(
          "Could not reject friend request: " + data.error ||
            `HTTP error; status: ${response.status}`,
        );
        alert("Something went wrong rejecting the friend request");
        return;
      }

      console.log("Friend request rejected");
      app.resetView();
    });

    const listElement = document.createElement("li");

    listElement.className = "flex justify-between items-center gap-4";
    listElement.appendChild(docSender);
    listElement.appendChild(acceptBtn);
    listElement.appendChild(rejectBtn);
    requestList.appendChild(listElement);
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

export async function logOut(app: App) {
  const logOutBtn = document.getElementById("logout");
  if (!logOutBtn) return;

  logOutBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    console.log("Logging out");

    const url = "/api/auth/logout";
    const response = await fetch(url, { method: "DELETE" });

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

    app.resetView();
  });
}

export function bind2FAButtons(app: App) {
  const enable2FAButton = document.getElementById(
    "enable-2fa",
  ) as HTMLButtonElement;
  const disable2FAButton = document.getElementById(
    "disable-2fa",
  ) as HTMLButtonElement;
  const qrCodeImage = document.getElementById("qr-code") as HTMLImageElement;
  const twoFAModal = document.getElementById("2FAModal") as HTMLDialogElement;
  const close2FAModal = document.getElementById(
    "close2FAModal",
  ) as HTMLButtonElement;

  if (enable2FAButton) {
    enable2FAButton.addEventListener("click", async () => {
      enable2FAButton.disabled = true;
      disable2FAButton?.removeAttribute("disabled");
      try {
        const response = await fetch("/api/auth/enable2fa", {
          method: "POST",
        });
        const data = (await response.json()) as {
          success: boolean;
          error?: string;
          qrCode?: string;
        };
        if (!response.ok || !data.success) {
          throw new Error(
            data.error || `HTTP error; status: ${response.status}`,
          );
        }

        // Set QR code and open modal
        if (qrCodeImage && data.qrCode) {
          qrCodeImage.src = data.qrCode;
        }
        if (twoFAModal) {
          twoFAModal.showModal();
        }

        alert("2FA enabled successfully!");
      } catch (error) {
        console.error("Error enabling 2FA:", error);
        const message = error instanceof Error ? error.message : String(error);
        alert(`Failed to enable 2FA: ${message}`);
      }
    });
  }

  if (close2FAModal && twoFAModal) {
    close2FAModal.addEventListener("click", () => {
      twoFAModal.close();
    });
  }

  if (disable2FAButton) {
    disable2FAButton.addEventListener("click", async () => {
      disable2FAButton.disabled = true;
      enable2FAButton?.removeAttribute("disabled");
      try {
        const response = await fetch("/api/auth/disable2fa", {
          method: "POST",
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(
            data.error || `HTTP error; status: ${response.status}`,
          );
        }
        alert("2FA disabled successfully!");

        app.resetView();
      } catch (error) {
        console.error("Error disabling 2FA:", error);
        const message = error instanceof Error ? error.message : String(error);
        alert(`Failed to disable 2FA: ${message}`);
      }
    });
  }
}

async function sendRequest(username: string) {
  try {
    // get the user id corresponding to the username
    const userIdResponse: Response = await fetch(
      `/api/user/get-userid?username=${username}`,
    );
    const userIdData = (await userIdResponse.json()) as {
      success: boolean;
      error?: string;
      userId?: number;
    };

    if (!userIdResponse || userIdData.success === false) {
      console.error(
        `[Profile] Sending request not possible: ${userIdData.error}`,
      );
      alert(
        "Sending request failed: " +
          (userIdData.error || `HTTP error; status: ${userIdResponse.status}`),
      );
      return;
    }

    // send the request to the user id
    const userId = userIdData.userId;
    console.log(`[FRIEND REQUEST] Sending request to ${userId}`);
    const friendRequestResponse: Response = await fetch(
      "/api/user/friends/request",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId: userId }),
      },
    );

    const data = (await friendRequestResponse.json()) as {
      success: boolean;
      error?: string;
    };

    if (!friendRequestResponse.ok || data.success === false) {
      console.error(`[profile] Sending request failed`);
      alert(
        "Sending request failed: " +
          (data.error || `HTTP error; status: ${friendRequestResponse.status}`),
      );
      return;
    }

    console.log(`[profile] Sending friend request to ${username} successful`);
    alert(`Friend request sent to ${username}`);
  } catch (e) {
    console.error(`Error sending friend request: ${e}`);
    alert(`Friend request could not be sent: ${e}`);
  }
}

async function sendFriendRequest() {
  const sendRequestBtn = document.getElementById(
    "search-button",
  ) as HTMLButtonElement;
  if (!sendRequestBtn) return;

  sendRequestBtn.addEventListener("click", () => {
    const searchInput = document.getElementById(
      "search-input",
    ) as HTMLInputElement;
    if (!searchInput) return;
    const usernameInput = searchInput.value;
    if (usernameInput.length === 0) return;
    sendRequest(usernameInput);
  });
}

function bindProfileViewElements(app: App) {
  displayUsername();
  displayMatchHistory();
  displayFriendList(app);
  displayFriendRequestList(app);
  sendFriendRequest();
  displayAvatar();
  bindAvatarForm(app);
  bindProfileModal();
  bindUserInfoUpdateForm(app, "username");
  bindUserInfoUpdateForm(app, "password");
  bind2FAButtons(app);
  logOut(app);
}

export async function renderProfileView(
  view: z.infer<typeof ProfileViewSchema>,
  app: App,
): Promise<void> {
  app.appContainer.innerHTML = await fetch("/views/profile.html").then((res) =>
    res.text(),
  );
  bindNavbar(app);
  bindProfileViewElements(app);
  void view;
}
