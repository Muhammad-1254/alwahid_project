import { NestFactory, HttpAdapterHost } from "@nestjs/core";
import { AppModule } from "./app.module";
import {  DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { MyLoggerService } from "./my-logger/my-logger.service";
import { AllExceptionFilter } from "./all-exceptions.filter";


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    // logger: ['error','warn','log','debug','verbose']
    bufferLogs: true
  });
  app.useLogger(app.get(MyLoggerService))  // setting up custom logger by bufferLogs: true
  
  const {httpAdapter} = app.get(HttpAdapterHost)
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter))
  app.setGlobalPrefix("api")
  // app.enableCors()

  const config = new DocumentBuilder()
  .setTitle('Alwahid')
  .setDescription('Alwahid API description')
  .setVersion('1.0')
  .addTag('alwahid')
  .build();
  const document = SwaggerModule.createDocument(app,config);
  SwaggerModule.setup('docs',app,document);
  
  
  await app.listen(3000);
}
bootstrap();
