import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { SharedModule, SharedService } from '@app/shared';

import { ChatModule } from './chat.module';
import { ValidationPipe } from '@nestjs/common';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { Transport } from '@nestjs/microservices';

declare const module: any;

async function bootstrap() {

  const app = await NestFactory.create(ChatModule)

  // app.useGlobalPipes(new ValidationPipe({ transform: true }))

  const configService = app.get(ConfigService)
  const sharedService = app.get(SharedService)
  
  const redisIoAdapter = new RedisIoAdapter(app)
  await redisIoAdapter.connectToRedis()
  app.useWebSocketAdapter(redisIoAdapter)

  const queue = configService.getOrThrow('RABBITMQ_QUEUE_NAME_CHAT')

  app.connectMicroservice(sharedService.getRmqOptions(queue))
  app.startAllMicroservices();
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }));

<<<<<<< HEAD
  await app.listen(3001,);


  // for hot module replacement
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
=======
  await app.listen(3001);
>>>>>>> c995c571a3519d912561c070168b458e66627329
}
bootstrap();
