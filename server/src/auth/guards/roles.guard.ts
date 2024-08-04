import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserService } from "src/user/user.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>("roles", context.getHandler());
    console.log({ roles });
    const request = context.switchToHttp().getRequest();
    console.log("request?.user: ",request?.user);
    if (request?.user) {
      const { userRole } = request.user;
      return roles.includes(userRole);
    }

    return false;
  }
}
