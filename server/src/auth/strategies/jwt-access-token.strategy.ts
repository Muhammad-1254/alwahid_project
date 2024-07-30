import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export class JwtAccessTokenStrategy extends PassportStrategy(Strategy,"jwt-access-token"){
    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: `${process.env.JWT_SECRET}`
        })}
    async validate(payload: any){
        console.log("JWT Access Token Strategy")
        console.log({payload})
        return { username: payload.username, userId:payload.sub.userId, userRole:payload.sub.userRole };
    }
}