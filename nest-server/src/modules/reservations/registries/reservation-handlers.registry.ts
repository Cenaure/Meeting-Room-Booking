import {Inject, Injectable, Logger} from '@nestjs/common';
import {ReservationHandler} from "../handlers/reservation-handler.interface";
import {RESERVATION_HANDLER_REGISTRY} from "./reservation-handler-registry.provider";

@Injectable()
export class ReservationHandlerRegistry {
  private readonly logger = new Logger(ReservationHandlerRegistry.name);
  private readonly handlers = new Map<string, ReservationHandler>();

  constructor(@Inject(RESERVATION_HANDLER_REGISTRY) handlers: ReservationHandler[]) {
    for (const handler of handlers) {
      if (this.handlers.has(handler.type)) {
        throw new Error(`Duplicate reservation handler for type "${handler.type}"`);
      }
      this.handlers.set(handler.type, handler);
    }
  }

  getHandler(type: string): ReservationHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      this.logger.error(`No reservation handler registered for type "${type}"`);
      throw new Error(`Unknown reservation type: ${type}`);
    }
    return handler;
  }
}