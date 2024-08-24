import { Body, Controller, Inject, Post,  Req,  Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  CreateUserDto,
  SharedService,
} from "@app/shared";
import { Roles } from "../../../libs/shared/src/decorators/roles.decorator";
import { UserRoleEnum } from "@app/shared/enums/user.enum";
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { normalUserRequestForCreatorApprovePayloadType, normalUserRequestForCreatorPayloadType } from "./types/auth-payload.type";
import { User } from "apps/micro-user/src/entities";
import { RolesGuard } from "@app/shared/guards/roles.guard";


@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sharedService: SharedService,
  ) {}

  // create normal user
  @MessagePattern({cmd:"createNormalUser"})
  createNormalUser(
    @Ctx() context:RmqContext,
    @Payload() data:CreateUserDto
    ) {
      this.sharedService.acknowledgeMessage(context)
    return this.authService.createNormalUser(data);
  }

  // normal user request admin ot creator user to be creator user
  @MessagePattern({cmd:"normalUserRequestForCreator"})
  normalUserRequestForCreator(
      @Ctx() context:RmqContext,
      @Payload() data:normalUserRequestForCreatorPayloadType
      ) {
        this.sharedService.acknowledgeMessage(context)
    return this.authService.normalUserRequestForCreator(data);
  }

  @MessagePattern({cmd:"normalUserRequestForCreatorApprove"})
  normalUserRequestForCreatorApprove(
    @Ctx() context:RmqContext,
    @Payload() data:normalUserRequestForCreatorApprovePayloadType
    ) {
      this.sharedService.acknowledgeMessage(context)
    return this.authService.normalUserRequestForCreatorApprove(
data
    );
  }

  @MessagePattern({cmd:"createAdminUser"})
    createAdminUser(
      @Ctx() context:RmqContext,
      @Payload() data:{userId:string}
      ) {
        this.sharedService.acknowledgeMessage(context)
        return this.authService.createAdminUser(data);
    }


  @MessagePattern({cmd:"login"})
  async login(
    @Ctx() context:RmqContext,
    @Payload() data:{email:string,password:string,role:UserRoleEnum}
    ) {
      this.sharedService.acknowledgeMessage(context)
    return this.authService.login(data);
  }
  @MessagePattern({cmd:"getAccessToken"})

  async getAccessToken(
    @Ctx() context:RmqContext,
    @Payload() data:{refreshToken:string}
    ) {
      this.sharedService.acknowledgeMessage(context)
      console.log("refresh token from auth controller: ",data )
    return await this.authService.getAccessToken(data.refreshToken);
  }
}
