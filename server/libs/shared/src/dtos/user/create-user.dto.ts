import {    IsDate, IsEmail,  IsEnum, IsNotEmpty, IsNumber,  IsString, IsUUID, MinLength } from "class-validator";
import { AuthProviderEnum } from "@app/shared/enums/auth.enums";
import { GenderEnum, QualificationEnum } from "@app/shared/enums/user.enum";
import { CreateLocationDTO } from "apps/micro-location/dto/create-location.dto";

export class CreateUserDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
  
  @IsString()
  @IsNotEmpty()
  firstname: string;
  
  @IsString()
  @IsNotEmpty()
  lastname: string;
  
  @IsString()
  avatarUrl: string;

  @IsNumber()
  age:number;

  @IsString()
  phoneNumber: string;
  
  @IsNotEmpty()
  @IsEnum(GenderEnum,{message:"Valid gender required!"})
  gender: GenderEnum;



  @IsNotEmpty()
  @IsDate({message:"Valid date of birth required!"})
  dateOfBirth: Date;

  @IsNotEmpty()
  @IsEnum(AuthProviderEnum,{message:"Valid auth provider required!"})
  authProvider: AuthProviderEnum;

}


export class CreateUserAdminUserDTO extends CreateUserDto{
 
}

class CreateUserCreatorUserDTO {

    @IsNotEmpty()
    @IsUUID("4")
    adminId:string

    @IsNotEmpty()
    @IsString()
    @IsEnum(QualificationEnum,{message:"Valid qualification required!"})
    qualification:QualificationEnum

    @IsString()
    @IsNotEmpty()
    worksOn:string

    @IsString()
    @IsNotEmpty()
    workLocation:CreateLocationDTO
}

export class CreateUserCreatorUserRequestAdminDTO extends CreateUserCreatorUserDTO{}
export class CreateUserApprovedCreatorUserDTO extends CreateUserCreatorUserDTO{
  @IsNotEmpty()
  @IsUUID("4")
  userId:string

}


export class createUserLocationDTO extends CreateLocationDTO{
  @IsNotEmpty()
  @IsString()
  userId:string
}

export class CreateProfilePresignedUrlDto{
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @IsNotEmpty()
  @IsNumber()
  size: number;
}
export class CreateProfileAvatarDto{
  @IsNotEmpty()
  @IsString()
  urlKey: string;

  @IsNotEmpty()
  @IsString()
  mimeType: string;
}



