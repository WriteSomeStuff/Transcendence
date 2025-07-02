export const formBindings: Record<string, { formId: string; url: string; serviceName: string }> = {
    register:	{ formId: 'registrationForm',	url: '/api/auth/register', serviceName: 'Registration' },
    login:		{ formId: 'loginForm',		url: '/api/auth/login',    serviceName: 'Login' }
};

type formBinding = { formId: string; url: string; serviceName: string };

export function bindCredentialsForm(formBinding: formBinding) {
	const form = document.getElementById(formBinding.formId) as HTMLFormElement | null;
	if (!form) {
		return;
	}

	form.addEventListener('submit', async function (event: Event) {
			event.preventDefault(); // prevents automatic reload and allows manual handling
			console.log("[FRONTEND] Handling login");

			const username = (document.getElementById('username') as HTMLInputElement).value;
			const password = (document.getElementById('password') as HTMLInputElement).value;

			try {
				const response = await fetch(formBinding.url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ username, password })
				});

				const data = await response.json() as { success: boolean, error?: string};

				if (!response.ok || data.success === false) {
					throw new Error(data.error || `HTTP error; status: ${response.status}`);
				}

				console.log(`${formBinding.serviceName} successful: ${data}`);
				alert(`${formBinding.serviceName} successful!`);

				// TODO further handling, for registration to login page? for login to homepage?
			} catch (e) {
				console.error(`${formBinding.serviceName} failed: ${e}`);
				alert(`${formBinding.serviceName} failed: ${e}`);
				// TODO further handling
			}
		});
}

export function bindAvatarForm() {
	const form = document.getElementById('avatarForm') as HTMLFormElement;
	if (!form) return;

	form.addEventListener('submit', async function (event: Event) {
		event.preventDefault();
		console.log("[formHandlers] Handling avatar upload");

		const input = document.getElementById('avatarInput') as HTMLInputElement;
		if (!input || !input.files) return;
		
		const file = input.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('avatar', file);

		const response = await fetch('/api/user/avatar', {
			method: 'PUT',
			body: formData
		});

		const data = await response.json() as { success: boolean, error?: string};
		
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

export function bindUserInfoUpdateForm(infoType: string) {
	if (infoType != "username" && infoType != "password") {
		alert("Incorrect usage of bindUserInfoUpdateForm function");
		// throw new Error("Incorrect usage of bindUserInfoUpdateForm function");
	}

	const form = document.getElementById(`${infoType}Form`) as HTMLFormElement;
	if (!form) return;
	
	form.addEventListener('submit', async function (event: Event) {
		event.preventDefault();
		console.log(`[formHandlers] Handling ${infoType} update`);
		
		const infoTypeCapitalized = infoType.charAt(0).toUpperCase() + infoType.slice(1);
		const input = document.getElementById(`new${infoTypeCapitalized}`) as HTMLInputElement;
		if (!input) return;

		const newValue = input.value;

		console.log('new username:', newValue);

		const response = await fetch(`/api/user/${infoType}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ newValue })
		});

		const data = await response.json() as { success: boolean, error?: string};

		if (!response.ok || data.success === false) {
			console.error(`[formHandlers] Updating ${infoType} failed`)
			alert(data.error || `HTTP error; status: ${response.status}`);
			// throw new Error(data.error || `HTTP error; status: ${response.status}`);
		}

		console.log(`[formHandlers] Updating ${infoType} successful`);
		alert(`${infoTypeCapitalized} successfully updated!`);

		(window as any).selectView?.("profile", false);
	})
}