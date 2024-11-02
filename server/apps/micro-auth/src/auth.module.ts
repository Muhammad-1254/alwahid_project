import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import {  MicroservicesNames, SharedModule } from "@app/shared";


@Module({
  imports: [
    SharedModule.registerRMQ(MicroservicesNames.USER_SERVICE, process.env.RABBITMQ_QUEUE_NAME_USER),

    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: `${process.env.JWT_TOKEN_EXPIRY}` },
      verifyOptions: { ignoreExpiration: false },
    }),
  
 SharedModule,
   
    
  ],
  controllers: [AuthController],
  providers: [AuthService,],
})
export class AuthModule {}
