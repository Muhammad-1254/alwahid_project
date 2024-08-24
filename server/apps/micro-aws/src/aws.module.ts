import {  SharedModule } from "@app/shared";
import { Module } from "@nestjs/common";
import { AwsService } from "./aws.service";
import { AwsController } from "./aws.controller";


@Module({
    imports:[
        SharedModule,
    ],
    controllers:[AwsController],
    providers:[AwsService],

})

export class AwsModule {}