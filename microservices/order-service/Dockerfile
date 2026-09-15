FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm config set dangerously-allow-all-builds true && pnpm install --frozen-lockfile

COPY . .

RUN mkdir -p ./prisma ./src/generated

RUN if [ -f "./prisma/schema.prisma" ]; then \
      pnpm exec prisma generate; \
    fi

RUN pnpm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY package.json ./

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

CMD ["node", "dist/src/main"]