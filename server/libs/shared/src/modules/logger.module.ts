import { Module } from '@nestjs/common';
import { MyLoggerService } from '../services/logger.service';

@Module({
  providers: [MyLoggerService],
  exports:[MyLoggerService]
})
export class MyLoggerModule {}
