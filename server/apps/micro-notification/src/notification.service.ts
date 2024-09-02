import { Injectable } from "@nestjs/common";
import axios from "axios";


@Injectable()
export class NotificationService{
    private readonly notificationEndpoint = ''

    async sendPushNotification(expoPushToken:string,message:string){
        const payload = {
            to: expoPushToken,
            sound: 'default',
            body: message,
            data: { someData: 'goes here' },
        }
        try {
            const res = await axios.post(this.notificationEndpoint,payload,{
                headers:{
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log("Notification sent successfully",res.data)

        } catch (error) {
            console.error("Error sending notification",error)
            
        }
    }
}