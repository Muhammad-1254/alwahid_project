import { User,AdminUser,CreatorUser,NormalUser,UserBlockAssociation,UserFollowingAssociation,UserSavedPostsAssociation } from "./micro-user.entities"
import {Post,PostCommentLike,PostComments,PostMedia} from "./micro-post.entities"
import {Location} from "./micro-location.entities"
import {Hashtag,HashtagPostAssociation} from "./micro-hashtag.entities"
import {CountryCode} from './country-code.entity'


const  SharedEntities = [
    User,AdminUser,CreatorUser,NormalUser,UserBlockAssociation,UserFollowingAssociation,UserSavedPostsAssociation,
    Post,PostCommentLike,PostComments,PostMedia,
    Location,
    Hashtag, HashtagPostAssociation,
    CountryCode
]
export default SharedEntities



export { User,AdminUser,CreatorUser,NormalUser,UserBlockAssociation,UserFollowingAssociation,UserSavedPostsAssociation } from "./micro-user.entities"
export {Post,PostCommentLike,PostComments,PostMedia} from "./micro-post.entities"
export {Location} from "./micro-location.entities"
export {Hashtag,HashtagPostAssociation} from "./micro-hashtag.entities"
export {CountryCode} from './country-code.entity'


