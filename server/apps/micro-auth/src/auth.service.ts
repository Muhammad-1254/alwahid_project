import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { isEmail, isPhoneNumber } from "class-validator";
import { User } from "@app/shared/entities/micro-user.entities/user.entity";
import { UserService } from "apps/micro-user/src/user.service";
import { JsonWebTokenError, JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import {
  CreateUserApprovedCreatorUserDTO,
  CreateUserCreatorUserRequestAdminDTO,
  CreateUserDto,
  MicroservicesNames,
} from "@app/shared";
import { v4 as uuid } from "uuid";
import { NormalUser } from "@app/shared/entities/micro-user.entities/user-normal.entity";
import { EntityManager } from "typeorm";
import { CreatorUser } from "@app/shared/entities/micro-user.entities/user-creator.entity";
import { Location } from "@app/shared/entities/micro-location.entities/location.entity";
import { AdminUser } from "@app/shared/entities/micro-user.entities/user-admin.entity";
import { UserRoleEnum } from "@app/shared/enums/user.enum";
import { JwtAuthGuardTrueType } from "@app/shared/enums/auth.enums";
import {
  normalUserRequestForCreatorApprovePayloadType,
  normalUserRequestForCreatorPayloadType,
} from "./types/auth-payload.type";
import { ConfigService } from "@nestjs/config";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { firstValueFrom, timestamp } from "rxjs";
import { CustomRpcExceptions } from "@app/shared/filters/CustomRpcExceptions.filter";

@Injectable()
export class AuthService {
  constructor(
    @Inject(MicroservicesNames.USER_SERVICE)
    private readonly userService: ClientProxy,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  private readonly saltRounds = 10;

  // async createNormalUser(createUser: CreateUserDto) {
  //   try {
  //     const userId = uuid();
  //     const hashPassword = await this.hashPassword(createUser.password);
  //     const normalUser = new NormalUser({
  //       ...createUser,
  //       userId,
  //       user: new User({
  //         ...createUser,
  //         userRoles: [UserRoleEnum.NORMAL],
  //         password: hashPassword,
  //         id: userId,
  //       }),
  //     });
  //     await this.entityManager.save(normalUser);
  //     /* eslint-disable @typescript-eslint/no-unused-vars */
  //     const { password, ...rest } = { ...normalUser.user };
  //     return { message: "User created successfully", data: rest };
  //   } catch (error) {
  //     console.log("error while creating normal user", error);
  //     throw error;
  //   }
  // }

  // async normalUserRequestForCreator(
  //   data: normalUserRequestForCreatorPayloadType,
  // ) {
  //   const { user, userRequest } = data;
  //   // getting user details from db
  //   const userExist = await this.entityManager.findOne(User, {
  //     where: { id: user.userId },
  //     loadEagerRelations: false,
  //     select: [
  //       "firstname",
  //       "lastname",
  //       "email",
  //       "phoneNumber",
  //       "gender",
  //       "location",
  //       "avatarUrl",
  //       "isVerified",
  //       "isSpecialUser",
  //       "authProvider",
  //       "createdAt",
  //     ],
  //   });

  //   // check user is verified or not
  //   if (!userExist.isVerified)
  //     return {
  //       message: "your not verified yet kindly, first verify yourself",
  //       data: null,
  //     };

  //   if (!userExist.avatarUrl)
  //     return {
  //       message: "your not have avatar image kindly, first upload your avatar",
  //       data: null,
  //     };

  //   // find if user home location is exist or not
  //   const userHomeLocation = await this.entityManager.findOne(Location, {
  //     where: { userId: user.userId },
  //   });
  //   if (!userHomeLocation)
  //     return {
  //       message:
  //         "your home location not found kindly, first add your home location (residence)",
  //       data: null,
  //     };

  //   // send request to admin for approving user request to be as creator
  //   // userRequest.adminId
  //   const creatorRequest = {
  //     ...userExist,
  //     userId: user.userId,
  //     workLocation: userRequest.workLocation,
  //     qualification: userRequest.qualification,
  //     workOn: userRequest.worksOn,
  //   };

  //   return {
  //     message:
  //       "Your request is send to admin wait. If request accept then we will email to you",
  //     data: creatorRequest,
  //   };
  // }

  // async normalUserRequestForCreatorApprove(
  //   data: normalUserRequestForCreatorApprovePayloadType,
  // ) {
  //   const { user, userRequest } = data;
  //   console.log({ user });
  //   console.log({ userRequest });
  //   // for now admin accept user request to be creator
  //   // so we will create creator user
  //   const date = new Date();
  //   const locationId = uuid();

  //   const creatorUser = new CreatorUser({
  //     ...userRequest,
  //     userId: userRequest.userId,
  //     authorizedAt: date,
  //     authorizedAdminId: userRequest.adminId,
  //     workLocation: new Location({
  //       id: locationId,
  //       ...userRequest.workLocation,
  //       workUserId: userRequest.userId,
  //     }),
  //   });
  //   await this.entityManager.transaction(async em => {
  //     await em.save(creatorUser);
  //     //  // now push user Role creator in user table
  //     const userExist = await em.findOne(User, {
  //       where: { id: userRequest.userId },
  //     });
  //     userExist.userRoles.push(UserRoleEnum.CREATOR);
  //     await em.save(userExist);
  //   });
  //   // TODO: send email to user for approval
  //   return { message: "User request approved successfully", data: null };
  // }

  // async createAdminUser(createUser: { userId: string }) {
  //   // checking if user exist or not
  //   const userExist = await this.entityManager.findOne(User, {
  //     where: { id: createUser.userId },
  //   });
  //   if (!userExist) return { message: "User not found", data: null };
  //   if (userExist.userRoles.includes(UserRoleEnum.ADMIN))
  //     return { message: "User already admin", data: null };

  //   const adminUser = new AdminUser({ userId: createUser.userId });
  //   await this.entityManager.transaction(async em => {
  //     userExist.userRoles.push(UserRoleEnum.ADMIN);
  //     await em.save(userExist);
  //     await em.save(adminUser);
  //   });

  //   /* eslint-disable @typescript-eslint/no-unused-vars */
  //   return { message: "User created successfully", data: null };
  // }
  async validateUser(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    if (user && (await this.comparePassword(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(data: { email: string; password: string; role: UserRoleEnum }) {
    // checking if user have role for user want's to login?
    const { password, role, email } = data;
    const user = await this.validateUser(email, password);
    if (!user) {
      throw CustomRpcExceptions.BadRequestException("Invalid username or password");
    }

    if (!user.userRoles.includes(role)) {
      return CustomRpcExceptions.BadRequestException("Invalid user role");
    }
    const payload = {
      email: user.email,
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

  async getAccessToken(encodedRefreshToken: string) {
    const user = await this.verifyJwtToken(encodedRefreshToken);
    console.log("user from getAccessToken", user);
    // checking if user have role for user want's to get refresh token?
    const userExist = await this.getUserByEmail(user.email);
    console.log("userExist from getAccessToken", userExist);
    if (!userExist.userRoles.includes(user.userRole)) {
      throw new RpcException(`User roles are ${user.userRole}`);
    }
    const payload = {
      email: user.email,
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

   async verifyJwtToken(token: string): Promise<JwtAuthGuardTrueType> {
    try {
      const decoded = await this.jwtService.verify(token, {
        ignoreExpiration: false,
        secret: this.configService.get("JWT_SECRET"),
      });
      return {
        email: decoded.email,
        userId: decoded.sub.userId,
        userRole: decoded.sub.userRole
      };
    } catch (error) {
     
      if (error instanceof JsonWebTokenError) {
        if (error.message === "jwt expired") {
          throw  CustomRpcExceptions.UnauthorizedException("Token expired");
        } else if (error.message === "invalid token") {
          throw CustomRpcExceptions.UnauthorizedException("Invalid token");
        } else {
          throw CustomRpcExceptions.UnauthorizedException("else Invalid token");
        }
      }else {
        console.log("error in verifyJwtToken", error);
      }
    }
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(password, salt);
  }
  async comparePassword(plainPassword: string, hashPassword: string) {
    return await bcrypt.compare(plainPassword, hashPassword);
  }

  async getUserByEmail(email: string) {
    const ob$ = this.userService.send({ cmd: "getUserByEmail" }, { email });
    const res = await firstValueFrom(ob$)
    .catch(e =>{ console.log("error while receiving response from user service", e)
      throw CustomRpcExceptions.InternalException("User service error while getting user by email")
    });
    return res;
  }
}
