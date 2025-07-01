export function bind2FAButtons() {
	const enable2FAButton = document.getElementById('enable-2fa') as HTMLButtonElement;
	const disable2FAButton = document.getElementById('disable-2fa') as HTMLButtonElement;

	if (enable2FAButton) {
		enable2FAButton.addEventListener('click', async () => {
			enable2FAButton.disabled = true; // Disable the button to prevent multiple clicks
			disable2FAButton?.setAttribute('disabled', 'false');
			try {
				const response = await fetch('/auth/2fa/enable', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					}
				});
				const data = await response.json(); //look at resonse of enable2FAHandler
				if (!response.ok || !data.success) {
					throw new Error(data.error || `HTTP error; status: ${response.status}`);
				}
				alert('2FA enabled successfully!');
				// (window as any).selectView?.("profile", false); check if needed
			} catch (error) {
				console.error('Error enabling 2FA:', error);
				const message = error instanceof Error ? error.message : String(error);
				alert(`Failed to enable 2FA: ${message}`);
			}
		});
	}

	if (disable2FAButton) {
		disable2FAButton.addEventListener('click', async () => {
			disable2FAButton.disabled = true; // Disable the button to prevent multiple clicks
			enable2FAButton?.setAttribute('disabled', 'false');
			try {
				const response = await fetch('/auth/2fa/disable', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					}
				});
				const data = await response.json(); //look at response of disable2FAHandler
				if (!response.ok || !data.success) {
					throw new Error(data.error || `HTTP error; status: ${response.status}`);
				}
				alert('2FA disabled successfully!');
				// (window as any).selectView?.("profile", false); check if needed
			} catch (error) {
				console.error('Error disabling 2FA:', error);
				const message = error instanceof Error ? error.message : String(error);
				alert(`Failed to disable 2FA: ${message}`);
			}
		});
	}
}