import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenExpiredError } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAccessTokenGuard extends AuthGuard("jwt-access-token") {
  handleRequest(err, user,info ) {


    if(err){
      if(err instanceof TokenExpiredError){
        throw new UnauthorizedException("Jwt token has expired")
      }
      throw err
    }
console.log("info:",info)
    if(!user){
      console.log("user for found console: ",user)
      throw new UnauthorizedException("User not found in access token")
    }
    return user
  }

  
}
