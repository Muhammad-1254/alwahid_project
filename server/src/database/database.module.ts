import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";



@Module({
    imports:[TypeOrmModule.forRootAsync({
        useFactory:(configService: ConfigService)=>({
            type:"postgres",
            url:configService.getOrThrow('DATABASE_URL'),
            autoLoadEntities:true,
            synchronize:true,
        }),
        inject:[ConfigService]
    })]
})

export class DatabaseModule {}