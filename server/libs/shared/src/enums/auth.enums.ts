import { UserRoleEnum } from "./user.enum"


export enum AuthProviderEnum{
    LOCAL='local',
    GOOGLE='google'
}







export type JwtAuthGuardTrueType={
    email:string,
        userId:string,
        userRole:UserRoleEnum
}