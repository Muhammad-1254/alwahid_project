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
import { UserRoleEnum } from "src/lib/types/user";
import {
  commentsResponseDataType,
  postCommentLikesResponseDataType,
  PostMediaEnum,
} from "src/lib/types/post";
import { PostCommentLike } from "./entities/post-comment-like.entity";
@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly entityManager: EntityManager,
  ) {}

  async createPost(createPostDto: CreatePostDto) {
    if (!createPostDto.admin_user_id && !createPostDto.creator_user_id) {
      throw new Error("User id is required!");
    }
    if (createPostDto.postMedias.length < 1 && !createPostDto.text_content) {
      throw new Error("Data is required for Post i.e media or text!");
    }
    await this.entityManager.transaction(async entityManager => {
      // checking if user is exist and valid or not
      const user = await entityManager.findOne(User, {
        where: [
          { id: createPostDto.creator_user_id },
          { id: createPostDto.admin_user_id },
        ],
        select: ["user_role"],
      });
      if (!user) {
        // checking if user is exist or not
        throw new NotFoundException("User not found!");
      }
      if (
        user.user_role !== UserRoleEnum.ADMIN &&
        user.user_role !== UserRoleEnum.CREATOR
      ) {
        // checking user role
        throw new ForbiddenException("Invalid user role!");
      }

      const post_id = uuid();
      const post = new Post({
        id: post_id,
        text_content: createPostDto.text_content,
        post_by: createPostDto.post_by,
        creator_user_id: createPostDto.creator_user_id,
        admin_user_id: createPostDto.admin_user_id,
      });
      const postMedia: PostMedia[] = createPostDto.postMedias.map(media => {
        if (
          media.post_type !== PostMediaEnum.IMAGE &&
          media.post_type !== PostMediaEnum.VIDEO
        ) {
          throw new UnsupportedMediaTypeException("Invalid media type!");
        }
        const postMedia = new PostMedia({
          ...media,
          id: uuid(),
          post_id,
        });
        return postMedia;
      });

      await entityManager.save(post);
      if (postMedia.length > 0) {
        await entityManager.save(postMedia);
      }
    });
    return{message:"post created successfully!"}
  }
  async createPostMedia(createMedia: CreatePostMediaDto) {
    const postMedia: PostMedia[] = [];
    await this.entityManager.transaction(async entityManager => {
      // first check if post is exist or not
      const post = await entityManager.findOne(Post, {
        where: { id: createMedia.post_id },
        select: ["id"],
      });
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      createMedia.postMedias.forEach(media => {
        if (
          media.post_type !== PostMediaEnum.IMAGE &&
          media.post_type !== PostMediaEnum.VIDEO
        ) {
          throw new UnsupportedMediaTypeException("Invalid media type!");
        }
        const postMedia_ = new PostMedia({
          ...media,
          id: uuid(),
          post_id: createMedia.post_id,
        })
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
          where: { id: createPostDto.user_id },
          select: ["id"],
        }),
        await entityManager.findOne(Post, {
          where: { id: createPostDto.post_id },
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
        user_id: createPostDto.user_id,
        post_id: createPostDto.post_id,
      });
      await this.entityManager.save(postComment);
    });

    return { message: "comment created successfully!", data: postComment };
  }
  async createPostOrCommentLike(createLike: createPostOrCommentLikeDto) {
    
    if (!createLike.post_id && !createLike.comment_id) {
      // checking if post id or comment id is exist or not
      throw new Error("Post id or comment id is required!");
    }
    await this.entityManager.transaction(async entityManager => {
      // checking of user already liked the post or comment
      const likes = await entityManager.find(PostCommentLike,{
        where:{user_id:createLike.user_id}
      })
      const isLiked = likes.find(like=>like.post_id === createLike.post_id || like.comment_id === createLike.comment_id)
      if(isLiked){
        // dislike now
        isLiked.like_type = createLike.like_type
        await entityManager.save(isLiked)
        return {message:"like updated successfully!"}
      }
      //checking if user is exist or not
      const [user, postOrComment] = await Promise.all([
        await entityManager.findOne(User, {
          where: { id: createLike.user_id },
          select: ["id"],
        }),
        createLike.post_id
          ? await entityManager.findOne(Post, {
              where: { id: createLike.post_id },
              select: ["id",'admin_user_id', "admin_user_id"],
            })
          : await entityManager.findOne(PostComments, {
              where: { id: createLike.comment_id },
              select: ["id","user_id"],
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
}
