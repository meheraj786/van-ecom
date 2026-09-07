# Ecommerce NestJS monorepo

This is a single NestJS modular monolith representation of the services under
`../services`. The original microservice projects remain untouched.

## Structure

All HTTP and WebSocket features live under `src/` and share the global
`PrismaService`. PostgreSQL is the only persistence layer; Mongoose, MongoDB,
Redis, RabbitMQ, and inter-service HTTP/RPC calls are not used by this app.

The unified Prisma model is in `prisma/schema.prisma` and includes users,
customers, vendors, products, inventory, carts, orders, coupons, divisions,
reviews, chat, themes, and contact messages.

## Setup

```bash
pnpm install
```

Copy `.env.example` to `.env` and set the PostgreSQL connection string and other
application credentials.

## Commands

Build the application:

```bash
pnpm build
```

Production start command:

```bash
pnpm start:prod
```

Validate and generate Prisma:

```bash
pnpm prisma:validate
pnpm prisma:generate
pnpm prisma:migrate
```
