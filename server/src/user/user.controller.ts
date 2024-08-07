import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import {
  CreateProfileAvatarDto,
  CreateProfilePresignedUrlDto,
  createUserLocationDTO,
} from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRoleEnum } from "src/lib/types/user";
import { JwtAccessTokenGuard } from "src/auth/guards/jwt-access-token.guard";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Post("create/location") // create user home location
  createUserLocation(@Body() createUserLocation: createUserLocationDTO) {
    return this.userService.createUserLocation(createUserLocation);
  }
  @UseGuards(JwtAccessTokenGuard)
  @Post("create/follow")
  followToAnotherUser(@Request() req, @Query("followTo") followTo: string) {
    return this.userService.followToAnotherUser(req.user.userId, followTo);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post("create/profile/presigned-url")
  createProfilePresignedUrl(@Request() req, createPresignedUrl: CreateProfilePresignedUrlDto) {
    return this.userService.createProfilePresignedUrl(req.user.userId,createPresignedUrl);
  }
  
  

  @Get()
  findAll() {
    return this.userService.findAllUsers();
  }
  @UseGuards(JwtAccessTokenGuard)
  @Get("/protected")
  findProtectedUser(@Request() req) {
    console.log("req.user", req.user);
    return this.userService.findOne(req.user.userId);
  }
  @UseGuards(JwtAccessTokenGuard)
  @Get("get/profile")
  getUserProfile(@Request() req) {
    return this.userService.getUserProfile(req.user);
  }
  @UseGuards(JwtAccessTokenGuard)
  @Get("get/profile/complete")
  getUserProfileComplete(@Request() req) {
    return this.userService.getUserProfileComplete(req.user);
  }
  @UseGuards(JwtAccessTokenGuard)
  @Get("get-similar-friend-zone-by-name")
  findSimilarFriendsZoneByName(@Request() req, @Query("name") name: string) {
    return this.userService.findSimilarFriendsZoneByName(name, req.user.userId);
  }
  @Get("get-user-followers")
  getUserFollowers(
    @Query("userId") userId: string,
    @Query("from") from: number,
    @Query("to") to: number,
    @Query("orderDesc") orderDesc: boolean = true,
  ) {
    return this.userService.getUserFollowers(userId, from, to, orderDesc);
  }

  @Get("get-user-followers")
  getUserFollowing(
    @Query("userId") userId: string,
    @Query("from") from: number,
    @Query("to") to: number,
    @Query("orderDesc") orderDesc: boolean = true,
  ) {
    console.log("hello world")
    return this.userService.getUserFollowing(userId, from, to, orderDesc);
  }
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post("create/profile/avatar")
  updatedProfileAvatar(@Request() req, createPresignedUrl: CreateProfileAvatarDto) {
    return this.userService.updatedProfileAvatar(req.user.userId,createPresignedUrl);
  }
  

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }



  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
  @UseGuards(JwtAccessTokenGuard)
  @Delete("delete/follow")
  unFollowToAnotherUser(@Request() req, @Query("followId") followId: string) {
    return this.userService.unFollowToAnotherUser(req.user.userId, followId);
  }
  @Delete()
  deleteUser(
    @Query("userId") userId: string,
    @Query("role") role: UserRoleEnum,
  ) {
    return this.userService.deleteUser(userId, role);
  }
}
