export const formBindings: Record<string, { formId: string; url: string; serviceName: string }> = {
    register:	{ formId: 'registerForm',	url: '/auth/register', serviceName: 'Registration' },
    login:		{ formId: 'loginForm',		url: '/auth/login',    serviceName: 'Login' }
};

type formBinding = { formId: string; url: string; serviceName: string };

export function bindForm(formBinding: formBinding) {
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

				if (!response.ok) {
					throw new Error(`HTTP error; status: ${response.status}`);
				}
				
				const data = await response.json();

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