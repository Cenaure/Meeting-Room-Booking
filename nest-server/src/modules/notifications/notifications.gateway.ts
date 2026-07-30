import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import {Logger} from "@nestjs/common";
import {Server, Socket} from "socket.io";
import {JwtService} from "@nestjs/jwt";
import {AccessJwtPayload} from "../../common/dto/jwt-payload.dto";
import {ConfigService} from "@nestjs/config";

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
  }

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway initialized");
  }

  async handleConnection(client: Socket) {
    try {
      const token: string | undefined = client.handshake.auth?.token as
        | string
        | undefined;

      if (!token) {
        this.logger.warn(`Client ${client.id} tried to connect without token`);
        client.disconnect();
        return;
      }

      const user = this.getUserFromToken(token);

      if (!user) {
        this.logger.warn(`Client ${client.id} provided invalid token`);
        client.disconnect();
        return;
      }

      await client.join(user.user_id.toString());
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private getUserFromToken(accessToken: string) {
    const accessTokenSecret = this.configService.get("auth.access_token_secret")

    try {
      return this.jwtService.verify<AccessJwtPayload>(accessToken, {
        secret: accessTokenSecret,
      });
    } catch {
      return null;
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
