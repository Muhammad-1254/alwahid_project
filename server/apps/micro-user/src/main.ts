import { NestFactory } from "@nestjs/core"
import { UserModule } from "./user.module"
import { ConfigService } from "@nestjs/config"
import { SharedService } from "@app/shared"

declare const module: any
async function bootstrap() {
    const app = await NestFactory.create(UserModule)

    const configService = app.get(ConfigService)
    const sharedService = app.get(SharedService)
    const queue = configService.getOrThrow('RABBITMQ_QUEUE_NAME_USER')

    app.connectMicroservice(sharedService.getRmqOptions(queue))
    app.startAllMicroservices();

    
      // for hot module replacement
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

}

bootstrap()