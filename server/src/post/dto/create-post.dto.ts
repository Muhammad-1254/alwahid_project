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


  @IsNotEmpty({ message: "post id is required!" })
  @IsUUID("4")
  postId: string;
}

export class CreatePostLikeDto {
  @IsNotEmpty()
  @IsEnum(PostLikeEnum, { message: `valid like type required!` })
  likeType: PostLikeEnum;
  @IsUUID("4")
  postId: string;
}

export class CreateUserSavedPostDto {
  @IsNotEmpty()
  @IsUUID('4')
  postId: string;
}

export class CreatePostCommentLikeDto {
  @IsNotEmpty()
  @IsEnum(PostLikeEnum, { message: `valid like type required!` })
  likeType: PostLikeEnum;

  @IsNotEmpty()
  @IsUUID("4")
  commentId: string;
}
export class UpdatePostCommentLikeDto extends CreatePostCommentLikeDto {}
export class DeletePostCommentLikeDto {
  @IsNotEmpty()
  @IsUUID("4")
  likeId: string;
}