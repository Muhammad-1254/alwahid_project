

export enum MessageSubscriptionsEnum{
    MESSAGE_SEND='message_send',
    MESSAGE_TYPING='message_typing',
    MESSAGE_SEEN='message_seen',
    MESSAGE_DELIVERED='message_delivered',
}


export enum MessageEventEnums{
    CONNECTED='connected',
    DISCONNECTED='disconnect',
    MESSAGE_GET='message_get',
    MESSAGE_TYPING='message_typing',
    MESSAGE_SEEN='message_seen',
    MESSAGE_UPLOAD='message_upload',
    MESSAGE_DELIVERED='message_delivered',
    TOKEN_UNAUTHORIZED='token_unauthorized',
    ERROR='error',
}

export enum MessageStatusEnum{
    CONNECTED='connected',    
    DISCONNECTED='disconnected',
      
    OK=200,
   
    ERROR='error',
    BAD_REQUEST=400,
    UNAUTHORIZED=401,


}