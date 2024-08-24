import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      // imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.getOrThrow("DATABASE_URL_UNPOOLED"),
        // entities: [
        //   join(__dirname, 'apps','**','entities', '*.entity.{ts,js}'),
        //   join(__dirname, 'libs/shared/entities', '*.entity.{ts,js}'),
        // ],
        migrations: [join(__dirname, "libs/shared/migrations/*{.ts,.js}")],
        // logging: false,
        autoLoadEntities: true,
        synchronize: false,
      }),
    }), 
  ],



})
export class DatabaseModule {}
