import { bindForm, formBindings } from "./formHandlers.js";

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
				bindForm(formBindings[page]);
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

selectView("home", false);

window.addEventListener("popstate", (event) => {
	const page: string = location.pathname.slice(1) || "home";
	selectView(page, false);
})
