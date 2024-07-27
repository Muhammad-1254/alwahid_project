import { User } from "src/user/entities/user.entity";

export const userDataResponse = (user:User)=>{
return{
    userId:user.id,
    email:user.email,
    firstname:user.firstname,
    lastname:user.lastname,
    avatar:user.avatar_url,
    age:user.age,
    phoneNumber:user.phone_number,
    gender:user.gender,
    role:user.user_role,
    dob:user.date_of_birth,
    authProvider:user.auth_provider,
    isVerified:user.is_verified,
    isSpecialUser:user.is_special_user,
}
}