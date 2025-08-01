# Transcendence

## Setup Instructions

1. **Configure environment variables**
	In the project root, create a `.env` file. Add the following lines to define your environment variables:

	```
	# JWT secret for authentication
	JWT_SECRET=your_secret_key_here

	# 42 API OAuth credentials
	OAUTH_CLIENT_ID=your_42_client_id
	OAUTH_CLIENT_SECRET=your_42_client_secret
	OAUTH_REDIRECT_URI=https://[HOST IP]:8443/login
	```

	Replace the placeholder values with your actual secrets and configuration.

2. **Run**
	Use `make all` to create all necessary data folders and run docker compose to start up the containers
