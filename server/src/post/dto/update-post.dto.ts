import { PartialType } from '@nestjs/mapped-types';
import {  CreatePostDto } from './create-post.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';





export class UpdatePostDto extends PartialType(CreatePostDto) {
    
}


export class UpdatePostContentDto  {
    @IsNotEmpty()
    @IsUUID('4')
    post_id:string
    
    @IsNotEmpty()
    @IsString()
    content:string

}

export class updatePostCommentContentDto  {
    @IsNotEmpty()
    @IsUUID('4')
    post_id:string
    
    @IsNotEmpty()
    @IsUUID('4')
    comment_id:string

    @IsNotEmpty()
    @IsString()
    content:string

}