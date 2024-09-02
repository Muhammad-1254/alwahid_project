import { IsArray, IsNotEmpty, IsString, isUUID, IsUUID } from "class-validator";





class FileProps{
  @IsNotEmpty()
  mimeType:string;

  @IsNotEmpty()
  fileName:string;

  @IsNotEmpty()
  fileSize:number;
}
class MediaProps{
  @IsNotEmpty()
  @IsString()
  urlKey:string

  @IsNotEmpty()
  @IsString()
  mimeType:string
}

export class CreatePresignedUrlDto{
  @IsUUID('4')
  chatId:string

  @IsNotEmpty()
  @IsUUID('4')
  groupId:string
  

  @IsNotEmpty()
  @IsArray()
  fileProps:FileProps[]
}


export class CreatePersonalChatDto {
  @IsNotEmpty()
  @IsUUID('4')
  friendId:string
}


export class CreatePersonalMessageDto {
  @IsNotEmpty()
  @IsUUID('4')
  chatId:string

  @IsNotEmpty()
  @IsUUID('4')
  friendId:string

  @IsNotEmpty()
  @IsString()
  content:string

  @IsNotEmpty()
  @IsString()
  mimeType:string
  
}

export class CreateGroupMessageDto {
  @IsNotEmpty()
  @IsUUID('4')
  groupId:string
}




  