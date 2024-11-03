import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { setupSwagger } from "libs/shared/src/config/swagger";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // app.useGlobalFilters(new AllExceptionFilter());
  app.use(helmet())
  app.setGlobalPrefix('api');
  setupSwagger(app);  
  await app.listen(3000,);

  // for hot module replacement
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

}
bootstrap();












// async function bootstrap() {
//   const app = await NestFactory.create(AppModule,{
//     logger: ['error','warn','log','debug','verbose'],
//     bufferLogs: true
//   });
//   app.useLogger(app.get(MyLoggerService))  // setting up custom logger by bufferLogs: true
  
//   const {httpAdapter} = app.get(HttpAdapterHost)
//   app.useGlobalFilters(new AllExceptionFilter(httpAdapter))
//   app.setGlobalPrefix("api")
//   // app.enableCors()

//   const config = new DocumentBuilder()
//   .setTitle('Alwahid')
//   .setDescription('Alwahid API description')
//   .setVersion('1.0')
//   .addTag('alwahid')
//   .build();
//   const document = SwaggerModule.createDocument(app,config);
//   SwaggerModule.setup('docs',app,document);
  
  
//   await app.listen(3333);
// }
// bootstrap();
