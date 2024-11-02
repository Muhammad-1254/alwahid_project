import { NestFactory } from "@nestjs/core"
import { ConfigService } from "@nestjs/config"
import { SharedService } from "@app/shared"
import { NotificationModule } from "./notification.module"

declare const module: any
async function bootstrap() {
    const app = await NestFactory.create(NotificationModule)

    const configService = app.get(ConfigService)
    const sharedService = app.get(SharedService)
    const queue = configService.getOrThrow('RABBITMQ_QUEUE_NAME_NOTIFICATION')

    app.connectMicroservice(sharedService.getRmqOptions(queue))
    app.startAllMicroservices();
    await app.listen(3002)
      // for hot module replacement
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

}

bootstrap()