import { NestFactory } from "@nestjs/core"
import { ConfigService } from "@nestjs/config"
import { AwsModule } from "./aws.module"
import { SharedService } from "@app/shared"


async function bootstrap() {
    const app = await NestFactory.create(AwsModule)

    const configService = app.get(ConfigService)
    const sharedService = app.get(SharedService)
    const queue = configService.getOrThrow('RABBITMQ_QUEUE_NAME_AWS')

    app.connectMicroservice(sharedService.getRmqOptions(queue))
    app.startAllMicroservices();

}

bootstrap()