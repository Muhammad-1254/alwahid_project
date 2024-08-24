import { DynamicModule, Inject, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SharedService } from "../services/shared.service";
import { ClientProxyFactory, Transport } from "@nestjs/microservices";
import { JwtModule } from "@nestjs/jwt";


@Module({
imports:[
    ConfigModule.forRoot({ isGlobal: true,envFilePath:'.env' }),

],
providers:[SharedService, ],
exports: [SharedService,  ]
})
export class SharedModule{
    static registerRMQ(service:string, queueName:string):DynamicModule{
        const providers = [
            {
                provide:service,
                useFactory:async (configService: ConfigService)=>{
                    const RABBITMQ_USER = await configService.getOrThrow("RABBITMQ_USER");
                    const RABBITMQ_PASS = await configService.getOrThrow("RABBITMQ_PASS");
                    // const RABBITMQ_HOST =await configService.getOrThrow("RABBITMQ_HOST");
        const RABBITMQ_HOST = "localhost:5672";
                
                    return ClientProxyFactory.create({
                        transport:Transport.RMQ,
                        options:{
                            urls:[`amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}`],
                            queue:queueName,
                            queueOptions:{
                                durable:true
                            }
                        }
                    })
                },
                inject:[ConfigService]
            }
        ];
        return {
            module: SharedModule,
            providers,
            exports:[...providers]

        }
    }
}