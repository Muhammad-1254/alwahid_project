import { Inject, Injectable } from "@nestjs/common";
import { SharedServiceInterface } from "../interfaces/shared.service.interface";
import { ConfigService } from "@nestjs/config";
import { RmqContext, RmqOptions, Transport } from "@nestjs/microservices";


@Injectable()
export class SharedService implements SharedServiceInterface{
 
    constructor(
        private readonly configService: ConfigService,
    ){}
    
    getRmqOptions(queueName: string): RmqOptions {
        const RABBITMQ_USER = this.configService.getOrThrow("RABBITMQ_USER");
        const RABBITMQ_PASS = this.configService.getOrThrow("RABBITMQ_PASS");
        const RABBITMQ_HOST = this.configService.getOrThrow("RABBITMQ_HOST");

        const developmentUrl = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@localhost:5672`
        const productionUrl = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}`
        const url =process.env.NODE_ENV ==='development'?developmentUrl:productionUrl
        
        return {
            transport:Transport.RMQ,
            options:{
                urls: [url],
                noAck:false,
                queue:queueName,
                queueOptions:{
                    durable:true
                }
            }
        }
        
    }
    acknowledgeMessage(context: RmqContext): void {
        const channel = context.getChannelRef();
        const message = context.getMessage();
        channel.ack(message)
    }
}