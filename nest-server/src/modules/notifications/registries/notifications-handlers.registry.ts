import {Inject, Injectable, Logger} from '@nestjs/common';
import {NotificationHandler} from '../handlers/notification-handler.interface';

@Injectable()
export class NotificationHandlerRegistry {
  private readonly logger = new Logger(NotificationHandlerRegistry.name);
  private readonly handlers = new Map<string, NotificationHandler>();

  constructor(@Inject("NOTIFICATION_HANDLER_REGISTRY") handlers: NotificationHandler[]) {
    for (const handler of handlers) {
      if (this.handlers.has(handler.type)) {
        throw new Error(`Duplicate notification for type "${handler.type}"`);
      }
      this.handlers.set(handler.type, handler);
    }
  }

  getHandler(type: string): NotificationHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      this.logger.error(`No notification handler registered for type "${type}"`);
      throw new Error(`Unknown notification type: ${type}`);
    }
    return handler;
  }
}