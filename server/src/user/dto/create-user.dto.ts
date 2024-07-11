import {    IsDate, IsEmail,  IsEnum, IsNotEmpty, IsNumber,  IsString, IsUUID, MinLength } from "class-validator";
import { AuthProviderEnum, GenderEnum, QualificationEnum } from "src/lib/types/user";
import { CreateLocationDTO } from "src/location/dto/create-location.dto";

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
  avatar_url: string;

  @IsNumber()
  age:number;

  @IsString()
  phone_number: string;
  
  @IsNotEmpty()
  @IsEnum(GenderEnum,{message:"Valid gender required!"})
  gender: GenderEnum;



  @IsNotEmpty()
  @IsDate({message:"Valid date of birth required!"})
  date_of_birth: Date;

  @IsNotEmpty()
  @IsEnum(AuthProviderEnum,{message:"Valid auth provider required!"})
  auth_provider: AuthProviderEnum;

}


export class CreateUserAdminUserDTO extends CreateUserDto{
 
}

class CreateUserCreatorUserDTO {

    @IsNotEmpty()
    @IsUUID()
    user_id:string
 
    @IsNotEmpty()
    @IsString()
    @IsEnum(QualificationEnum,{message:"Valid qualification required!"})
    qualification:QualificationEnum

    @IsString()
    @IsNotEmpty()
    works_on:string

    @IsString()
    @IsNotEmpty()
    work_location:CreateLocationDTO
}

export class CreateUserCreatorUserRequestAdminDTO extends CreateUserCreatorUserDTO{}
export class CreateUserApprovedCreatorUserDTO extends CreateUserCreatorUserDTO{
  @IsNotEmpty()
  @IsUUID()
  admin_id:string

}


export class createUserLocationDTO extends CreateLocationDTO{
  @IsNotEmpty()
  @IsString()
  user_id:string
}



