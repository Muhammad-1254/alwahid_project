import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  CreateUserAdminUserDTO,
  CreateUserApprovedCreatorUserDTO,
  CreateUserCreatorUserRequestAdminDTO,
  CreateUserDto,
  createUserLocationDTO,
} from "./dto/create-user.dto";
import { EntityManager, Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatorUser } from "./entities/user-creator.entity";
import { v4 as uuid } from "uuid";
import { NormalUser } from "./entities/user-normal.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Location } from "src/location/entities/location.entity";
import { UserRoleEnum } from "src/lib/types/user";
import { AdminUser } from "./entities/user-admin.entity";
import { userDataResponse } from "src/lib/utils";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  async createUserNormalUser(createUser: CreateUserDto) {
    const user_id = uuid();
    const normalUser = new NormalUser({
      ...createUser,
      user_id,
      user: new User({
        ...createUser,
        user_role: UserRoleEnum.NORMAL,
        id: user_id,
      }),
    });

    await this.entityManager.save(normalUser);
  }

  async createUserCreatorUserRequestAdmin(
    createUser: CreateUserCreatorUserRequestAdminDTO,
  ) {
    // check if user exist by user_id
    const user_exist = await this.entityManager.findOne(User, {
      where: { id: createUser.user_id },
    });
    if (!user_exist) {
      return { message: "User not found" };
    }
    // check user role is normal
    if (user_exist.user_role !== UserRoleEnum.NORMAL) {
      return {
        message: `User role is not normal!, user role is :${user_exist.user_role}`,
      };
    }
    // check user is verified or not
    if (!user_exist.is_verified) {
      return { message: "User is not verified" };
    }

    // console.log({user_exist})

    // send request to admin for approving user request to be as creator
    // for now admin accept request
    return { message: "Send request to admin successfully", data: user_exist };
  }

  async createUserApprovedCreatorUser(
    createUser: CreateUserApprovedCreatorUserDTO,
  ) {
    // first create user as creator
    const date = new Date();
    const creatorUser = new CreatorUser({
      user_id: createUser.user_id,
      authorized_at: date,
      works_on: createUser.works_on,
      qualification: createUser.qualification,
      authorized_admin_id: createUser.admin_id,
    });
    // create creator work location
    const location_id = uuid();
    const location = new Location({
      id: location_id,
      work_user_id: createUser.user_id,
      ...createUser.work_location,
    });
    await this.entityManager.transaction(async entityManager => {
      await entityManager.save(creatorUser);
      await this.entityManager.save(location);

      // now updating the user role in user table
      await entityManager.update(
        User,
        { id: createUser.user_id },
        { user_role: UserRoleEnum.CREATOR },
      );
    });

    return { message: "Creator created successfully", data: createUser };
  }

  async createUserAdminUser(createUser: CreateUserAdminUserDTO) {
    const user_id = uuid();
    const adminUser = new AdminUser({
      ...createUser,
      user_id,
      user: new User({
        ...createUser,
        user_role: UserRoleEnum.ADMIN,
        id: user_id,
      }),
    });
    await this.entityManager.save(adminUser);
    return { message: "Admin created successfully", data: adminUser };
  }

  async createUserLocation(createUserLocation: createUserLocationDTO) {
    const location_id = uuid();
    const location = new Location({
      ...createUserLocation,
      id: location_id,
      user_id: createUserLocation.user_id,
    });
    await this.entityManager.save(location);
    return { message: "Location created successfully", data: location };
  }

  async followToAnotherUser(userId:string, followUserId:string){
    const user = await this.entityManager.findOne(User,{where:{id:userId}})
    const followUser = await this.entityManager.findOne(User,{where:{id:followUserId}})
    if(!user || !followUser){
      throw new NotFoundException("User not found")
    }
    if(user.id === followUser.id){
      throw new BadRequestException("You can't follow yourself")
    }
    if(user.following){
      user.following.push(followUser)
    }else{
      user.following = [followUser]
    }
    
    await this.entityManager.save(user)
    return {message:"Followed successfully"}
  }
  findAllUsers() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return userDataResponse(user);
  }
  async findSimilarFriendsZoneByName(name: string, userId: string) {
    const data = [];
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
    });
    user.following &&user.following.forEach(item => {
      if (item.firstname.includes(name) || item.lastname.includes(name)) {
        data.push(item);
      }
    });
    user.followers&&user.followers.forEach(item => {
      if (item.firstname.includes(name) || item.lastname.includes(name)) {
        data.push(item);
      }
    });
    return data
  }

    async getUserFollowers(userId:string){
    const user = await this.entityManager.findOne(User,{where:{id:userId},relations:['normal_user']})
    if(!user){
      throw new NotFoundException("User not found")
    }
    console.log(user)

    return user
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async deleteUser(user_id: string, role: UserRoleEnum) {
    let userToDelete: any;
    if (role === UserRoleEnum.NORMAL) {
      userToDelete = await this.entityManager.delete(User, { id: user_id });
    } else if (role === UserRoleEnum.CREATOR) {
      userToDelete = await this.entityManager.delete(CreatorUser, { user_id });
    } else if (role === UserRoleEnum.ADMIN) {
      userToDelete = await this.entityManager.delete(AdminUser, { user_id });
    }
    if (!userToDelete) {
      return { message: "User not found" };
    }

    return { message: "User deleted successfully", data: userToDelete };
  }

  async findOneWithEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }
  async findOneWithPhoneNumber(phone_number: string) {
    return await this.userRepository.findOne({ where: { phone_number } });
  }
}
