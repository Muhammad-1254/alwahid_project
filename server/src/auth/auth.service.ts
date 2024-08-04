import { BadRequestException, Injectable } from "@nestjs/common";
import { isEmail, isPhoneNumber } from "class-validator";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import {
  CreateUserApprovedCreatorUserDTO,
  CreateUserCreatorUserRequestAdminDTO,
  CreateUserDto,
} from "src/user/dto/create-user.dto";
import { v4 as uuid } from "uuid";
import { NormalUser } from "src/user/entities/user-normal.entity";
import { JwtAuthGuardTrueType, UserRoleEnum } from "src/lib/types/user";
import { EntityManager } from "typeorm";
import { CreatorUser } from "src/user/entities/user-creator.entity";
import { Location } from "src/location/entities/location.entity";
import { AdminUser } from "src/user/entities/user-admin.entity";
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly entityManager: EntityManager,
  ) {}
  private readonly saltRounds = 10;

  async createNormalUser(createUser: CreateUserDto) {
    const userId = uuid();
    const hashPassword = await this.hashPassword(createUser.password);
    const normalUser = new NormalUser({
      ...createUser,
      userId,
      user: new User({
        ...createUser,
        userRoles: [UserRoleEnum.NORMAL],
        password: hashPassword,
        id: userId,
      }),
    });
    await this.entityManager.save(normalUser);
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { password, ...rest } = { ...normalUser.user };
    return { message: "User created successfully", data: null };
  }

  async normalUserRequestForCreator(
    user: JwtAuthGuardTrueType,
    userRequest: CreateUserCreatorUserRequestAdminDTO,
  ) {
    // getting user details from db
    const userExist = await this.entityManager.findOne(User, {
      where: { id: user.userId },
      loadEagerRelations: false,
      select: [
        "firstname",
        "lastname",
        "email",
        "phoneNumber",
        "gender",
        "location",
        "avatarUrl",
        "age",
        "isVerified",
        "isSpecialUser",
        "authProvider",
        "createdAt",
      ],
    });

    // check user is verified or not
    if (!userExist.isVerified)
      return {
        message: "your not verified yet kindly, first verify yourself",
        data: null,
      };

    if (!userExist.avatarUrl)
      return {
        message: "your not have avatar image kindly, first upload your avatar",
        data: null,
      };

    // find if user home location is exist or not
    const userHomeLocation = await this.entityManager.findOne(Location, {
      where: { userId: user.userId },
    });
    if (!userHomeLocation)
      return {
        message:
          "your home location not found kindly, first add your home location (residence)",
        data: null,
      };

    // send request to admin for approving user request to be as creator
    // userRequest.adminId
    const creatorRequest = {
      ...userExist,
      userId: user.userId,
      workLocation: userRequest.workLocation,
      qualification: userRequest.qualification,
      workOn: userRequest.worksOn,
    };

    return {
      message:
        "Your request is send to admin wait. If request accept then we will email to you",
      data: creatorRequest,
    };
  }

  async normalUserRequestForCreatorApprove(
    user: JwtAuthGuardTrueType,
    userRequest: CreateUserApprovedCreatorUserDTO,
  ) {
    console.log({ user });
    console.log({ userRequest });
    // for now admin accept user request to be creator
    // so we will create creator user
    const date = new Date();
    const locationId = uuid();

    const creatorUser = new CreatorUser({
      ...userRequest,
      userId: userRequest.userId,
      authorizedAt: date,
      authorizedAdminId: userRequest.adminId,
      workLocation: new Location({
        id: locationId,
        ...userRequest.workLocation,
        workUserId: userRequest.userId,
      }),
    });
    await this.entityManager.transaction(async em => {
      await em.save(creatorUser);
      //  // now push user Role creator in user table
      const userExist = await em.findOne(User, {
        where: { id: userRequest.userId },
      });
      userExist.userRoles.push(UserRoleEnum.CREATOR);
      await em.save(userExist);
    });
    // TODO: send email to user for approval
    return { message: "User request approved successfully", data: null };
  }

  async createAdminUser(createUser: { userId: string }) {
    // checking if user exist or not
    const userExist = await this.entityManager.findOne(User, {
      where: { id: createUser.userId },
    });
    if (!userExist) return { message: "User not found", data: null };
    if (userExist.userRoles.includes(UserRoleEnum.ADMIN))
      return { message: "User already admin", data: null };

    const adminUser = new AdminUser({ userId: createUser.userId });
    await this.entityManager.transaction(async em => {
      userExist.userRoles.push(UserRoleEnum.ADMIN);
      await em.save(userExist);
      await em.save(adminUser);
    });

    /* eslint-disable @typescript-eslint/no-unused-vars */
    return { message: "User created successfully", data: null };
  }
  async validateUser(username: string, password: string) {
    const user = await this.userService.findOneWithEmailOrPhoneNumberForLogin({
      email: isEmail(username) ? username : undefined,
      phoneNumber: isPhoneNumber(username) ? username : undefined,
    });
    if (user && this.comparePassword(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: User, role: UserRoleEnum) {
    // checking if user have role for user want's to login?
    if (!user.userRoles.includes(role)) {
      return { message: `User roles are ${user.userRoles}`, data: null };
    }
    const username = user.email ? user.email : user.phoneNumber;
    const payload = {
      username,
      sub: {
        userId: user.id,
        userRole: role,
      },
    };
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: `${process.env.JWT_TOKEN_EXPIRY}`,
        secret: `${process.env.JWT_SECRET}`,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRY}`,
        secret: `${process.env.JWT_SECRET}`,
      }),
    };
  }

  async refreshToken(user: JwtAuthGuardTrueType) {
    // checking if user have role for user want's to get refresh token?
    const userExist = await this.userService.findOneWithEmailOrPhoneNumberForLogin({
      email: isEmail(user.username) ? user.username : undefined,
      phoneNumber: isPhoneNumber(user.username) ? user.username : undefined,
    });
    if (!userExist.userRoles.includes(user.userRole)) {
      throw new BadRequestException(`User roles are ${user.userRole}`);
    }
    const payload = {
      username: user.username,
      sub: {
        userId: user.userId,
        userRole: user.userRole,
      },
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: `${process.env.JWT_SECRET}`,
        expiresIn: `${process.env.JWT_TOKEN_EXPIRY}`,
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: `${process.env.JWT_SECRET}`,
        expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRY}`,
      }),
    };
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(password, salt);
  }
  async comparePassword(plainPassword: string, hashPassword: string) {
    return await bcrypt.compare(plainPassword, hashPassword);
  }
}
