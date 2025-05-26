ARG NODE_VERSION=24.0.1

FROM node:${NODE_VERSION}-slim

WORKDIR /app

RUN --mount=type=bind,source=package.json,target=package.json \
	--mount=type=bind,source=package-lock.json,target=package-lock.json \
	--mount=type=cache,targer=/root/.npm \
	npm ci
	# --omit=dev

COPY . .

RUN npm run build

ENV JWT_SECRET="jwt_secret"

RUN npm run start