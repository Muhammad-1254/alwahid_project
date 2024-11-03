import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";
import { RedisCacheService } from "../services/redis-cache.service";

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        if(process.env.NODE_ENV === "development"){
          return {
            store:await redisStore({
            url:await configService.getOrThrow("REDIS_URI")
            })
          }
         
        }else{
          return {
            store:await redisStore({
              password:await configService.getOrThrow("REDIS_PASS"),
              socket:{
                host:await configService.getOrThrow("REDIS_HOST"),
                port:await configService.getOrThrow("REDIS_PORT")
              }
            })
          }
        }
      },
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
