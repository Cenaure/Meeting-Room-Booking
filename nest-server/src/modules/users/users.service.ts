import {Inject, Injectable} from '@nestjs/common';
import {DatabaseService} from "../../database/database.service";
import CreateUserDto from "./dto/create-user.dto";
import {AppException} from "../../common/errors/app-exception";
import {AppExceptionBodyCode} from "../../common/errors/app-exception-body.interface";
import * as bcrypt from 'bcrypt';
import {Cache, CACHE_MANAGER} from "@nestjs/cache-manager";
import {randomUUID} from "crypto";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
  }

  async createUser(dto: CreateUserDto, isActivated: boolean = false, googleId: string | null = null) {
    if (!dto.email)
      throw AppException.badRequest({code: AppExceptionBodyCode.emailRequired, message: "Email is required"})

    if (!dto.username)
      throw AppException.badRequest({code: AppExceptionBodyCode.usernameRequired, message: "Username is required"})

    if (!googleId && !dto.password)
      throw AppException.badRequest({code: AppExceptionBodyCode.passwordRequired, message: "Password is required"})

    const existingUser = await this.databaseService.user.findFirst({
      where: {
        email: dto.email
      }
    });

    if (existingUser)
      throw AppException.badRequest({code: AppExceptionBodyCode.emailTaken, message: "Email is already taken"});

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 12) : undefined;

    const user = await this.databaseService.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password_hash: googleId ? undefined : passwordHash!,
        is_activated: isActivated,
        google_id: googleId
      }
    })

    if (!isActivated) {
      const activationLinkTTL = this.configService.get("auth.activation_link_ttl")

      const activation_id = randomUUID()
      await this.cacheManager.set(`activation_id:${activation_id}`, user.id, activationLinkTTL);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.databaseService.user.findFirst({where: {email}});
  }

  async findById(id: number) {
    return this.databaseService.user.findFirst({where: {id}});
  }

  async updateLastLogin(userId: number) {
    await this.databaseService.user.update({
      where: {id: userId},
      data: {last_login_at: new Date()},
    });
  }

  async setIsActivated(userId: number) {
    await this.databaseService.user.update({
      where: {id: userId},
      data: {is_activated: true}
    })
  }
}
