import {Injectable} from '@nestjs/common';
import {DatabaseService} from "../../database/database.service";
import CreateUserDto from "./dto/create-user.dto";
import {AppException} from "../../common/errors/app-exception";
import {AppExceptionBodyCode} from "../../common/errors/app-exception-body.interface";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService
  ) {
  }

  async createUser(dto: CreateUserDto) {
    if (!dto.email)
      throw AppException.badRequest({code: AppExceptionBodyCode.emailRequired, message: "Email is required"})

    if (!dto.username)
      throw AppException.badRequest({code: AppExceptionBodyCode.usernameRequired, message: "Username is required"})

    const existingUser = await this.databaseService.user.findFirst({
      where: {
        email: dto.email
      }
    });

    if (existingUser)
      throw AppException.badRequest({code: AppExceptionBodyCode.emailTaken, message: "Email is already taken"});

    const passwordHash = await bcrypt.hash(dto.password, 12);

    //TODO: activation link

    return this.databaseService.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password_hash: passwordHash,
        is_activated: false
      }
    })
  }

  async findByEmail(email: string) {
    return this.databaseService.user.findFirst({where: {email}});
  }

  async updateLastLogin(userId: number) {
    await this.databaseService.user.update({
      where: {id: userId},
      data: {last_login_at: new Date()},
    });
  }
}
