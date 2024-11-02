import { JwtAuthGuardTrueType } from "@app/shared"
import { CreateAddUserInChatGroupDto, CreateChatGroupDto, CreateNewUserInChatSectionDto } from "@app/shared/dtos/chat/create-chat.dto";
import { RemoveUserInChatGroupDto } from "@app/shared/dtos/chat/remove-chat.dto";
import { UpdateChatGroupDto } from "@app/shared/dtos/chat/update-chat.dto";



export type CreateNewUserInChatSectionPayloadType={
    user:JwtAuthGuardTrueType;
    createNewUserInChatSectionDto:CreateNewUserInChatSectionDto
}


export type CreateChatGroupPayloadType={
    user:JwtAuthGuardTrueType;
    createChatGroupDto:CreateChatGroupDto
}
export type AddUserInChatGroupPayloadType={
    user:JwtAuthGuardTrueType;   
    createAddUserInChatGroupDto:CreateAddUserInChatGroupDto

}
export type UpdateChatGroupPayloadType={
    user:JwtAuthGuardTrueType;
    updateChatGroupDto:UpdateChatGroupDto
}

export type LeaveChatGroupPayloadType={
    user:JwtAuthGuardTrueType;
    RemoveUserInChatGroupDto:RemoveUserInChatGroupDto
}

