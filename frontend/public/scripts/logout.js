document.getElementById('logoutButton').addEventListener('click', function() {
	fetch('/logout', { method: 'DELETE' })
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

// TODO: is it allowed to wrtie js or should it be ts as well?