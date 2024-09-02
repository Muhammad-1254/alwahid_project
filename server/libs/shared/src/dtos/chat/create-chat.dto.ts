import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";



export class CreateNewUserInChatSectionDto{
    publicKey:string
}


export class CreateChatGroupDto{
    @IsNotEmpty({message:"group name can not be empty"})
    @IsString({message:'group name must be string'})
    groupName: string;
    
    @IsString({message:'group name must be string'})
    groupDescription: string;

    @IsNotEmpty()
    @IsString()
    avatarUrl: string;
}
export class CreateAddUserInChatGroupDto{
    
    @IsNotEmpty()
    @IsUUID()
    groupId:string;

    @IsNotEmpty()
    @IsArray()
    userIds:string[]
}