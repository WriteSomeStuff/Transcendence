FROM node

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY tsconfig.json .
COPY pnpm-lock.yaml .
COPY package.json .
RUN pnpm approve-builds --global
RUN pnpm install --frozen-lockfile

COPY src ./src

ENV JWT_SECRET="my_secret"
CMD pnpm tsx src/server.ts
