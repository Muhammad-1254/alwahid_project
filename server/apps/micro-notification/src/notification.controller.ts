import { Controller } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { SharedService } from "@app/shared";
import { Ctx, MessagePattern, RmqContext } from "@nestjs/microservices";


@Controller()
export class NotificationController{
    constructor(
        private readonly notificationService: NotificationService,
        private readonly sharedService: SharedService
    ){}

    @MessagePattern({ cmd: 'sendPushNotification' })
    async sendPushNotification(
    
        @Ctx() context: RmqContext,
        data: { expoPushToken: string, message: string }
    ) {
        this.sharedService.acknowledgeMessage(context)
        return this.notificationService.sendPushNotification(data.expoPushToken, data.message)
    }
}