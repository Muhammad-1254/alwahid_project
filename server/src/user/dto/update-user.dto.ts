import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsNotEmpty,  IsString,  } from 'class-validator';



class UserBasicInfo{
        
    @IsString()
    @IsNotEmpty()
    firstname: string;
    
    @IsString()
    @IsNotEmpty()
    lastname: string;
  
  
    @IsString()
    phoneNumber: string;
    
  
    @IsNotEmpty()
    @IsDate({message:"Valid date of birth required!"})
    dateOfBirth: Date;

}


export class UpdateUserBasicData extends PartialType(UserBasicInfo){}