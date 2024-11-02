import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  createUserLocationDTO,
  MicroservicesNames,
  UpdateUserBasicDataDto,
} from "@app/shared";
import { EntityManager, Repository } from "typeorm";
import { User } from "../../../libs/shared/src/entities/micro-user.entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { v4 as uuid } from "uuid";
import { Location } from "@app/shared/entities/micro-location.entities/location.entity";
import { UserFollowingAssociation } from "../../../libs/shared/src/entities/micro-user.entities/user-followers-association.entity";
import { UserRoleEnum } from "@app/shared/enums/user.enum";
import { JwtAuthGuardTrueType } from "@app/shared/enums/auth.enums";
import { prefixSplitNestingObject } from "@app/shared/utils/helper-functions.utils";
import {
  FollowToAnotherUserPayloadType,
  getProfileAvatarUploadPresignedUrlPayloadType,
  getUserFollowersPayloadType,
  GetUsersSearchPayloadType,
  UnFollowToAnotherUserPayloadType,
  updateProfileAvatarPayloadType,
  updateUserBasicDataPayloadType,
} from "./types/user-payload.type";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { CustomRpcExceptions } from "@app/shared/filters/CustomRpcExceptions.filter";

@Injectable()
export class UserService {
  constructor(
    private readonly entityManager: EntityManager,
    @Inject(MicroservicesNames.AWS_SERVICE)
    private readonly awsService: ClientProxy,
  ) {}

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
  async followToAnotherUser(data_:FollowToAnotherUserPayloadType) {
    const {followId,user} = data_
  if (user.userId === followId) 
    throw CustomRpcExceptions.BadRequestException("You can't follow yourself");
    const userFollowingAssociation = new UserFollowingAssociation({
      userId: user.userId,
      followingId: followId,
    });
    await this.entityManager.save(userFollowingAssociation);
    return { message: "User followed successfully" };
  }

  async findOne(id: string) {
    const user = await this.entityManager.find(User, { where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async getAllUsers() {
    const users = await this.entityManager.find(User);
    return users;
  }
  async getUsersSearch(data_:GetUsersSearchPayloadType){
    const {search,user} = data_
   const users = await this.entityManager.createQueryBuilder(User,'user')
    .select(['user.id','user.email','user.firstname','user.lastname','user.avatarUrl','user.isSpecialUser','user.userRoles'])
    .where('user.firstname LIKE :search OR user.lastname LIKE :search',{search:`%${search.toLowerCase()}%`})
    .getMany()
    return users
  }
  async getUnsecureUser(userId:string){
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      loadEagerRelations: false,
      select: ["id", "email",'phoneNumber','firstname','lastname'],
    });
    return user
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
      ])
      .groupBy("user.id")
      .addGroupBy("user.email")
      .addGroupBy("user.firstname")
      .addGroupBy("user.lastname")
      .addGroupBy("user.gender")
      .addGroupBy("user.avatarUrl")
      .addGroupBy("user.isSpecialUser")

      // getting following count
      .leftJoin("user.following", "following")
      .addSelect("COUNT(following.id)", "followingCount")

      // getting followers count
      .leftJoin("user.followers", "followers")
      .addSelect("COUNT(followers.id)", "followersCount")

      .where("user.id = :id", { id: user.userId })
      .getRawOne();
    const temp = prefixSplitNestingObject(profileData);
    const data = {
      ...temp.user,
      userId: temp.user.id,
      userRole: user.userRole,
      followingCount: temp.followingCount,
      followersCount: temp.followersCount,
    };
    delete data.id;
    // check if avatar url is present or not
    if (data.avatarUrl) {
      const responseFromAws = this.awsService.send(
        { cmd: "getCloudFrontSignedUrl" },
        { urlKey: data.avatarUrl },
      );
      const url = await firstValueFrom(responseFromAws).catch(err => {
        console.log(err);
        throw CustomRpcExceptions.InternalException();
      });
      data.avatarUrl = url;
    }

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

  async getUserFollowers(data: getUserFollowersPayloadType) {
    const { orderDesc, skip, take, userId } = data;
    const userFollowers = await this.entityManager
      .createQueryBuilder(UserFollowingAssociation, "association")
      .leftJoin("association.user", "user")
      .addSelect([
        "user.id",
        "user.firstname",
        "user.lastname",
        "user.avatarUrl",
        "user.isSpecialUser",
        "user.userRoles",
      ])
      .where("association.followingId = :followingId", {
        followingId: userId,
      })
      .orderBy("association.createdAt", orderDesc ? "DESC" : "ASC")
      .skip(skip)
      .take(take)
      .getMany();
    return userFollowers;
  }
  async getUserFollowing(data: getUserFollowersPayloadType) {
    const { orderDesc, skip, take, userId } = data;
    const userFollowers = await this.entityManager
      .createQueryBuilder(UserFollowingAssociation, "association")
      .leftJoin("association.following", "following")
      .addSelect([
        "following.id",
        "following.firstname",
        "following.lastname",
        "following.avatarUrl",
        "following.isSpecialUser",
        "following.userRoles",
      ])
      .where("association.userId = :userId", {
        userId,
      })
      .orderBy("association.createdAt", orderDesc ? "DESC" : "ASC")
      .skip(skip)
      .take(take)
      .getMany();
    return userFollowers;
  }
  async getProfileAvatarUploadPresignedUrl(
    data: getProfileAvatarUploadPresignedUrlPayloadType,
  ) {
    const { user, fileProps } = data;
    if (!fileProps.mimeType.includes("image")) return;
    const key = `users/profile_avatar/${user.userId}_${new Date().getTime()}_${fileProps.filename}`;
    const responseFromAws = this.awsService.send(
      { cmd: "generatePutPresignedUrl" },
      { urlKey: key, contentType: fileProps.mimeType, expiresIn: 500 },
    );
    const url = await firstValueFrom(responseFromAws).catch(err => {
      console.log(err);
      throw CustomRpcExceptions.InternalException();
    });
    return { url, urlKey: key };
  }

  async updateProfileAvatar(data: updateProfileAvatarPayloadType) {
    const { user, imageProps } = data;
    if (!imageProps.key) return;

    const responseFromAws = this.awsService.send(
      { cmd: "getCloudFrontSignedUrl" },
      { urlKey: imageProps.key },
    );
    const url = await firstValueFrom(responseFromAws).catch(err => {
      console.log(err);
      throw CustomRpcExceptions.InternalException();
    });

    const foundUser = await this.entityManager.findOne(User, {
      where: {
        id: user.userId,
      },
      loadEagerRelations: false,
    });
    if (!foundUser) return;
    foundUser.avatarUrl = imageProps.key;
    await this.entityManager.update(User, { id: user.userId }, foundUser);
    return { url, message: "profile updated successfully!" };
  }

  async getUserByEmail(email: string) {
    const user =await this.entityManager.findOne(User, {
      where: [{ email }],
      loadEagerRelations: false,
      select: ["id", "email", "phoneNumber", "password", "userRoles"],
    });
    return user;
  }
  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateUserBasicData(data: updateUserBasicDataPayloadType) {
    const { user, data: updateUser } = data;
    const foundUser = await this.entityManager.findOne(User, {
      where: { id: user.userId },
      loadEagerRelations: false,
    });
    console.log({ updateUser });
    if (!foundUser) throw new NotFoundException("User not Found");
    foundUser.firstname = updateUser.firstname || foundUser.firstname;
    foundUser.lastname = updateUser.lastname || foundUser.lastname;
    foundUser.phoneNumber = updateUser.phoneNumber || foundUser.phoneNumber;
    foundUser.dateOfBirth = updateUser.dateOfBirth || foundUser.dateOfBirth;

    // check if location if location is change or not
    if (updateUser.location) {
      // check if location is already exist or not
      const foundLocation = await this.entityManager.findOne(Location, {
        where: { userId: user.userId },
      });
      if (!foundLocation) {
        // check country and city is provided or not
        if (
          (updateUser.location.country &&
            updateUser.location.city &&
            updateUser.location.province) === undefined
        ) {
          throw new BadRequestException("Country and city is required");
        }

        // create new location
        const location = new Location({
          country: updateUser.location.country,
          city: updateUser.location.city,
          province: updateUser.location.province,
          street: updateUser.location.street,
          zipCode: updateUser.location.zipCode,
          userId: user.userId,
        });
        await this.entityManager.save(location);
      } else {
        // update location
        foundLocation.country =
          updateUser.location.country || foundLocation.country;
        foundLocation.city = updateUser.location.city || foundLocation.city;
        foundLocation.province =
          updateUser.location.province || foundLocation.province;
        foundLocation.street =
          updateUser.location.street || foundLocation.street;
        foundLocation.zipCode =
          updateUser.location.zipCode || foundLocation.zipCode;
        await this.entityManager.update(
          Location,
          { id: foundLocation.id },
          foundLocation,
        );
      }
    }

    await this.entityManager.update(User, { id: user.userId }, foundUser);
    return { message: "user updated successfully" };
  }
  async unFollowToAnotherUser(data: UnFollowToAnotherUserPayloadType) {
    const { user, followingId } = data;
    console.log(data)
    const userFollowingAssociation = await this.entityManager.findOne(UserFollowingAssociation, {
      where: { userId: user.userId, followingId },
    });
    console.log(userFollowingAssociation)
    if(userFollowingAssociation){
      await this.entityManager.delete(UserFollowingAssociation, {
        userId: user.userId,
        followingId,
      }
      );
    }

    return { message: "User un follow successfully" };
  }

  // async deleteUser(userId: string, role: UserRoleEnum) {
  //   let userToDelete: any;
  //   if (role === UserRoleEnum.NORMAL) {
  //     userToDelete = await this.entityManager.delete(User, { id: userId });
  //   } else if (role === UserRoleEnum.CREATOR) {
  //     userToDelete = await this.entityManager.delete(CreatorUser, { userId });
  //   } else if (role === UserRoleEnum.ADMIN) {
  //     userToDelete = await this.entityManager.delete(AdminUser, { userId });
  //   }
  //   if (!userToDelete) {
  //     return { message: "User not found" };
  //   }

  //   return { message: "User deleted successfully", data: userToDelete };
  // }

  async findOneWithEmailOrPhoneNumberForLogin({
    email,
    phoneNumber,
  }: {
    email?: string;
    phoneNumber?: string;
  }) {
    if (!email && !phoneNumber) {
      throw new Error("Email or Phone number is required for login");
    }
    return await this.entityManager.findOne(User, {
      where: [{ email }, { phoneNumber }],
      loadEagerRelations: false,
      select: ["id", "email", "phoneNumber", "password", "userRoles"],
    });
  }
}
