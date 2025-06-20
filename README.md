# Transcendence

## Setup Instructions

1. **Create a `data` folder**  
	For each backend service, ensure there is a `data` directory. This folder will be used to store the service-specific database.

2. **Configure environment variables**  
	In the project root, create a `.env` file. Add the following line to define your JWT secret:

	```
	JWT_SECRET=your_secret_key_here
	```

	Replace `your_secret_key_here` with a secure value of your choice.