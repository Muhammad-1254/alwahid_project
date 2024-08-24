import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsNotEmpty,  IsObject,  IsString,  } from 'class-validator';
import { CreateLocationDTO } from 'apps/micro-location/dto/create-location.dto';



class UserBasicInformation{
        
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
    
    @IsObject()
    location: CreateLocationDTO;
}

export class UpdateUserBasicDataDto extends PartialType(UserBasicInformation){}