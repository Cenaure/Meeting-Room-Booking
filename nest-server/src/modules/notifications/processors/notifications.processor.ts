import {Processor, WorkerHost} from "@nestjs/bullmq";
import {Job} from "bullmq";
import {NotificationHandlerRegistry} from "../registries/notifications-handlers.registry";
import {INotificationJobData} from "../handlers/notification-handler.interface";

@Processor('notifications-queue')
export class NotificationsProcessor extends WorkerHost {
  constructor(
    private readonly handlerRegistry: NotificationHandlerRegistry,
  ) {
    super();
  }

  /**
   * Receives from the notification handler registry a handler that corresponds to the job name and calls its process method to process notification
   */
  async process(job: Job<INotificationJobData>) {
    const handler = this.handlerRegistry.getHandler(job.name);
    await handler.processNotification(job);
  }
}