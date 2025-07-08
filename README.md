# Transcendence

## Setup Instructions

1. **Configure environment variables**  
	In the project root, create a `.env` file. Add the following line to define your JWT secret:

	```
	JWT_SECRET=your_secret_key_here
	```

	Replace `your_secret_key_here` with a secure value of your choice.

2. **Run**
	Use `make all` to create all necessary data folders and run docker compose to start up the containers
