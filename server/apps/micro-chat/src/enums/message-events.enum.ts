

export enum MessageSubscriptionsEnum{
    CREATE_CHAT='create_chat',
    MESSAGE_SEND='message_send',
    MESSAGE_TYPING='message_typing',
    MESSAGE_SEEN='message_seen',
    MESSAGE_DELIVERED='message_delivered',
}


export enum MessageEventEnums{
    CONNECTED='connected',
    DISCONNECTED='disconnect',
    CREATE_CHAT='create_chat',
    MESSAGE_GET='message_get',
    MESSAGE_TYPING='message_typing',
    MESSAGE_SEEN='message_seen',
    MESSAGE_DELIVERED='message_delivered',
    MESSAGE_UPLOAD='message_upload',
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