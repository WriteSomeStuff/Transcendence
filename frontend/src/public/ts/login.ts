export function bindVerify2FAModal() {
	const twoFAModal = document.getElementById('verify2FAModal') as HTMLDialogElement;
	const close2FAModal = document.getElementById('closeVerify2FAModal') as HTMLButtonElement;
	if (!twoFAModal) {
		throw new Error("2FA modal not found");
	}
	twoFAModal.showModal();
	if (close2FAModal) {
		close2FAModal.addEventListener('click', () => {
			twoFAModal.close();
		});
	}
}

export function bindVerify2FAForm(username: string) {
	const form = document.getElementById('verify-2fa-form') as HTMLFormElement;
	if (!form) return;
	
	form.addEventListener('submit', async function (event: Event) {
		event.preventDefault();
		console.log("[formHandlers] Handling 2FA verification");

		const token = (document.getElementById('2fa-token') as HTMLInputElement).value;

		try {
			const response = await fetch('/api/auth/verify2fa', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ token, username })
			});

			const data = await response.json() as { success: boolean, error?: string };

			if (!response.ok || data.success === false) {
				throw new Error(data.error || `HTTP error; status: ${response.status}`);
			}

			console.log("[formHandlers] 2FA verification successful");
			alert("2FA verification successful!");

			(window as any).selectView?.("home", false);
		} catch (e) {
			console.error("[formHandlers] 2FA verification failed:", e);
			alert(`2FA verification failed: ${e}`);
		}
	});
}