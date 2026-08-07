import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { DatabaseService } from '../../database/database.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: PrismaHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', this.databaseService),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () =>
        this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }
}
