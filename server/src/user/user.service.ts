import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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
import { JwtAuthGuardTrueType, UserRoleEnum } from "src/lib/types/user";
import { AdminUser } from "./entities/user-admin.entity";
import { prefixSplitNestingObject, userDataResponse } from "src/lib/utils";
import { UserFollowingAssociation } from "./entities/user-followers-association.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  async createUserNormalUser(createUser: CreateUserDto) {
    const userId = uuid();
    const normalUser = new NormalUser({
      ...createUser,
      userId,
      user: new User({
        ...createUser,
        userRole: UserRoleEnum.NORMAL,
        id: userId,
      }),
    });

    await this.entityManager.save(normalUser);
  }

  async createUserCreatorUserRequestAdmin(
    createUser: CreateUserCreatorUserRequestAdminDTO,
  ) {
    // check if user exist by userId
    const userExist = await this.entityManager.findOne(User, {
      where: { id: createUser.userId },
    });
    if (!userExist) {
      return { message: "User not found" };
    }
    // check user role is normal
    if (userExist.userRole !== UserRoleEnum.NORMAL) {
      return {
        message: `User role is not normal!, user role is :${userExist.userRole}`,
      };
    }
    // check user is verified or not
    if (!userExist.isVerified) {
      return { message: "User is not verified" };
    }

    // console.log({userExist})

    // send request to admin for approving user request to be as creator
    // for now admin accept request
    return { message: "Send request to admin successfully", data: userExist };
  }

  async createUserApprovedCreatorUser(
    createUser: CreateUserApprovedCreatorUserDTO,
  ) {
    // first create user as creator
    const date = new Date();
    const creatorUser = new CreatorUser({
      userId: createUser.userId,
      authorizedAt: date,
      worksOn: createUser.worksOn,
      qualification: createUser.qualification,
      authorizedAdminId: createUser.adminId,
    });
    // create creator work location
    const locationId = uuid();
    const location = new Location({
      id: locationId,
      workUserId: createUser.userId,
      ...createUser.workLocation,
    });
    await this.entityManager.transaction(async entityManager => {
      await entityManager.save(creatorUser);
      await this.entityManager.save(location);

      // now updating the user role in user table
      await entityManager.update(
        User,
        { id: createUser.userId },
        { userRole: UserRoleEnum.CREATOR },
      );
    });

    return { message: "Creator created successfully", data: createUser };
  }

  async createUserAdminUser(createUser: CreateUserAdminUserDTO) {
    const userId = uuid();
    const adminUser = new AdminUser({
      ...createUser,
      userId,
      user: new User({
        ...createUser,
        userRole: UserRoleEnum.ADMIN,
        id: userId,
      }),
    });
    await this.entityManager.save(adminUser);
    return { message: "Admin created successfully", data: adminUser };
  }

  async createUserLocation(createUserLocation: createUserLocationDTO) {
    const locationId = uuid();
    const location = new Location({
      ...createUserLocation,
      id: locationId,
      userId: createUserLocation.userId,
    });
    await this.entityManager.save(location);
    return { message: "Location created successfully", data: location };
  }

  async followToAnotherUser(userId: string, followUserId: string) {
    // checking if both ids are not same
    if (userId === followUserId) {
      throw new BadRequestException("You can't follow yourself");
    }
    // checking if already following
    const isAlreadyFollowing = await this.entityManager.findOne(
      UserFollowingAssociation,
      { where: { userId: userId, followingId: followUserId } },
    );
    if (isAlreadyFollowing) {
      return { message: "Already following" };
    }
    const userFollowingAssociation = new UserFollowingAssociation({
      userId,
      followingId: followUserId,
    });
    await this.entityManager.save(userFollowingAssociation);
    return { message: "User followed successfully" };
  }
  findAllUsers() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return userDataResponse(user);
  }
  async getUserProfile(user: JwtAuthGuardTrueType) {
    const profileData = await this.entityManager
      .createQueryBuilder(User, "user")
      .select([
        "user.id",
        "user.email",
        "user.firstname",
        "user.lastname",
        "user.gender",
        "user.avatarUrl",
        "user.isSpecialUser",
        "user.userRole",
      ])
      .groupBy("user.id")
      .addGroupBy("user.email")
      .addGroupBy("user.firstname")
      .addGroupBy("user.lastname")
      .addGroupBy("user.gender")
      .addGroupBy("user.avatarUrl")
      .addGroupBy("user.isSpecialUser")
      .addGroupBy("user.userRole")

      // getting following count
      .leftJoin("user.following", "following")
      .addSelect("COUNT(following.id)", "followingCount")

      // getting followers count
      .leftJoin("user.followers", "followers")
      .addSelect("COUNT(followers.id)", "followersCount")

      .where("user.id = :id", { id: user.userId })
      .getRawOne();
    const data = prefixSplitNestingObject(profileData);
    return data;
  }
  async getUserProfileComplete(user: JwtAuthGuardTrueType) {
    let query = await this.entityManager
      .createQueryBuilder(User, "user")

      // getting basic user data
      .select([
        "user.id",
        "user.email",
        "user.firstname",
        "user.lastname",
        "user.avatarUrl",
        "user.age",
        "user.phoneNumber",
        "user.gender",
        "user.userRole",
        "user.dateOfBirth",
        "user.authProvider",
        "user.isVerified",
        "user.isActive",
        "user.isSpecialUser",
        "user.authorizedSpecialUserAt",
        "user.authorizedSpecialUserByCreatorId",
        "user.authorizedSpecialUserByAdminId",
      ])
      .groupBy("user.id")
      .addGroupBy("user.email")
      .addGroupBy("user.firstname")
      .addGroupBy("user.lastname")
      .addGroupBy("user.avatarUrl")
      .addGroupBy("user.age")
      .addGroupBy("user.phoneNumber")
      .addGroupBy("user.gender")
      .addGroupBy("user.userRole")
      .addGroupBy("user.dateOfBirth")
      .addGroupBy("user.authProvider")
      .addGroupBy("user.isVerified")
      .addGroupBy("user.isActive")
      .addGroupBy("user.isSpecialUser")
      .addGroupBy("user.authorizedSpecialUserAt")
      .addGroupBy("user.authorizedSpecialUserByCreatorId")
      .addGroupBy("user.authorizedSpecialUserByAdminId")

      // getting user location
      .leftJoin("user.location", "homeLocation")
      .addSelect([
        "homeLocation.id",
        "homeLocation.country",
        "homeLocation.province",
        "homeLocation.city",
        "homeLocation.zipCode",
        "homeLocation.street",
      ])

      .addGroupBy("homeLocation.id")
      .addGroupBy("homeLocation.country")
      .addGroupBy("homeLocation.province")
      .addGroupBy("homeLocation.city")
      .addGroupBy("homeLocation.zipCode")
      .addGroupBy("homeLocation.street")

      // getting following count
      .leftJoin("user.following", "following")
      .addSelect("COUNT(following.id)", "followingCount")

      // getting followers count
      .leftJoin("user.followers", "followers")
      .addSelect("COUNT(followers.id)", "followersCount");

    // if user is normal user then getting normal user data
    if (user.userRole === UserRoleEnum.NORMAL) {
      query = query
        .leftJoin("user.normalUser", "normalUser")
        .addSelect(["normalUser.userId"])
        .addGroupBy("normalUser.userId");
    } // if user is creator then getting creator data with relations
    else if (user.userRole === UserRoleEnum.CREATOR) {
      query = query
        .leftJoin("user.creatorUser", "creatorUser")
        .addSelect([
          "creatorUser.userId",
          "creatorUser.authorizedAt",
          "creatorUser.worksOn",
          "creatorUser.qualification",
        ])

        .addGroupBy("creatorUser.userId")
        .addGroupBy("creatorUser.authorizedAt")
        .addGroupBy("creatorUser.worksOn")
        .addGroupBy("creatorUser.qualification")

        //     // getting creator work location
        .leftJoin("creatorUser.workLocation", "workLocation")
        .addSelect([
          "workLocation.id",
          "workLocation.country",
          "workLocation.province",
          "workLocation.city",
          "workLocation.zipCode",
          "workLocation.street",
        ])
        .addGroupBy("workLocation.id")
        .addGroupBy("workLocation.country")
        .addGroupBy("workLocation.province")
        .addGroupBy("workLocation.city")
        .addGroupBy("workLocation.zipCode")
        .addGroupBy("workLocation.street")

        // getting creator authorized admin data
        .leftJoin("creatorUser.authorizedAdminId", "authorizedAdminId")
        .leftJoin(
          "user.",
          "creatorAuthorizedBy",
          "creatorAuthorizedBy.userId = authorizedAdminId",
        )
      .addSelect([
        "creatorAuthorizedBy.id",
        "creatorAuthorizedBy.email",
        "creatorAuthorizedBy.firstname",
        "creatorAuthorizedBy.lastname",
        "creatorAuthorizedBy.avatarUrl",
        "creatorAuthorizedBy.isSpecialUser",
      ])
      .addGroupBy("creatorAuthorizedBy.id")
      .addGroupBy("creatorAuthorizedBy.email")
      .addGroupBy("creatorAuthorizedBy.firstname")
      .addGroupBy("creatorAuthorizedBy.lastname")
      .addGroupBy("creatorAuthorizedBy.avatarUrl")
      .addGroupBy("creatorAuthorizedBy.isSpecialUser");
    } // if user is admin then getting admin data
    else if (user.userRole === UserRoleEnum.ADMIN) {
      query = query
        .leftJoin("user.adminUser", "adminUser")
        .addSelect(["adminUser.userId"])
        .addGroupBy("adminUser.userId");
    }

    const profileData = await query
      .where("user.id = :id", { id: user.userId })
      .getRawOne();
    const data = prefixSplitNestingObject(profileData);
    return data;
  }

  async findSimilarFriendsZoneByName(name: string, userId: string) {
    // const data = [];
    // const user = await this.entityManager.findOne(User, {
    //   where: { id: userId },
    // });
    // user.following &&
    //   user.following.forEach(item => {
    //     if (item.firstname.includes(name) || item.lastname.includes(name)) {
    //       data.push(item);
    //     }
    //   });
    // user.followers &&
    //   user.followers.forEach(item => {
    //     if (item.firstname.includes(name) || item.lastname.includes(name)) {
    //       data.push(item);
    //     }
    //   });
    return "";
  }

  async getUserFollowers(
    userId: string,
    from: number,
    to: number,
    orderDesc: boolean,
  ) {
    const userFollowers = await this.entityManager
      .createQueryBuilder(UserFollowingAssociation, "association")
      .select(["association.followingId", "association.createdAt"])
      .leftJoin("association.user", "user")
      .addSelect([
        "user.id",
        "user.firstname",
        "user.lastname",
        "user.avatarUrl",
        "user.isSpecialUser",
        "user.userRole",
      ])
      .where("association.followingId = :followingId", {
        followingId: userId,
      })
      .orderBy("association.createdAt", orderDesc ? "DESC" : "ASC")
      .skip(from)
      .take(to)
      .getRawMany();
    return userFollowers;
  }
  async getUserFollowing(
    userId: string,
    from: number,
    to: number,
    orderDesc: boolean,
  ) {
    console.log("fun starts");
    const userFollowers = await this.entityManager
      .createQueryBuilder(UserFollowingAssociation, "association")
      .select(["association.userId", "association.createdAt"])
      .leftJoin("association.following", "following")
      .addSelect([
        "following.id",
        "following.firstname",
        "following.lastname",
        "following.avatarUrl",
        "following.isSpecialUser",
        "following.userRole",
      ])
      .where("association.followingId = :followingId", {
        followingId: userId,
      })
      .orderBy("association.createdAt", orderDesc ? "DESC" : "ASC")
      .skip(from)
      .take(to)
      .getRawMany();
    return userFollowers;
  }
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async unFollowToAnotherUser(userId: string, followingId: string) {
    await this.entityManager.delete(UserFollowingAssociation, {
       userId,
       followingId,
    });
    return { message: "User un follow successfully" };
  }

  async deleteUser(userId: string, role: UserRoleEnum) {
    let userToDelete: any;
    if (role === UserRoleEnum.NORMAL) {
      userToDelete = await this.entityManager.delete(User, { id: userId });
    } else if (role === UserRoleEnum.CREATOR) {
      userToDelete = await this.entityManager.delete(CreatorUser, { userId });
    } else if (role === UserRoleEnum.ADMIN) {
      userToDelete = await this.entityManager.delete(AdminUser, { userId });
    }
    if (!userToDelete) {
      return { message: "User not found" };
    }

    return { message: "User deleted successfully", data: userToDelete };
  }

  async findOneWithEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }
  async findOneWithPhoneNumber(phoneNumber: string) {
    return await this.userRepository.findOne({ where: { phoneNumber } });
  }
}
