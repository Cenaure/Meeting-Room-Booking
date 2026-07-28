import {Injectable} from '@nestjs/common';
import {PrismaClient} from "../generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor(
    private readonly configService: ConfigService
  ) {
    const dbConnectionString = configService.get('db.url')

    const adapter = new PrismaPg({ connectionString: dbConnectionString });
    super({ adapter });
  }
}
