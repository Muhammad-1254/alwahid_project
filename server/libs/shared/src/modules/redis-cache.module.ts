import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";
import { RedisCacheService } from "../services/redis-cache.service";
import { RedisClientOptions } from "redis";

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const REDIS_URL =await configService.getOrThrow("REDIS_URL");
      
        return {
          store:await redisStore({
            socket:{
              host:"localhost",
              port:6379
            }
          })
        }
      },
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
