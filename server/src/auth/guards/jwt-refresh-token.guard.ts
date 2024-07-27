import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtRefreshTokenGuard extends AuthGuard("jwt-refresh-token") {
  handleRequest(err, user, info) {
    console.log("inside jwt refresh token guard");
    console.log("user", user);
    console.log("info", info);
    console.log("err", err);
    if (err || !user) {
      throw err || new Error(info.message);
    }
    return user;
  }

  
}
