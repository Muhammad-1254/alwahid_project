import { Injectable } from "@nestjs/common";
import { isEmail, isPhoneNumber } from "class-validator";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { userDataResponse } from "src/lib/utils";
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    let user: User;
    if (isEmail(username)) {
      user = await this.userService.findOneWithEmail(username);
    } else if (isPhoneNumber(username)) {
      user = await this.userService.findOneWithPhoneNumber(username);
    }
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      username: user.email,
      sub: {
        userId: user.id,
        userRole: user.userRole,
      },
    };
   
    return {
      user: userDataResponse(user),
      accessToken:this.jwtService.sign(payload, {
        expiresIn: `${process.env.JWT_TOKEN_EXPIRY}`,
        secret: `${process.env.JWT_SECRET}`,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRY}`,
        secret: `${process.env.JWT_SECRET}`,
      }),
    };
  }

  async refreshToken(user: User) {
    const payload = {
      username: user.email,
      sub: {
        userId: user.id,
        userRole: user.userRole,
      },
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: `${process.env.JWT_SECRET}`,
        expiresIn: `${process.env.JWT_TOKEN_EXPIRY}`,
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: `${process.env.JWT_SECRET}`,
        expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRY}`,
      }),
      
    };
  }
}
