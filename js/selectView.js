function selectView(page, push)
{
	fetch(`/js/views/${page}.html`)
	.then(response => {
		if (!response.ok)
			throw new Error(`Failed to load ${page}.html`);
		return response.text();
	})
	.then(html => {
		document.getElementById("spa").innerHTML = html;
		if (push)
			window.history.pushState({}, "", `/${page}`);
	})
	.catch(error => {
		console.error(error);
		// show our own error page?
	});
}

selectView("home", false);

document.querySelectorAll("button[page]").forEach(button => {
	button.addEventListener("click", (event) => {
		const page = event.target.getAttribute("page");
		selectView(page, true);
	});
});

window.addEventListener("popstate", (event) => {
	const page = location.pathname.slice(1) || "home";
	selectView(page, false);
})
