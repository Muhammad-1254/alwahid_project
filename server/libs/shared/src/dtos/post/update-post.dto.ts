import { PartialType } from '@nestjs/mapped-types';
import {  CreatePostDto } from './create-post.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';





export class UpdatePostDto extends PartialType(CreatePostDto) {
    
}


export class UpdatePostContentDto  {
    @IsNotEmpty()
    @IsUUID('4')
    postId:string
    
    @IsNotEmpty()
    @IsString()
    content:string

}

export class UpdatePostCommentContentDto  {
    @IsNotEmpty()
    @IsUUID('4')
    postId:string
    
    @IsNotEmpty()
    @IsUUID('4')
    commentId:string

    @IsNotEmpty()
    @IsString()
    content:string

}