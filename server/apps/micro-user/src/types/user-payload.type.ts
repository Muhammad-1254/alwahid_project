import { JwtAuthGuardTrueType, UpdateUserBasicDataDto } from "@app/shared";

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
export type unFollowToAnotherUserPayloadType = {
    user: JwtAuthGuardTrueType,
    followingId: string
}