import { Body, Controller, Post,  Request, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local.guard";
import { AuthService } from "./auth.service";
import { JwtRefreshTokenGuard } from "./guards/jwt-refresh-token.guard";
import {
  CreateUserApprovedCreatorUserDTO,
  CreateUserCreatorUserRequestAdminDTO,
  CreateUserDto,
} from "src/user/dto/create-user.dto";
import { RolesGuard } from "./guards/roles.guard";
import { Roles } from "./roles.decorator";
import { UserRoleEnum } from "src/lib/types/user";
import { JwtAccessTokenGuard } from "./guards/jwt-access-token.guard";


@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // create normal user
  @Post("create/normal/user")
  createNormalUser(@Body() createUser: CreateUserDto) {
    return this.authService.createNormalUser(createUser);
  }

  // normal user request admin ot creator user to be creator user
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(UserRoleEnum.NORMAL)
  @Post("normal-user-request-to-be-creator/request")
  normalUserRequestForCreator(
    @Request() req,
    @Body() userRequest: CreateUserCreatorUserRequestAdminDTO,
  ) {
    return this.authService.normalUserRequestForCreator(req.user, userRequest);
  }

  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.NORMAL)
  @Post("normal-user-request-to-be-creator/approved")
  normalUserRequestForCreatorApprove(
    @Request() req,
    @Body() userRequest: CreateUserApprovedCreatorUserDTO,
  ) {
    return this.authService.normalUserRequestForCreatorApprove(
      req.user,
      userRequest,
    );
  }

  @Post("create/admin")
    createAdminUser(@Body() user:{userId:string}) {
        return this.authService.createAdminUser(user);
    }


  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req,@Body() body:{role:UserRoleEnum}) {
    return this.authService.login(req.user,body.role);
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Post("refresh-token")
  async refreshToken(@Request() req,) {
    return this.authService.refreshToken(req.user);
  }
}
