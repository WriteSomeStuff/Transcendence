// const enable2FAButton = document.getElementById('enable-2fa') as HTMLButtonElement | null;
// const disable2FAButton = document.getElementById('disable-2fa') as HTMLButtonElement | null;
// if (enable2FAButton) {
// 	enable2FAButton.addEventListener('click', async () => {
// 		enable2FAButton.disabled = true; // Disable the button to prevent multiple clicks
// 		disable2FAButton?.setAttribute('disabled', 'false'); // Enable the disable button
// 		try {
// 			const response = await fetch('/auth/2fa/enable', {
// 				method: 'POST',
// 				headers: {
// 					'Content-Type': 'application/json'
// 				}
// 			});
// 			const data = await response.json();
// 			if (!response.ok || !data.success) {
// 				throw new Error(data.error || `HTTP error; status: ${response.status}`);
// 			}
// 			alert('2FA enabled successfully!');
// 			window.location.reload(); // Reload to reflect changes
// 		} catch (error) {
// 			console.error('Error enabling 2FA:', error);
// 			alert(`Failed to enable 2FA: ${error.message}`);
// 		}
// 	});
// }
// if (disable2FAButton) {
// 	disable2FAButton.addEventListener('click', async () => {
// 		disable2FAButton.disabled = true; // Disable the button to prevent multiple clicks
// 		enable2FAButton?.setAttribute('disabled', 'false'); // Enable the enable button
// 		try {
// 			const response = await fetch('/auth/2fa/disable', {
// 				method: 'POST',
// 				headers: {
// 					'Content-Type': 'application/json'
// 				}
// 			});
// 			const data = await response.json();
// 			if (!response.ok || !data.success) {
// 				throw new Error(data.error || `HTTP error; status: ${response.status}`);
// 			}
// 			alert('2FA disabled successfully!');
// 			window.location.reload(); // Reload to reflect changes
// 		} catch (error) {
// 			console.error('Error disabling 2FA:', error);
// 			alert(`Failed to disable 2FA: ${error.message}`);
// 		}
// 	});
// }
