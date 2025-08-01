# Transcendence

## Setup Instructions

1. **Configure environment variables**
	In the project root, create a `.env` file. Add the following lines to define your environment variables:

	```
	# JWT secret for authentication
	JWT_SECRET=your_secret_key_here

	# 42 API OAuth credentials
	OAUTH_CLIENT_ID=u-s4t2ud-8d8b4e3ec810b44f16a15682b4eff92576907e56913d485b18d0e10f1f6bcbdd
	OAUTH_CLIENT_SECRET=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
	OAUTH_REDIRECT_URI=https://[HOST IP]:8443/login
	```

	Replace the placeholder values with your actual secrets and configuration.

2. **Run**
	Use `make all` to create all necessary data folders and run docker compose to start up the containers
