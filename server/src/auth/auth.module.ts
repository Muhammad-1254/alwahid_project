import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import { LocalStrategy } from "./strategies/local.strategy";
import { UserService } from "src/user/user.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtAccessTokenStrategy } from "./strategies/jwt-access-token.strategy";
import { JwtRefreshTokenStrategy } from "./strategies/jwt-refresh-token.strategy";

@Module({
  imports: [
    PassportModule,
    UserModule,
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: `${process.env.JWT_TOKEN_EXPIRY}` },
      verifyOptions: { ignoreExpiration: false },
    }),
  ],
  providers: [AuthService, UserService, LocalStrategy, JwtAccessTokenStrategy,JwtRefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}