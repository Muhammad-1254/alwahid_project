import { CreateUserApprovedCreatorUserDTO, CreateUserCreatorUserRequestAdminDTO, JwtAuthGuardTrueType } from "@app/shared"

export type normalUserRequestForCreatorPayloadType = {
    user:JwtAuthGuardTrueType,
    userRequest: CreateUserCreatorUserRequestAdminDTO,
}

export type normalUserRequestForCreatorApprovePayloadType = {
    user:JwtAuthGuardTrueType,
    userRequest: CreateUserApprovedCreatorUserDTO,
}


export type loginPayloadType = {
    
}