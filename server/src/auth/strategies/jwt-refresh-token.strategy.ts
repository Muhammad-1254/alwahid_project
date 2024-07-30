import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy,"jwt-refresh-token"){
    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            ignoreExpiration: false,
            secretOrKey: `${process.env.JWT_SECRET}`
        })}
    async validate(payload: any){
        console.log({payload})
        return { user: payload.sub, username: payload.username }
    }
}