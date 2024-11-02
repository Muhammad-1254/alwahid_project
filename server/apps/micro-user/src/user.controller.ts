import { Controller, Inject, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import {
  JwtAuthGuardTrueType,
  MicroservicesNames,
  SharedService,
} from "@app/shared";
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import {
  FollowToAnotherUserPayloadType,
  getProfileAvatarUploadPresignedUrlPayloadType,
  getUserFollowersPayloadType,
  GetUsersSearchPayloadType,
  UnFollowToAnotherUserPayloadType,
  updateProfileAvatarPayloadType,
  updateUserBasicDataPayloadType,
} from "./types/user-payload.type";
import { firstValueFrom } from "rxjs";

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly sharedService: SharedService,
  ) {}

  // @MessagePattern({cmd:"createUserLocation"}) // create user home location
  // createUserLocation(@Ctx() context: RmqContext,@Payload() createUserLocation: createUserLocationDTO) {
  //   this.sharedService.acknowledgeMessage(context)
  //   return this.userService.createUserLocation(createUserLocation);
  // }

 
  // @Get()
  // findAll() {
  //   return this.userService.findAllUsers();
  // }

  // @UseGuards(JwtAccessTokenGuard)
  // @Get("/protected")
  // findProtectedUser(@Request() req) {
  //   console.log("req.user", req.user);
  //   return this.userService.findOne(req.user.userId);
  // }

  @MessagePattern({ cmd: "getAllUsers" })
  getAllUsers(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.getAllUsers();
  }

  @MessagePattern({ cmd: "getUsersSearch" })
  async getUsersSearch(
    @Ctx() context: RmqContext,
    @Payload() data: GetUsersSearchPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.getUsersSearch(data);
  }
  @MessagePattern({ cmd: "get-unsecure-user" })
  getUnsecureUser(
    @Ctx() context: RmqContext,
    @Payload() data: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.getUnsecureUser(data.userId);
  }

  @MessagePattern({ cmd: "getUserProfile" })
  getUserProfile(
    @Ctx() context: RmqContext,
    @Payload() user: JwtAuthGuardTrueType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.getUserProfile(user);
  }

  @MessagePattern({ cmd: "getUserProfileComplete" })
  getUserProfileComplete(
    @Ctx() context: RmqContext,
    @Payload() user: JwtAuthGuardTrueType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.getUserProfileComplete(user);
  }

  
  @MessagePattern({ cmd: "getProfileAvatarUploadPresignedUrl" })
  getProfileAvatarUploadPresignedUrl(
    @Ctx() context: RmqContext,
    @Payload() data: getProfileAvatarUploadPresignedUrlPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.getProfileAvatarUploadPresignedUrl(data);
  }
  @MessagePattern({ cmd: "getUserByEmail" })
  getUserByEmail(
    @Ctx() context: RmqContext,
    @Payload() data: { email: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.getUserByEmail(data.email);
  }

  @MessagePattern({ cmd: "updateProfileAvatar" })
  updateProfileAvatar(
    @Ctx() context: RmqContext,
    @Payload() data: updateProfileAvatarPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.updateProfileAvatar(data);
  }
  @MessagePattern({ cmd: "updateUserBasicData" })
  updateUserBasicData(
    @Ctx() context: RmqContext,
    @Payload() data: updateUserBasicDataPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.updateUserBasicData(data);
  }

  // user following related
  @MessagePattern({ cmd: "followToAnotherUser" })
  followToAnotherUser(
    @Ctx() context: RmqContext,
    @Payload() data: FollowToAnotherUserPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.followToAnotherUser(data);
  }
  
  @MessagePattern({ cmd: "getUserFollowers" })
  getUserFollowers(
    @Ctx() context: RmqContext,
    @Payload() data: getUserFollowersPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.getUserFollowers(data);
  }

  @MessagePattern({ cmd: "getUserFollowing" })
  getUserFollowing(
    @Ctx() context: RmqContext,
    @Payload() data: getUserFollowersPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.getUserFollowing(data);
  }

  @MessagePattern({ cmd: "unFollowToAnotherUser" })
  unFollowToAnotherUser(
    @Ctx() context: RmqContext,
    @Payload() data: UnFollowToAnotherUserPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.userService.unFollowToAnotherUser(data);
  }

  

  @MessagePattern({ cmd: "findOneWithEmailOrPhoneNumberForLogin" })
  async findOneWithEmailOrPhoneNumberForLogin(
    @Ctx() context: RmqContext,
    @Payload() data: { email?: string; phoneNumber?: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.userService.findOneWithEmailOrPhoneNumberForLogin(data);
  }
}
