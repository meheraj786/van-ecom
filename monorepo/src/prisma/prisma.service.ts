import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Pool } from "pg";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");
const defaultLookup = dns.lookup.bind(dns);
dns.lookup = ((hostname: string, options: unknown, callback?: unknown) => {
  if (typeof options === "function") {
    return defaultLookup(hostname, { family: 4 }, options as never);
  }

  return defaultLookup(
    hostname,
    { ...(options as object), family: 4 },
    callback as never,
  );
}) as typeof dns.lookup;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL?.replace(
      /([?&])sslmode=require(&|$)/,
      "$1sslmode=verify-full$2",
    );
    if (!connectionString) {
      throw new Error("DATABASE_URL is required for the modular monolith.");
    }

    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10_000,
    });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Connected to PostgreSQL through Prisma.");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
