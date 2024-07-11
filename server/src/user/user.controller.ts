import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UserService } from './user.service';
import {  CreateUserAdminUserDTO, CreateUserApprovedCreatorUserDTO, CreateUserCreatorUserRequestAdminDTO,  CreateUserDto, createUserLocationDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoleEnum } from 'src/lib/types/user';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("create/normal_user")
  createUserNormalUser(@Body() createUser: CreateUserDto) {
    return this.userService.createUserNormalUser(createUser);
  }

  @Post("create/creator/request/admin")
  createUserCreatorUserRequestAdmin(@Body() user: CreateUserCreatorUserRequestAdminDTO) {
    return this.userService.createUserCreatorUserRequestAdmin(user);
  }
  
  @Post("create/creator/approved")
  createUserApprovedCreatorUser(@Body() user: CreateUserApprovedCreatorUserDTO) {
    return this.userService.createUserApprovedCreatorUser(user);
  }

  @Post("create/admin")
  createUserAdminUser(@Body() createUser: CreateUserAdminUserDTO) {
    return this.userService.createUserAdminUser(createUser);
  }

  @Post("create/location") // create user home location
  createUserLocation(@Body() createUserLocation: createUserLocationDTO,) {
    return this.userService.createUserLocation(createUserLocation);
    
  }
  @Get()
  findAll() {
    return this.userService.findAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
  @Delete()
  deleteUser(@Query("user_id") user_id:string,@Query("role") role:UserRoleEnum){
    return this.userService.deleteUser(user_id,role)
  }
}
