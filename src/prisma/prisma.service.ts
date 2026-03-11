import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
  const url = dbUrl.replace(/^file:/, '');
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter } as any);
}

export type PrismaClientInstance = ReturnType<typeof createPrismaClient>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClientInstance;

  readonly user: PrismaClientInstance['user'];
  readonly workoutPlan: PrismaClientInstance['workoutPlan'];

  constructor() {
    this.client = createPrismaClient();
    this.user = this.client.user;
    this.workoutPlan = this.client.workoutPlan;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
