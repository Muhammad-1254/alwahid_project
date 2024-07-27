import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAccessTokenGuard extends AuthGuard("jwt-access-token") {
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new Error(info.message);
    }
    return user;
  }

  
}