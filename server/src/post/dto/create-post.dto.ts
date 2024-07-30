import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from "class-validator";
import { PostLikeEnum,  } from "src/lib/types/post";

export class CreatePostDto {
  @IsString()
  textContent?: string;

  @IsArray()
  postMedias: PostMediaDto[];
}

export class CreatePresignedUrlDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @IsNotEmpty()
  @IsNumber()
  size: number;
}

class PostMediaDto {
  @IsNotEmpty()
  @IsString()
  urlKey: string;

  @IsNotEmpty()
  @IsString()
  mimeType: string;
}
export class CreatePostMediaDto {
  @IsNotEmpty()
  @IsUUID("4")
  postId: string;

  @IsArray()
  postMedias: PostMediaDto[];
}

export class CreatePostCommentDto {
  @IsNotEmpty()
  @IsString({ message: "comment content is required!" })
  content: string;

  @IsNotEmpty({ message: "user id is required!" })
  @IsUUID("4")
  userId: string;

  @IsNotEmpty({ message: "post id is required!" })
  @IsUUID("4")
  postId: string;
}

export class createPostLikeDto {
  @IsNotEmpty()
  @IsEnum(PostLikeEnum, { message: `valid like type required!` })
  likeType: PostLikeEnum;
  @IsUUID("4")
  postId: string;
}

export class createPostCommentLikeDto {
  @IsNotEmpty()
  @IsEnum(PostLikeEnum, { message: `valid like type required!` })
  likeType: PostLikeEnum;

  @IsNotEmpty()
  @IsUUID("4")
  userId: string;
  @IsUUID("4")
  commentId: string;
}
