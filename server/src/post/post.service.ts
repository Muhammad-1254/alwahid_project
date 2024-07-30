import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import {
  CreatePostCommentDto,
  CreatePostDto,
  createPostLikeDto,
  CreatePostMediaDto,
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
  PostLikeTargetEnum,
  PostMediaEnum,
  PostUserTypeEnum,
} from "src/lib/types/post";
import { PostCommentLike } from "./entities/post-comment-like.entity";
import { ConfigService } from "@nestjs/config";

import { S3Client } from "@aws-sdk/client-s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prefixSplitNestingObject } from "src/lib/utils";

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
    console.log({ user });
    if (
      user.userRole !== UserRoleEnum.ADMIN &&
      user.userRole !== UserRoleEnum.CREATOR
    ) {
      throw new ForbiddenException("Invalid user role!");
    }
    const s3Client = await this.getS3Client();
    const presignedUrls = [];
    for (let i = 0; i < createPresignedUrlDto.length; i++) {
      const key = `post/${user.userId}/${new Date().getTime()}-${createPresignedUrlDto[i].fileName}`;
      const command = new PutObjectCommand({
        Bucket: this.configService.getOrThrow("AWS_S3_BUCKET_NAME"),
        Key: key,
        ContentType: createPresignedUrlDto[i].mimeType,
      });
      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 1200, // 20 minutes
      });
      presignedUrls.push({
        fileName: createPresignedUrlDto[i].fileName,
        key,
        url,
      });
    }

    return presignedUrls;
  }
  async createPost(user: JwtAuthGuardTrueType, createPostDto: CreatePostDto) {
    if (
      user.userRole !== UserRoleEnum.ADMIN &&
      user.userRole !== UserRoleEnum.CREATOR
    ) {
      throw new ForbiddenException("Invalid user role!");
    }
    if (
      createPostDto.postMedias.length === 0 &&
      createPostDto.textContent === ""
    ) {
      throw new Error("Post content or media is required!");
    }

    await this.entityManager.transaction(async entityManager => {
      const postId = uuid();
      const post = new Post({
        id: postId,
        textContent: createPostDto.textContent,
        postBy:
          user.userRole === "creator"
            ? PostUserTypeEnum.CREATOR
            : PostUserTypeEnum.ADMIN,
        creatorUserId: user.userRole === "creator" ? user.userId : null,
        adminUserId: user.userRole === "admin" ? user.userId : null,
      });

      // the media.urlKey have key we have to make the url from aws presigned method then add into db
      const postMediaList: PostMedia[] = [];
      for (let i = 0; i < createPostDto.postMedias.length; i++) {
        const url = await this.getAwsS3UrlFromKey(
          createPostDto.postMedias[i].urlKey,
          await this.getS3Client(),
        );
        const postMedia = new PostMedia({
          id: uuid(),
          postId: postId,
          mimeType: createPostDto.postMedias[i].mimeType,
          url,
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
      //       postId,
      //       hashtagId: hashtagId,
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
      //     if (taggedUser.taggedPosts && taggedUser.taggedPosts.length > 0) {
      //       taggedUser.taggedPosts.push(post);
      //     } else {
      //       taggedUser.taggedPosts = [post];
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
          postId: createMedia.postId,
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
        userId: createPostDto.userId,
        postId: createPostDto.postId,
      });
      await this.entityManager.save(postComment);
    });

    return { message: "comment created successfully!", data: postComment };
  }
  async createPostLike(
    user: JwtAuthGuardTrueType,
    createLike: createPostLikeDto,
  ) {
    const like = await this.entityManager.transaction(async eM => {
      // checking of user already liked the post or comment
      const like = await eM.findOne(PostCommentLike, {
        where: { postId: createLike.postId, userId: user.userId },
        select: ["id", "likeType"],
      });
      if (like) {
        // checking if likeType is same or not
        if (like.likeType === createLike.likeType) {
          return { message: "already liked!" };
        } else {
          // if same then update new one
          like.likeType = createLike.likeType;
          await eM.save(like);
          return { message: "like updated successfully!" };
        }
      }
      // if not liked then create new one
      const postLike = new PostCommentLike({
        id: uuid(),
        likeType: createLike.likeType,
        userId: user.userId,
        postId: createLike.postId,
        targetType: PostLikeTargetEnum.POST,
      });
      await eM.save(postLike);
      return { message: "like created successfully!" };
    });
    return like.message;
  }
  async findUserPersonalPosts(
    user: JwtAuthGuardTrueType,
    from: number,
    to: number,
  ) {
    if (
      user.userRole !== UserRoleEnum.ADMIN &&
      user.userRole !== UserRoleEnum.CREATOR
    ) {
      throw new ForbiddenException("Invalid user role!");
    }
    const posts = await this.entityManager.find(Post, {
      where:
        user.userRole === UserRoleEnum.ADMIN
          ? { adminUserId: user.userId }
          : { creatorUserId: user.userId },
      skip: from,
      take: to,
      order: { createdAt: "DESC" },
      relations: ["postMedias"],
      loadEagerRelations: false,
      select: ["id", "textContent", "createdAt", "postMedias"],
    });
    const postsData = posts.map(post => ({
      id: post.id,
      textContent: post.textContent,
      createdAt: post.createdAt,
      postMedias: post.postMedias.map(media => ({
        id: media.id,
        mimeType: media.mimeType,
        url: media.url,
      })),
    }));
    return postsData;
  }

  async findAllPosts(from: number, to: number) {
    const posts = await this.entityManager.find(Post, {
      skip: from,
      take: to,
      order: { createdAt: "DESC" },
    });
    return { data: posts };
  }

  async findAllComments(postId: string, from: number, to: number) {
    const postComments: commentsResponseDataType[] = [];

    await this.entityManager.transaction(async entityManager => {
      const post = await entityManager.findOne(Post, {
        where: {
          id: postId,
        },
        select: ["id"],
      });
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      const [comments]: [PostComments[], number] =
        await entityManager.findAndCount(PostComments, {
          where: { postId },
          skip: from,
          take: to,
        });
      // finding the relevant user belongs to the comment

      comments.forEach(async comment => {
        const user = await entityManager.findOne(User, {
          where: { id: comment.userId },
          select: [
            "id",
            "firstname",
            "lastname",
            "avatarUrl",
            "userRole",
            "isSpecialUser",
            "isVerified",
          ],
        });
        postComments.push({
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          avatarUrl: user.avatarUrl,
          userRole: user.userRole,
          isSpecialUser: user.isSpecialUser,
          isVerified: user.isVerified,
          commentId: comment.id,
          commentContent: comment.content,
          commentLikes: comment.commentLikes,
          createdAt: comment.createdAt,
        });
      });
    });
    return { data: postComments };
  }

  async findUserLikesOnPost(
    user: JwtAuthGuardTrueType,
    from: number,
    to: number,
  ) {
    const postLikes = await this.entityManager.find(PostCommentLike, {
      where: { userId: user.userId, targetType: PostLikeTargetEnum.POST },
      skip: from,
      take: to,
      order: { createdAt: "DESC" },
      relations: ["post"],
      select: ["id", "likeType", "createdAt", "postId", "post"],
    });
    console.log({ postLikes });
    return postLikes;
  }

  async findAllPostLikes(postId: string, from: number, to: number) {
    const postLikes: postCommentLikesResponseDataType[] = [];

    await this.entityManager.transaction(async entityManager => {
      const post = await entityManager.findOne(Post, {
        where: {
          id: postId,
        },
        select: ["id"],
      });
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      const [likes]: [PostCommentLike[], number] =
        await entityManager.findAndCount(PostCommentLike, {
          where: { postId },
          skip: from,
          take: to,
        });
      // finding the relevant user belongs to the comment

      likes.forEach(async like => {
        const user = await entityManager.findOne(User, {
          where: { id: like.userId },
          select: [
            "id",
            "firstname",
            "lastname",
            "avatarUrl",
            "userRole",
            "isSpecialUser",
            "isVerified",
          ],
        });
        postLikes.push({
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          avatarUrl: user.avatarUrl,
          userRole: user.userRole,
          isSpecialUser: user.isSpecialUser,
          isVerified: user.isVerified,
          likeId: like.id,
          likeType: like.likeType,
          createdAt: like.createdAt,
        });
      });
    });
    return { data: postLikes };
  }
  async findAllCommentLikes(commentId: string, from: number, to: number) {
    const commentLikes: postCommentLikesResponseDataType[] = [];

    await this.entityManager.transaction(async entityManager => {
      const comment = await entityManager.findOne(PostComments, {
        where: {
          id: commentId,
        },
      });
      if (!comment) {
        throw new NotFoundException("Comment not found!");
      }
      const [likes]: [PostCommentLike[], number] =
        await entityManager.findAndCount(PostCommentLike, {
          where: { commentId },
          skip: from,
          take: to,
        });
      // finding the relevant user belongs to the comment
      likes.forEach(async like => {
        const user = await entityManager.findOne(User, {
          where: { id: like.userId },
          select: [
            "id",
            "firstname",
            "lastname",
            "avatarUrl",
            "userRole",
            "isSpecialUser",
            "isVerified",
          ],
        });
        commentLikes.push({
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          avatarUrl: user.avatarUrl,
          userRole: user.userRole,
          isSpecialUser: user.isSpecialUser,
          isVerified: user.isVerified,
          likeId: like.id,
          likeType: like.likeType,
          createdAt: like.createdAt,
        });
      });
    });
    return { data: commentLikes };
  }

  async findOnePost(postId: string) {
    const post = await this.entityManager
      .createQueryBuilder(Post, "post")
      .select(["post.id", "post.textContent", "post.createdAt", "post.postBy"])
      .groupBy("post.id")
      .addGroupBy("post.textContent")
      .addGroupBy("post.createdAt")
      .addGroupBy("post.postBy")

      // getting post media details
      .leftJoin("post.postMedias", "postMedias")
      .addSelect(["postMedias.url", "postMedias.mimeType", "postMedias.id"])
      .addGroupBy("postMedias.url")
      .addGroupBy("postMedias.mimeType")
      .addGroupBy("postMedias.id")

      // getting post likes count
      .leftJoin("post.postLikes", "postLikes")
      .addSelect("COUNT(postLikes.id)", "likesCount")

      // getting post comments count
      .leftJoin("post.postComments", "postComments")
      .addSelect("COUNT(postComments.id)", "commentsCount")

      // getting creator user details
      .leftJoin("post.creatorUser", "cu")
      .leftJoin("cu.user", "creatorUser")
      .addSelect(["creatorUser.firstname", "creatorUser.lastname", "creatorUser.avatarUrl"])
      .addGroupBy("creatorUser.firstname")
      .addGroupBy("creatorUser.lastname")
      .addGroupBy("creatorUser.avatarUrl")

      // getting admin user details
      .leftJoin("post.adminUser", "au")
      .leftJoin("au.user", "adminUser")
      .addSelect(["adminUser.firstname", "adminUser.lastname", "adminUser.avatarUrl"])
      .addGroupBy("adminUser.firstname")
      .addGroupBy("adminUser.lastname")
      .addGroupBy("adminUser.avatarUrl")

      // getting latest comment user name
      .leftJoin("postComments.user", "lastCommentUser")
      .addSelect(["lastCommentUser.firstname", "lastCommentUser.lastname"])
      .addGroupBy("lastCommentUser.firstname")
      .addGroupBy("lastCommentUser.lastname")

      // getting last like user name
      .leftJoin("postLikes.user", "lastLikeUser")
      .addSelect(["lastLikeUser.firstname", "lastLikeUser.lastname"])
      .addGroupBy("lastLikeUser.firstname")
      .addGroupBy("lastLikeUser.lastname")

      .where("post.id = :postId", { postId })
      .getRawOne();

    if (!post) {
      throw new NotFoundException("Post not found!");
    }
    

    return prefixSplitNestingObject(post);
    
  }
  async updatePostContent(updatePost: UpdatePostContentDto) {
    await this.entityManager.transaction(async entityManager => {
      const post = await entityManager.findOne(Post, {
        where: { id: updatePost.postId },
        select: ["id", "textContent"],
      });
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      post.textContent = updatePost.content;
      await this.entityManager.save(post);
    });
    return { message: "post updated successfully!" };
  }
  async updatePostCommentContent(updateComment: updatePostCommentContentDto) {
    await this.entityManager.transaction(async entityManager => {
      const comment = await entityManager.findOne(PostComments, {
        where: { id: updateComment.commentId },
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
      Bucket: this.configService.getOrThrow("AWS_S3_BUCKET_NAME"),
      Key: key,
    });
    return await getSignedUrl(s3Client, command);
  }
}
