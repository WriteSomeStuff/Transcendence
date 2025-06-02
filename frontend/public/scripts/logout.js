document.getElementById('logoutButton').addEventListener('click', function() {
	fetch('/auth/logout', { method: 'DELETE' })
		.then(response => {
			if (response.ok) {
				window.location.href = '/';
			} else {
				alert('Logout failed.');
			}
		})
		.catch(error => {
			console.error('Error:', error);
			alert('An error occurred.');
		});
});
