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