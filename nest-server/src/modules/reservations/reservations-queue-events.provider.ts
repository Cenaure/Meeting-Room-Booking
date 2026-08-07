import {Provider} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {QueueEvents} from "bullmq";

export const RESERVATIONS_QUEUE_EVENTS = 'RESERVATIONS_QUEUE_EVENTS';

export const reservationsQueueEventsProvider: Provider = {
  provide: RESERVATIONS_QUEUE_EVENTS,
  useFactory: (config: ConfigService) => {
    return new QueueEvents('reservations-queue', {
      connection: {
        host: config.get("redis.host"),
        port: config.get("redis.port"),
        password: config.get("redis.password"),
      },
    });
  },
  inject: [ConfigService],
};