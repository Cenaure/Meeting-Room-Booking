import {Job} from "bullmq";
import {NotificationTypes} from "../utils/notification-types.constants";

export interface INotificationJobData {
  userId: number;

  [key: string]: unknown;
}

/**
 * Common Interface for Notification Handlers
 * Makes able to easily add a new notification type and corresponding handler that realises OCP SOLID principle
 * I have watched this video today and get inspired to do this stuff https://youtu.be/vE74gnv4VlY?si=8G-Z3azeFpINnXye&t=420 :)
 */
export abstract class NotificationHandler<TJobData extends INotificationJobData = INotificationJobData> {
  abstract readonly type: NotificationTypes;

  async processNotification(job: Job<TJobData>): Promise<void> {
    throw new Error("Not implemented.");
  };
}