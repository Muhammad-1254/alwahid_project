import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
      scope: ["email", "profile"],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done:VerifyCallback
  ):Promise<any> {
    const {name,emails,photos} = profile
    const user = {
      email:emails[0].value,
      firstname:name.givenName,
      lastname:name.familyName,
      picture:photos[0].value,
      accessToken
    }
    done(null,user)
  }
}
