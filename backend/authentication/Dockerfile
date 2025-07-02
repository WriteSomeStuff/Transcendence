ARG NODE_VERSION=24.0.1

FROM node:${NODE_VERSION}-slim

RUN apt-get update && \
	apt-get install -y curl python3 make g++ && \
	ln -s /usr/bin/python3 /usr/bin/python && \
	npm install -g typescript

WORKDIR /app

RUN --mount=type=bind,source=package.json,target=package.json \
	--mount=type=bind,source=package-lock.json,target=package-lock.json \
	--mount=type=cache,target=/root/.npm \
	npm ci --verbose

COPY tsconfig.json .
COPY package.json .
COPY package-lock.json .

COPY src ./src

RUN mkdir -p /data

RUN npm run build

EXPOSE 8081

CMD ["npm", "run", "start"]