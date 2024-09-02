import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { SharedService } from '@app/shared';

import { ChatModule } from './chat.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.create(ChatModule)

  
  const configService = app.get(ConfigService)
  const sharedService = app.get(SharedService)
  const queue = configService.getOrThrow('RABBITMQ_QUEUE_NAME_CHAT')

  app.connectMicroservice(sharedService.getRmqOptions(queue))
  app.startAllMicroservices();
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }));

  await app.listen(3001);
}
bootstrap();
