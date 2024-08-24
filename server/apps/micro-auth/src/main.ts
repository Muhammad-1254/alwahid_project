import { NestFactory } from "@nestjs/core"
import { ConfigService } from "@nestjs/config"
import { SharedService } from "@app/shared"
import { AuthModule } from "./auth.module"


async function bootstrap() {
    const app = await NestFactory.create(AuthModule)

    const configService = app.get(ConfigService)
    const sharedService = app.get(SharedService)
    const queue = configService.getOrThrow('RABBITMQ_QUEUE_NAME_AUTH')

    app.connectMicroservice(sharedService.getRmqOptions(queue))
    app.startAllMicroservices();

}

bootstrap()