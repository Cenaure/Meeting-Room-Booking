import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
  ) {
    // smtp configuration...
  }

  private readonly logger = new Logger(MailService.name);

  private async sendMail(
    to: string,
    subject: string,
    body: string,
  ): Promise<void> {
    this.logger.warn(`Mail sent [to: ${to}]: ${subject}, body: ${body}`)
  }

  async sendActivationMail(to: string, uuid: string) {
    const clientUrl = this.configService.get("frontend.client_url")

    const link = clientUrl + "/email-activation?activate=" + uuid

    await this.sendMail(
      to,
      `Активація акаунту`,
      `посилання - ${link}`
    );
  }

  // password recovery mail...
}
