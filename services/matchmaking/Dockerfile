FROM node

WORKDIR /app
COPY tsconfig.json .
COPY pnpm-lock.yaml .
COPY package.json .

RUN corepack enable && corepack prepare --activate
RUN pnpm approve-builds --global
RUN pnpm install --frozen-lockfile

COPY src ./src

CMD pnpm tsx src/server.ts
