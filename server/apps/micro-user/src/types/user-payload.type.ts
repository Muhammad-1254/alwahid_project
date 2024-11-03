import { JwtAuthGuardTrueType, UpdateUserBasicDataDto } from "@app/shared";


export type FollowToAnotherUserPayloadType={
    user:JwtAuthGuardTrueType,
    followId:string
}

export type GetUsersSearchPayloadType={
    user:JwtAuthGuardTrueType,
    search:string,
}
export type getUserFollowersPayloadType = {
    userId: string;
    skip: number;
    take: number;
    orderDesc: boolean;
}

export type getProfileAvatarUploadPresignedUrlPayloadType = {
    user: JwtAuthGuardTrueType;
    fileProps:{ filename: string; fileSize: number; mimeType: string }
}

export type updateProfileAvatarPayloadType = {
    user: JwtAuthGuardTrueType,
    imageProps: { key: string }
}

export type updateUserBasicDataPayloadType = {
    user: JwtAuthGuardTrueType,
   data: UpdateUserBasicDataDto
}
export type UnFollowToAnotherUserPayloadType = {
    user: JwtAuthGuardTrueType,
    followingId: string
}
