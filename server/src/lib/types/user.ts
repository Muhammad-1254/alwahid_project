export enum GenderEnum{
    MALE='male',
    FEMALE='female'
}


export enum AuthProviderEnum{
    LOCAL='local',
    GOOGLE='google'
}

export enum UserRoleEnum{
    ADMIN='admin',
    CREATOR='creator',
    NORMAL='normal',
}


export enum QualificationEnum{
    GRADUATED='graduated'
}



export type JwtAuthGuardTrueType={
    username:string,
        userId:string,
        userRole:UserRoleEnum
}