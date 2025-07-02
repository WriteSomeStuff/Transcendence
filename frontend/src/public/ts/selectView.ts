import {
	bindProfileModal,
	displayUsername
} from "./profile.js";

import {
	formBindings,
	bindCredentialsForm,
	bindAvatarForm,
	bindUserInfoUpdateForm
} from "./formHandlers.js";

function	bindButtons()
{
	document.querySelectorAll("button[page]").forEach(button => {
		button.addEventListener("click", (event) => {
			const target: HTMLElement = event.currentTarget as HTMLElement;
			const page: string | null = target.getAttribute("page");
			if (page) {
				selectView(page, true);
			}
		});
	});
}

function bindProfileViewElements() {
	displayUsername();
	bindAvatarForm();
	bindProfileModal();
	bindUserInfoUpdateForm("username");
	bindUserInfoUpdateForm("password");
	const avatarImg = document.querySelector('img[alt="User Avatar"]') as HTMLImageElement | null;
	if (avatarImg) {
		avatarImg.src = `/api/user/avatar?ts=${Date.now()}`; // To bust the cache and reload with the new avatar
	}
}

function selectView(page: string, push: boolean)
{
	fetch(`./public/js/views/${page}.html`)
	.then(response => {
		if (!response.ok) {
			throw new Error(`Failed to load ${page}.html`);
		}
		return response.text();
	})
	.then(html => {
		const spa: HTMLElement | null = document.getElementById("spa");
		if (spa) {
			spa.innerHTML = html;
			if (push) {
				window.history.pushState({}, "", `/${page}`);
			}
			bindButtons();
			if (formBindings[page]) {
				bindCredentialsForm(formBindings[page]);
			} else if (page === 'profile') {
				bindProfileViewElements();
			}
			if (page === "leaderboard") {
				import("./pullUsername.js").then((module) => {
					// Optional: call a specific function if needed
					if (module.displayLeaderboardData) {
						module.displayLeaderboardData();
					}
				});
			}
		}
		else {
			console.error("Element spa not found.");
		}
	})
	.catch(error => {
		console.error(error);
		// show our own error page?
	});
}

selectView("homeDEV", false);

window.addEventListener("popstate", (event) => {
	const page: string = location.pathname.slice(1) || "homeDEV";
	selectView(page, false);
});

// For reloading the page
(window as any).selectView = selectView;
