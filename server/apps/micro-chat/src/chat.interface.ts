import { JwtAuthGuardTrueType } from "@app/shared";
import { Socket } from "socket.io";


export interface AuthenticatedSocket extends Socket {
    data:{
        user:JwtAuthGuardTrueType
    }
}