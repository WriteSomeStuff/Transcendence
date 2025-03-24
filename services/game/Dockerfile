FROM node

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY pnpm-lock.yaml .
COPY package.json .
RUN pnpm approve-builds --global
RUN pnpm install --frozen-lockfile

COPY src ./src
COPY assets ./assets

CMD pnpm tsx src/server.ts
