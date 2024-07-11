import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { PostLikeEnum, PostLikeTargetEnum, PostMediaEnum, PostUserTypeEnum } from "src/lib/types/post";

export class CreatePostDto {
    @IsString()
    text_content?: string;

    @IsNotEmpty()
    @IsEnum(PostUserTypeEnum,{message:`valid user role required!. i.e ${PostUserTypeEnum.ADMIN} or ${PostUserTypeEnum.CREATOR}`})
    post_by: PostUserTypeEnum;

    @IsUUID("4")
    creator_user_id?: string;

    @IsUUID("4")
    admin_user_id?: string;   

    @IsArray()
    postMedias:PostMediaDto[]
    
}
class PostMediaDto{
    @IsNotEmpty()
    @IsString()
    url:string

    @IsNotEmpty()
    @IsEnum(PostMediaEnum,{message:`valid post type required!.`})
    post_type:PostMediaEnum
}
export class CreatePostMediaDto{
    @IsNotEmpty()
    @IsUUID("4")
    post_id:string

    @IsArray()
    postMedias:PostMediaDto[]
}

export class CreatePostCommentDto{
    @IsNotEmpty()
    @IsString({message:"comment content is required!"})
    content:string;

    @IsNotEmpty({message:"user id is required!"})
    @IsUUID("4")
    user_id:string

    @IsNotEmpty({message:"post id is required!"})
    @IsUUID("4")
    post_id:string
}

export class createPostOrCommentLikeDto{
    @IsNotEmpty()
    @IsEnum(PostLikeTargetEnum,{message:`valid target type required!. i.e ${PostLikeTargetEnum.POST} or ${PostLikeTargetEnum.COMMENT}`})
    target_type:PostLikeTargetEnum

    @IsNotEmpty()
    @IsEnum(PostLikeEnum,{message:`valid like type required!`})
    like_type:PostLikeEnum

    @IsNotEmpty()
    @IsUUID("4")
    user_id:string

    @IsUUID("4")
    post_id?:string

    @IsUUID("4")
    comment_id?:string



}   







// {
//     "text_content":"This is testing Post",
//     "post_by":"creator",
//     "creator_user_id":"6117f84d-6940-4883-9d51-8366b99de544",
//     "postMedias":[
//         {
//             "url":"https://images.pexels.com/photos/839011/pexels-photo-839011.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
//             "post_type":"image"
//         },
//         {
//             "url":"https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
//             "post_type":"image"
//         },
//         {
//         "url":
// "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
//         "post_type":"image" 
// }

//     ]
// }


// {
//     "content":"This is testing comment 1",
//     "user_id":"6117f84d-6940-4883-9d51-8366b99de544",
//     "post_id": "c75dc010-9aae-40c2-a399-7e1ac9ede67a",
// }


// {
//     "target_type":"post",
//     "like_type":"dislike",
//     "user_id":"6117f84d-6940-4883-9d51-8366b99de544",
//     "post_id":"d4bc35b0-b813-43b1-a8c9-274b945857da"
// }

// {
//     "target_type":"comment",
//     "like_type":"dislike",
//     "user_id":"6117f84d-6940-4883-9d51-8366b99de544",
//     "comment_id":"d2373f36-44ac-40ae-bf46-fc45c9843a74"
// }


