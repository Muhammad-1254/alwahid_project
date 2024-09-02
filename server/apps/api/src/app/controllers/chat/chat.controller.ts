import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Inject,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import { MicroservicesNames, SharedService, UserRoleEnum } from "@app/shared";
import { JwtAuthGuard } from "@app/shared/guards/jwt-access-token.global.guard";
import { RolesGuard } from "@app/shared/guards/roles.guard";
import { Roles } from "@app/shared/decorators/roles.decorator";
import {
  CreateAddUserInChatGroupDto,
  CreateChatGroupDto,
  CreateNewUserInChatSectionDto,
} from "@app/shared/dtos/chat/create-chat.dto";
import { ApiTags } from "@nestjs/swagger";
import { UpdateChatGroupDto } from "@app/shared/dtos/chat/update-chat.dto";
import { RemoveUserInChatGroupDto } from "@app/shared/dtos/chat/remove-chat.dto";

@ApiTags("Chats")
@Controller("chats")
export class ChatController {
  constructor(
    @Inject(MicroservicesNames.CHAT_SERVICE)
    private readonly chatService: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  async createNewUserInChatSection(@Request() req, @Body() createNewUserInChatSectionDto:CreateNewUserInChatSectionDto) {
    return this.chatService.send({ cmd: "createNewUserInChatSection" }, {user:req.user, createNewUserInChatSectionDto});
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CREATOR, UserRoleEnum.ADMIN)
  @Post("group/new")
  async createChatGroup(
    @Request() req,
    @Body() createChatGroupDto: CreateChatGroupDto,
  ) {
    return this.chatService.send(
      { cmd: "createChatGroup" },
      {
        user: req.user,
        createChatGroupDto,
      },
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CREATOR, UserRoleEnum.ADMIN)
  @Post("group/add-users")
  async addUserInChatGroup(
    @Request() req,
    @Body() createAddUserInChatGroupDto: CreateAddUserInChatGroupDto,
  ) {
    return this.chatService.send(
      { cmd: "addUserInChatGroup" },
      {
        user: req.user,
        createAddUserInChatGroupDto,
      },
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CREATOR, UserRoleEnum.ADMIN)
  @Patch("group/update/info")
  async updatedChatGroupInfo(
    @Request() req,
    @Body() updateChatGroupDto: UpdateChatGroupDto,
  ) {
    return this.chatService.send(
      { cmd: "updatedChatGroupInfo" },
      {
        user: req.user,
        updateChatGroupDto,
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete("group/remove/user")
  async leaveChatGroup(
    @Request() req,
    @Body() removeUserInChatGroupDto: RemoveUserInChatGroupDto,
  ) {
    return this.chatService.send(
      { cmd: "leaveChatGroup" },
      {
        user: req.user,
        removeUserInChatGroupDto,
      },
    );
  }
}
