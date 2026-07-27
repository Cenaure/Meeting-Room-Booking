import { Injectable } from '@nestjs/common';
import {PrismaPg} from "@prisma/adapter-pg";
import {ConfigService} from "@nestjs/config";
import {PrismaClient} from "./generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(
    private readonly configService: ConfigService
  ) {
    const dbConnectionString = configService.get('db.url')

    const adapter = new PrismaPg({ connectionString: dbConnectionString });
    super({ adapter });
  }
}