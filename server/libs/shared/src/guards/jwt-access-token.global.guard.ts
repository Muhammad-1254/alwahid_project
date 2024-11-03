import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JsonWebTokenError, JwtService } from "@nestjs/jwt";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class JwtAuthGuard implements CanActivate{
  constructor(
    private readonly jwtService:JwtService,
    private readonly configService:ConfigService
  ) {}

  async canActivate(context: ExecutionContext):Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token =this.extractTokenFromHeader(request);

    if(!token){
      throw new UnauthorizedException("No token provided")
    }

    try {
      const decoded = await this.verifyToken(token);
      request.user = decoded;
    } catch (error) {
      throw new UnauthorizedException("Invalid token")
    }
    return true
    
  }
  private extractTokenFromHeader(request:any):string|null{
    const authHeader = request.headers['authorization'];
    if(!authHeader){
      console.log("No auth header")
      return null
    }
    const [,token] = authHeader.split(' ');
    return token ||null
  }
  
  private async verifyToken(token:string):Promise<any>{
    try {
      const decoded = await this.jwtService.verify(token, {
        ignoreExpiration: false,
        secret: this.configService.get("JWT_SECRET"),
      });
      return {
        email: decoded.email,
        userId: decoded.sub.userId,
        userRole: decoded.sub.userRole
      };
    } catch (error) {
      const errorResponse = {
        message: "Invalid Token",
        statusCode: 401,
        timestamp: new Date().toISOString(),
      }
      if (error instanceof JsonWebTokenError) {
        if (error.message === "jwt expired") {
          throw new RpcException({...errorResponse, message: "Token expired"});
        } else if (error.message === "invalid token") {
          throw new RpcException(errorResponse);
        } else {
          throw new RpcException({...errorResponse, message: "Token expired"});
        }
      }else {
        console.log("error in verifyJwtToken", error);
      }
    }
  }

}