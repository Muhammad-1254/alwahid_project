


export enum PostLikeEnum{
    HEART = "heart",
    LIKE = "like",
    LAUGH = "laugh",
    SAD = "sad",
    WOW = "wow",
}


export type PaginationType ={
    skip: number;
    take: number;
}


export const dummyCommentLikes = [
    { createdAt: '2023-01-01T00:00:00Z', id: '1', likeType: PostLikeEnum.HEART },
    { createdAt: '2023-01-02T00:00:00Z', id: '2', likeType: PostLikeEnum.LIKE },
    { createdAt: '2023-01-03T00:00:00Z', id: '3', likeType: PostLikeEnum.LAUGH },
    { createdAt: '2023-01-04T00:00:00Z', id: '4', likeType: PostLikeEnum.SAD },
    { createdAt: '2023-01-05T00:00:00Z', id: '5', likeType: PostLikeEnum.WOW },
    { createdAt: '2023-01-06T00:00:00Z', id: '6', likeType: PostLikeEnum.HEART },
    { createdAt: '2023-01-07T00:00:00Z', id: '7', likeType: PostLikeEnum.LIKE },
    { createdAt: '2023-01-08T00:00:00Z', id: '8', likeType: PostLikeEnum.LAUGH },
    { createdAt: '2023-01-09T00:00:00Z', id: '9', likeType: PostLikeEnum.SAD },
    { createdAt: '2023-01-10T00:00:00Z', id: '10', likeType: PostLikeEnum.WOW },
    { createdAt: '2023-01-11T00:00:00Z', id: '11', likeType: PostLikeEnum.HEART },
    { createdAt: '2023-01-12T00:00:00Z', id: '12', likeType: PostLikeEnum.LIKE },
    { createdAt: '2023-01-13T00:00:00Z', id: '13', likeType: PostLikeEnum.LAUGH },
    { createdAt: '2023-01-14T00:00:00Z', id: '14', likeType: PostLikeEnum.SAD },
    { createdAt: '2023-01-15T00:00:00Z', id: '15', likeType: PostLikeEnum.WOW },
];
