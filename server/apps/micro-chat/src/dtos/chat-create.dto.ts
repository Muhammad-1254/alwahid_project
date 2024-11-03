import { IsArray, IsBoolean, IsDateString, IsNotEmpty, IsString, isUUID, IsUUID } from "class-validator";





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
  id:string
  
  @IsNotEmpty()
  @IsUUID('4')
  chatId:string

  @IsNotEmpty()
  @IsUUID('4')
  friendId:string

<<<<<<< HEAD
  @IsString()
  textContent:string

  @IsString()
  mediaContent:string

  @IsString()
  mediaType:string

  @IsDateString()
  sentAt:string
  
}

export class IsTypingDto{
  @IsNotEmpty()
  @IsUUID('4')
  friendId:string

  @IsNotEmpty()
  @IsBoolean()
  isTyping:boolean
}

export class MessageDeliveredDto{
  @IsNotEmpty()
  @IsUUID('4')
  chatId:string

  @IsNotEmpty()
  @IsUUID('4')
  friendId:string  

  @IsNotEmpty()
  @IsArray()
  messageIds:{messageId:string, deliveredAt:string}[]
}
export class MessageSeenDto{
  
  @IsNotEmpty()
  @IsUUID('4')
  chatId:string
  
  @IsNotEmpty()
  @IsUUID('4')
  friendId:string

  @IsNotEmpty()
  @IsArray()
  messageIds:{messageId:string, seenAt:string}[]
}


=======
  @IsNotEmpty()
  @IsString()
  content:string

  @IsNotEmpty()
  @IsString()
  mimeType:string
  
}

>>>>>>> c995c571a3519d912561c070168b458e66627329
export class CreateGroupMessageDto {
  @IsNotEmpty()
  @IsUUID('4')
  groupId:string
}




  