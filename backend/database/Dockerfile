ARG NODE_VERSION=24.0.1

FROM node:${NODE_VERSION}-slim

RUN apt-get update && \
	apt-get install -y python3 make g++ && \
	ln -s /usr/bin/python3 /usr/bin/python && \
	npm install -g typescript

WORKDIR /app

RUN --mount=type=bind,source=package.json,target=package.json \
	--mount=type=bind,source=package-lock.json,target=package-lock.json \
	--mount=type=cache,target=/root/.npm \
	npm ci --verbose

COPY . .

# RUN npm rebuild better-sqlite3

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]