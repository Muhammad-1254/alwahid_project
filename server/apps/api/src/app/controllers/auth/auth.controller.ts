import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";

import { UserRoleEnum } from "@app/shared/enums/user.enum";
import {
  MicroservicesNames,
  CreateUserApprovedCreatorUserDTO,
  CreateUserCreatorUserRequestAdminDTO,
  CreateUserDto,
} from "@app/shared";
import { ClientProxy } from "@nestjs/microservices";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@app/shared/guards/jwt-access-token.global.guard";
import { RolesGuard } from "@app/shared/guards/roles.guard";
import { Roles } from "@app/shared/decorators/roles.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    @Inject(MicroservicesNames.AUTH_SERVICE)
    private readonly authService: ClientProxy,
  ) {}

  // create normal user
  @Post("create/normal/user")
  createNormalUser(@Body() createUser: CreateUserDto) {
    return this.authService.send({ cmd: "createNormalUser" }, createUser);
  }

  // normal user request admin ot creator user to be creator user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.NORMAL)
  @Post("normal-user-request-to-be-creator/request")
  normalUserRequestForCreator(
    @Request() request,
    @Body() userRequest: CreateUserCreatorUserRequestAdminDTO,
  ) {
    return this.authService.send(
      { cmd: "normalUserRequestForCreator" },
      { request, userRequest },
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.NORMAL)
  @Post("normal-user-request-to-be-creator/approved")
  normalUserRequestForCreatorApprove(
    @Request() req,
    @Body() userRequest: CreateUserApprovedCreatorUserDTO,
  ) {
    return this.authService.send(
      { cmd: "normalUserRequestForCreatorApprove" },
      {
        user: req.user,
        userRequest,
      },
    );
  }

  @Post("create/admin")
  createAdminUser(@Body() user: { userId: string }) {
    return this.authService.send({ cmd: "createAdminUser" }, user);
  }

  @Post("login")
  async login(@Body() user: { email: string; password: string, role: UserRoleEnum }) {
    return this.authService.send(
      { cmd: "login" },
      user ,
    );
  }

  @Post("refresh-token")
  async getAccessToken(@Body() payload: { refreshToken: string }) {
    return  this.authService.send({ cmd: "getAccessToken" }, payload)
  }
}
