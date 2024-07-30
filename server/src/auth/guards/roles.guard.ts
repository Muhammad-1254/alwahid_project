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
    if (request?.user) {
      const { userId } = request.user;
      const user = await this.userService.findOne(userId);
      console.log({ user });
      return roles.includes(user.role);
    }

    return false;
  }
}
