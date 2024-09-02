import { apiChatRoutes } from '@/src/constants/apiRoutes';
import io, {type Socket } from 'socket.io-client';

class ChatSocket {
    static instance: Socket;
    private constructor() {
        if(!ChatSocket.instance){
            ChatSocket.instance = io(apiChatRoutes.wsUrl);
        }
    }
    static getInstance() {
      return ChatSocket.instance;
    }
}


export default ChatSocket;