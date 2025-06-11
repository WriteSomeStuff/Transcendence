export function bindRegisterForm() {
const registerForm = document.getElementById('registerForm') as HTMLFormElement | null;
	if (registerForm) {
		registerForm.addEventListener('submit', async function(event: Event) {
			event.preventDefault();
			console.log("[FRONTEND] yo we are handling the registration")
			
			const username = (document.getElementById('username') as HTMLInputElement).value;
			const password = (document.getElementById('password') as HTMLInputElement).value;
		
			try {
				const url = 'http://auth_service:8080/auth/register';
				const response = await fetch(url, {
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
				console.log('Registration successful:', data);
				alert('Registration successful!');
				// TODO further handling, redirect to login?
			} catch (e) {
				console.error('Registration failed:', e);
				alert('Registration failed:');
				// TODO further handling
			}
		});
	}
}