import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import {
  CreatePostCommentDto,
  CreatePostDto,
  CreatePostMediaDto,
  createPostOrCommentLikeDto,
  CreatePresignedUrlDto,
} from "./dto/create-post.dto";
import {
  updatePostCommentContentDto,
  UpdatePostContentDto,
} from "./dto/update-post.dto";
import { v4 as uuid } from "uuid";
import { Post } from "./entities/post.entity";
import { PostMedia } from "./entities/post-media.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { PostComments } from "./entities/post-comment.entity";
import { User } from "src/user/entities/user.entity";
import { JwtAuthGuardTrueType, UserRoleEnum } from "src/lib/types/user";
import {
  commentsResponseDataType,
  postCommentLikesResponseDataType,
  PostMediaEnum,
  PostUserTypeEnum,
} from "src/lib/types/post";
import { PostCommentLike } from "./entities/post-comment-like.entity";
import { ConfigService } from "@nestjs/config";

import { S3Client } from "@aws-sdk/client-s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  async createPresignedUrl(
    user: JwtAuthGuardTrueType,
    createPresignedUrlDto: CreatePresignedUrlDto[],
  ) {
    console.log({user})
    if(user.userRole !== UserRoleEnum.ADMIN && user.userRole !== UserRoleEnum.CREATOR){
      throw new ForbiddenException("Invalid user role!");
    }
    const s3Client = await this.getS3Client();
    const presignedUrls = [];
    for (let i = 0; i < createPresignedUrlDto.length; i++) {
      const key = `post/${user.userId}/${new Date().getTime()}-${createPresignedUrlDto[i].fileName}`;
      const command = new PutObjectCommand({
        Bucket: this.configService.getOrThrow("AWS_S3_BUCKET_NAME"),
        Key:key,
        ContentType: createPresignedUrlDto[i].mimeType,
      });
      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 1200, // 20 minutes
      });
      presignedUrls.push({fileName:createPresignedUrlDto[i].fileName,key,url});
    }
   
    return presignedUrls
  }
  async createPost(
    user: JwtAuthGuardTrueType,
    createPostDto: CreatePostDto) {
    if(user.userRole !== UserRoleEnum.ADMIN && user.userRole !== UserRoleEnum.CREATOR){
      throw new ForbiddenException("Invalid user role!");
    }
 if(createPostDto.postMedias.length === 0 && createPostDto.textContent === ''){
   throw new Error("Post content or media is required!");
 }

    await this.entityManager.transaction(async entityManager => {
      const postId = uuid();
      const post = new Post({
        id: postId,
        text_content: createPostDto.textContent,
        post_by: user.userRole ==='creator' ? PostUserTypeEnum.CREATOR : PostUserTypeEnum.ADMIN,
        creator_user_id: user.userRole==='creator' ? user.userId : null,
        admin_user_id: user.userRole==='admin' ? user.userId : null,
      });

      // the media.urlKey have key we have to make the url from aws presigned method then add into db
      const postMediaList: PostMedia[] = []
      for(let i =0; i< createPostDto.postMedias.length; i++){
        const url = await this.getAwsS3UrlFromKey(createPostDto.postMedias[i].urlKey,await this.getS3Client())
        const postMedia = new PostMedia({
          id: uuid(),
          post_id:postId,
          mime_type:createPostDto.postMedias[i].mimeType,
          url
        });
        postMediaList.push(postMedia);
      }
       
      await entityManager.save(post);
      if (postMediaList.length > 0) {
        await entityManager.save(postMediaList);
      }

      //  // Checking if user used hashtags
      // if (createPostDto.hashtagIds) {
      //   for (const hashtagId of createPostDto.hashtagIds) {
      //     const postHashtagAssociation = new HashtagPostAssociation({
      //       post_id,
      //       hashtag_id: hashtagId,
      //     });
      //     await entityManager.save(postHashtagAssociation);
      //   }
      // }

      // // Checking if user tagged someone
      // if (createPostDto.taggedUserIds) {
      //   for (const userId of createPostDto.taggedUserIds) {
      //     const taggedUser = await entityManager.findOne(User, { where: { id: userId } });
      //     if (!taggedUser) {
      //       throw new NotFoundException(`User with ID ${userId} not found!`);
      //     }
      //     if (taggedUser.tagged_posts && taggedUser.tagged_posts.length > 0) {
      //       taggedUser.tagged_posts.push(post);
      //     } else {
      //       taggedUser.tagged_posts = [post];
      //     }
      //     await entityManager.save(taggedUser);
      //   }
      // }
    });

    return { message: "Post created successfully!" };
  }
  async createPostMedia(createMedia: CreatePostMediaDto) {
    const postMedia: PostMedia[] = [];
    await this.entityManager.transaction(async entityManager => {
      // first check if post is exist or not
      const post = await entityManager.findOne(Post, {
        where: { id: createMedia.postId },
        select: ["id"],
      });
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      createMedia.postMedias.forEach(media => {
        if (
          media.mimeType !== PostMediaEnum.IMAGE &&
          media.mimeType !== PostMediaEnum.VIDEO
        ) {
          throw new UnsupportedMediaTypeException("Invalid media type!");
        }
        const postMedia_ = new PostMedia({
          ...media,
          id: uuid(),
          post_id: createMedia.postId,
        });
        postMedia.push(postMedia_);
        this.entityManager.save(postMedia_);
      });
    });
    return { message: "media created successfully!", data: postMedia };
  }

  async createPostComment(createPostDto: CreatePostCommentDto) {
    let postComment: PostComments;
    await this.entityManager.transaction(async entityManager => {
      const [user, post] = await Promise.all([
        await entityManager.findOne(User, {
          where: { id: createPostDto.userId },
          select: ["id"],
        }),
        await entityManager.findOne(Post, {
          where: { id: createPostDto.postId },
          select: ["id"],
        }),
      ]);
      if (!user) {
        throw new NotFoundException("User not found!");
      }
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      postComment = new PostComments({
        id: uuid(),
        content: createPostDto.content,
        user_id: createPostDto.userId,
        post_id: createPostDto.postId,
      });
      await this.entityManager.save(postComment);
    });

    return { message: "comment created successfully!", data: postComment };
  }
  async createPostOrCommentLike(createLike: createPostOrCommentLikeDto) {
    if (!createLike.postId && !createLike.commentId) {
      // checking if post id or comment id is exist or not
      throw new Error("Post id or comment id is required!");
    }
    await this.entityManager.transaction(async entityManager => {
      // checking of user already liked the post or comment
      const likes = await entityManager.find(PostCommentLike, {
        where: { user_id: createLike.userId },
      });
      const isLiked = likes.find(
        like =>
          like.post_id === createLike.postId ||
          like.comment_id === createLike.commentId,
      );
      if (isLiked) {
        // dislike now
        isLiked.like_type = createLike.likeType;
        await entityManager.save(isLiked);
        return { message: "like updated successfully!" };
      }
      //checking if user is exist or not
      const [user, postOrComment] = await Promise.all([
        await entityManager.findOne(User, {
          where: { id: createLike.userId },
          select: ["id"],
        }),
        createLike.postId
          ? await entityManager.findOne(Post, {
              where: { id: createLike.postId },
              select: ["id", "admin_user_id", "admin_user_id"],
            })
          : await entityManager.findOne(PostComments, {
              where: { id: createLike.commentId },
              select: ["id", "user_id"],
            }),
      ]);
      if (!user) {
        throw new NotFoundException("User not found!");
      }
      if (!postOrComment) {
        throw new NotFoundException("Post or Comment not found!");
      }

      const like = new PostCommentLike({
        id: uuid(),
        ...createLike,
      });
      entityManager.save(like);
    });
  }
  async findUserPersonalPosts(user:JwtAuthGuardTrueType,from:number,to:number){
    if(user.userRole !== UserRoleEnum.ADMIN && user.userRole !== UserRoleEnum.CREATOR){
      throw new ForbiddenException("Invalid user role!");
    }
    const posts = await this.entityManager.find(Post, {
      where: user.userRole === UserRoleEnum.ADMIN ? { admin_user_id: user.userId } : { creator_user_id: user.userId },
      skip: from,
      take: to,
      order: { created_at: "DESC" },
      relations: ["postMedias"],
    });
    return posts
  }

  async findAllPosts(from: number, to: number) {
    const posts = await this.entityManager.find(Post, {
      skip: from,
      take: to,
      order: { created_at: "DESC" },
    });
    return { data: posts };
  }

  async findAllComments(post_id: string, from: number, to: number) {
    const postComments: commentsResponseDataType[] = [];

    await this.entityManager.transaction(async entityManager => {
      const post = await entityManager.findOne(Post, {
        where: {
          id: post_id,
        },
        select: ["id"],
      });
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      const [comments]: [PostComments[], number] =
        await entityManager.findAndCount(PostComments, {
          where: { post_id },
          skip: from,
          take: to,
        });
      // finding the relevant user belongs to the comment

      comments.forEach(async comment => {
        const user = await entityManager.findOne(User, {
          where: { id: comment.user_id },
          select: [
            "id",
            "firstname",
            "lastname",
            "avatar_url",
            "user_role",
            "is_special_user",
            "is_verified",
          ],
        });
        postComments.push({
          user_id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          avatar_url: user.avatar_url,
          user_role: user.user_role,
          is_special_user: user.is_special_user,
          is_verified: user.is_verified,
          comment_id: comment.id,
          commentContent: comment.content,
          commentLikes: comment.commentLikes,
          created_at: comment.created_at,
        });
      });
    });
    return { data: postComments };
  }

  async findAllPostLikes(post_id: string, from: number, to: number) {
    const postLikes: postCommentLikesResponseDataType[] = [];

    await this.entityManager.transaction(async entityManager => {
      const post = await entityManager.findOne(Post, {
        where: {
          id: post_id,
        },
        select: ["id"],
      });
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      const [likes]: [PostCommentLike[], number] =
        await entityManager.findAndCount(PostCommentLike, {
          where: { post_id },
          skip: from,
          take: to,
        });
      // finding the relevant user belongs to the comment

      likes.forEach(async like => {
        const user = await entityManager.findOne(User, {
          where: { id: like.user_id },
          select: [
            "id",
            "firstname",
            "lastname",
            "avatar_url",
            "user_role",
            "is_special_user",
            "is_verified",
          ],
        });
        postLikes.push({
          user_id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          avatar_url: user.avatar_url,
          user_role: user.user_role,
          is_special_user: user.is_special_user,
          is_verified: user.is_verified,
          like_id: like.id,
          like_type: like.like_type,
          created_at: like.created_at,
        });
      });
    });
    return { data: postLikes };
  }
  async findAllCommentLikes(comment_id: string, from: number, to: number) {
    const commentLikes: postCommentLikesResponseDataType[] = [];

    await this.entityManager.transaction(async entityManager => {
      const comment = await entityManager.findOne(PostComments, {
        where: {
          id: comment_id,
        },
      });
      if (!comment) {
        throw new NotFoundException("Comment not found!");
      }
      const [likes]: [PostCommentLike[], number] =
        await entityManager.findAndCount(PostCommentLike, {
          where: { comment_id },
          skip: from,
          take: to,
        });
      // finding the relevant user belongs to the comment
      likes.forEach(async like => {
        const user = await entityManager.findOne(User, {
          where: { id: like.user_id },
          select: [
            "id",
            "firstname",
            "lastname",
            "avatar_url",
            "user_role",
            "is_special_user",
            "is_verified",
          ],
        });
        commentLikes.push({
          user_id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          avatar_url: user.avatar_url,
          user_role: user.user_role,
          is_special_user: user.is_special_user,
          is_verified: user.is_verified,
          like_id: like.id,
          like_type: like.like_type,
          created_at: like.created_at,
        });
      });
    });
    return { data: commentLikes };
  }

  async findOnePost(post_id: string) {
    const post = await this.entityManager.findOne(Post, {
      where: { id: post_id },
    });
    return { data: post };
  }

  async updatePostContent(updatePost: UpdatePostContentDto) {
    await this.entityManager.transaction(async entityManager => {
      const post = await entityManager.findOne(Post, {
        where: { id: updatePost.post_id },
        select: ["id", "text_content"],
      });
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      post.text_content = updatePost.content;
      await this.entityManager.save(post);
    });
    return { message: "post updated successfully!" };
  }
  async updatePostCommentContent(updateComment: updatePostCommentContentDto) {
    await this.entityManager.transaction(async entityManager => {
      const comment = await entityManager.findOne(PostComments, {
        where: { id: updateComment.comment_id },
        select: ["id", "content"],
      });

      comment.content = updateComment.content;
      await entityManager.save(comment);
    });
    return { message: "comment updated successfully!" };
  }

  async removePost(id: string) {
    await this.entityManager.delete(Post, { id });
    return { message: "Post deleted successfully!" };
  }

  async removePostMedia(id: string) {
    await this.entityManager.delete(PostMedia, { id });
    return { message: "Post deleted successfully!" };
  }

  async removePostComment(id: string) {
    await this.entityManager.delete(PostComments, { id });
    return { message: "Comment deleted successfully!" };
  }
  async removePostOrCommentLike(id: string) {
    await this.entityManager.delete(PostCommentLike, { id });
    return { message: "Like deleted successfully!" };
  }

  async getS3Client() {
    const s3Client = new S3Client({
      region: this.configService.get("AWS_S3_REGION"),
      credentials: {
        accessKeyId: this.configService.get("AWS_S3_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_S3_SECRET_ACCESS_KEY"),
      },
    });
    return s3Client;
  }
  async getAwsS3UrlFromKey(key: string, s3Client: S3Client) {
const command = new GetObjectCommand({
  Bucket:this.configService.getOrThrow("AWS_S3_BUCKET_NAME"),
  Key:key
});
return  await getSignedUrl(s3Client,command)
  }
}
