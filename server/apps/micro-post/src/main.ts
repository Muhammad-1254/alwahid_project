import { NestFactory } from "@nestjs/core"
import { ConfigService } from "@nestjs/config"
import { SharedService } from "@app/shared"
import { PostModule } from "./post.module"


async function bootstrap() {
    const app = await NestFactory.create(PostModule)

    const configService = app.get(ConfigService)
    const sharedService = app.get(SharedService)
    const queue = configService.getOrThrow('RABBITMQ_QUEUE_NAME_POST')

    app.connectMicroservice(sharedService.getRmqOptions(queue))
    app.startAllMicroservices();

}

bootstrap()