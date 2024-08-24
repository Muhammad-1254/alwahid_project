import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { CityEnum, CountryEnum, ProvinceEnum } from "@app/shared/enums/location.enums";


    
  
export class CreateLocationDTO{

    @IsNotEmpty()
    @IsEnum(CountryEnum,{message:"Valid country required!"})
    country: CountryEnum
  
    @IsNotEmpty()
    @IsEnum(ProvinceEnum,{message:"Valid Province or state required!"})
    province: ProvinceEnum
  
    @IsNotEmpty()
    @IsEnum(CityEnum,{message:"Valid City required!"})
    city: CityEnum
  
    @IsNotEmpty()
    @IsString({message:"Zip code required!"})
    zipCode:string
  
    @IsNotEmpty()
    @IsString({message:"Street address required!"})
    street:string
  }
  