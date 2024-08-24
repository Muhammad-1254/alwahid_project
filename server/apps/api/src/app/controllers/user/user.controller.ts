import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Request,
  Inject,
  UseGuards,
} from "@nestjs/common";

import {
  MicroservicesNames,
  UpdateUserBasicDataDto,
  UserRoleEnum,
} from "@app/shared";
import { ClientProxy } from "@nestjs/microservices";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@app/shared/guards/jwt-access-token.global.guard";
import { RolesGuard } from "@app/shared/guards/roles.guard";
import { Roles } from "@app/shared/decorators/roles.decorator";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(
    @Inject(MicroservicesNames.USER_SERVICE)
    private readonly userService: ClientProxy,
  ) {}

  // @Post("create/location") // create user home location
  // createUserLocation(@Body() createUserLocation: createUserLocationDTO) {
  //   return this.userService.send({cmd:"createUserLocation",},createUserLocation);
  // }
  // @UseGuards(JwtAuthGuard)
  // @Post("create/follow")
  // followToAnotherUser(@Request() req, @Query("followTo") followTo: string) {
  //   return this.userService.send(
  //     { cmd: "followToAnotherUser" },
  //     { user: req.user.userId, followTo },
  //   );
  // }

  // @Get()
  // findAll() {
  //   return this.userService.send({ cmd: "findAllUsers" }, {});
  // }
  // @UseGuards(JwtAuthGuard)
  // @Get("/protected")
  // findProtectedUser(@Request() req) {
  //   console.log("req.user", req.user);
  //   return this.userService.send(
  //     { cmd: "findOne" },
  //     { userId: req.user.userId },
  //   );
  // }

  
  @UseGuards(JwtAuthGuard)
  @Get("all")
  getAllUsers(
  ) {
    return this.userService.send(
      { cmd: "getAllUsers" },
      {},
    );
  }


  @UseGuards(JwtAuthGuard)
  @Get("get/profile")
  getUserProfile(@Request() req) {
    return this.userService.send({ cmd: "getUserProfile" }, req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Get("get/profile/complete")
  getUserProfileComplete(@Request() req) {
    return this.userService.send({ cmd: "getUserProfileComplete" }, req.user);
  }

  @Get("get-user-followers")
  getUserFollowers(
    @Query("userId") userId: string,
    @Query("skip") skip: number,
    @Query("take") take: number,
    @Query("orderDesc") orderDesc: boolean = true,
  ) {
    return this.userService.send(
      { cmd: "getUserFollowers" },
      { userId, skip,take, orderDesc },
    );
  }

  @Get("get-user-following")
  getUserFollowing(
    @Query("userId") userId: string,
    @Query("skip") skip: number,
    @Query("take") take: number,
    @Query("orderDesc") orderDesc: boolean = true,
  ) {
    return this.userService.send(
      { cmd: "getUserFollowing" },
      { userId, skip, take, orderDesc },
    );
  }

  // TODO: add aws separate service to handle this
  @UseGuards(JwtAuthGuard)
  @Post("profile/avatar/presigned-url")
  getProfileAvatarUploadPresignedUrl(
    @Request() req,
    @Body() fileProps: { filename: string; fileSize: number; mimeType: string },
  ) {
    return this.userService.send(
      { cmd: "getProfileAvatarUploadPresignedUrl" },
      { user: req.user, fileProps },
    );
  }
  @UseGuards(JwtAuthGuard)
  @Patch("profile/avatar")
  updateProfileAvatar(@Request() req, @Body() imageProps: { key: string }) {
    return this.userService.send(
      { cmd: "updateProfileAvatar" },
      { user: req.user, imageProps },
    );
  }
  @UseGuards(JwtAuthGuard)
  @Patch("/basic/information")
  updateUserBasicData(
    @Request() req,
    @Body() updateUser: UpdateUserBasicDataDto,
  ) {
    return this.userService.send(
      { cmd: "updateUserBasicData" },
      { user: req.user, updateUser },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete("delete/follow")
  unFollowToAnotherUser(@Request() req, @Query("followingId") followingId: string) {
    return this.userService.send(
      { cmd: "unFollowToAnotherUser" },
      { user: req.user, followingId },
    );
  }
  
}
