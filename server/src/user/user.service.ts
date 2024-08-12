import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateProfileAvatarDto, CreateProfilePresignedUrlDto, createUserLocationDTO } from "./dto/create-user.dto";
import { EntityManager, Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatorUser } from "./entities/user-creator.entity";
import { v4 as uuid } from "uuid";
import { UpdateUserBasicData, } from "./dto/update-user.dto";
import { Location } from "src/location/entities/location.entity";
import { JwtAuthGuardTrueType, UserRoleEnum } from "src/lib/types/user";
import { AdminUser } from "./entities/user-admin.entity";
import { prefixSplitNestingObject } from "src/lib/utils";
import { UserFollowingAssociation } from "./entities/user-followers-association.entity";
import { PostService } from "src/post/post.service";
import { ConfigService } from "@nestjs/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
    private readonly postService: PostService,
    private readonly configService: ConfigService,
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
  async createProfilePresignedUrl(user: JwtAuthGuardTrueType, createPresignedUrl:CreateProfilePresignedUrlDto) {
    const s3CLient = await this.postService.getS3Client();
    const key = `profile-image/${user.userId}--${createPresignedUrl.fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow("AWS_S3_BUCKET_NAME"),
      Key: key,
      ContentType: createPresignedUrl.mimeType,
    })
    const url = await getSignedUrl(s3CLient, command, { expiresIn: 300 });
    return { url, key };
  }
  
  async updatedProfileAvatar(user:JwtAuthGuardTrueType, createProfile: CreateProfileAvatarDto){
    const url = await this.postService.generatePresignedUrl(
      createProfile.urlKey,
      await this.postService.getS3Client(),
      60*60*24*7*4*12,
    )
    await this.entityManager.update(User, {id:user.userId},{avatarUrl:url});  
    return {message:"Profile image updated successfully",data:{avatarUrl:url}};
  }
  

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return user;
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

      }
      delete data.id
      
    return data
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
  async getProfileAvatarUploadPresignedUrl(user:JwtAuthGuardTrueType, imageProps:{filename:string, fileSize:number, mimeType:string}){
    if(!imageProps.mimeType.includes("image"))return
    const s3Client= this.postService.getS3Client()
    const key = `users/profile_avatar/${user.userId}_${new Date().getTime()}_${imageProps.filename}`
    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow("AWS_S3_BUCKET_NAME"),
      Key: key,
      ContentType: imageProps.mimeType,
    })
    const url = await getSignedUrl(s3Client, command, {expiresIn:300})
    return {url, urlKey:key}
  }
  async updateProfileAvatar(user:JwtAuthGuardTrueType,imageProps:{key:string}) {
    if(!imageProps.key)return
    
    const s3Client = this.postService.getS3Client()
    const expiresIn =Number.parseInt(this.configService.getOrThrow("AWS_S3_URL_EXPIRY"))
    const url = await this.postService.generatePresignedUrl(
      imageProps.key,
      s3Client,
      expiresIn
    )
    const foundUser = await this.entityManager.findOne(User,
      {where:{
        id:user.userId,
      },
      loadEagerRelations:false
    })
    if(!foundUser) return;
    foundUser.avatarUrl = url
    await this.userRepository.update(foundUser.id,foundUser)
    return {url,message:"profile updated successfully!"}
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateUserBasicData (user:JwtAuthGuardTrueType, updateUser:UpdateUserBasicData){
    const foundUser = await this.userRepository.findOne({where:{id:user.userId}})
    if(!foundUser) throw new NotFoundException("User not Found")
    foundUser.firstname = updateUser.firstname || foundUser.firstname
    foundUser.lastname = updateUser.lastname || foundUser.lastname
    foundUser.phoneNumber = updateUser.phoneNumber || foundUser.phoneNumber
    foundUser.dateOfBirth = updateUser.dateOfBirth || foundUser.dateOfBirth

    
    console.log(foundUser);
    await this.userRepository.update(foundUser.id, foundUser)
    return {message:'user updated successfully'}
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


  async findOneWithEmailOrPhoneNumberForLogin({email,phoneNumber}:{email?:string,phoneNumber?: string}) {
    if(!email&& !phoneNumber){
      throw new Error("Email or Phone number is required for login");
    }
    return  await this.userRepository.findOne({
      where: [
        {email},
        {phoneNumber}
      ],
      loadEagerRelations: false,
      select:['id','email', 'phoneNumber','password','userRoles']
    });
  }
}
