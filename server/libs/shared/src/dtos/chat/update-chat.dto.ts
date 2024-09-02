import { PartialType } from "@nestjs/mapped-types";
import { CreateChatGroupDto } from "./create-chat.dto";


export class UpdateChatGroupDto extends PartialType(CreateChatGroupDto){
    groupId:string
}