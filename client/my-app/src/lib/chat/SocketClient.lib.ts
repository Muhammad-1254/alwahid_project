import { apiChatRoutes } from "@/src/constants/apiRoutes";
import io, { Socket } from "socket.io-client";
import { getTokenFromStorage } from "../utils";
import {
  MessageEventEnums,
  MessageSubscriptionsEnum,
} from "./message-sub-events.lib";
import { updateJwtToken } from "./chat.utils.lib";

class SocketClient {
  private static instance: SocketClient | null = null;
  private socket: Socket | null = null;

  private constructor() {}

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  // Connect to the server
  public async connect(url: string, _accessToken?: string): Promise<void> {
    let accessToken: string;
    if (_accessToken) {
      accessToken = _accessToken;
    } else {
      accessToken = (await getTokenFromStorage()).accessToken;
    }
    if (!this.socket || !this.socket.connected) {
      this.socket = io(url, {
        transports: ["websocket"],
        extraHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      this.socket.on("connect", () => {
        console.log("socket connected");
      });
      this.socket.on(MessageEventEnums.TOKEN_UNAUTHORIZED,async (data) => {
        console.log("unauthorized, data:", data);
        const {accessToken} = await updateJwtToken();
        console.log("getting new token :",accessToken)
        this.connect(apiChatRoutes.wsUrl, accessToken);
      });
      this.socket.on("disconnect", () => {
        console.log("socket disconnected");
      });
    }
  }

  // check if socket is connected
  public isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }

  // Emit an event with data
  public emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // listen to an event
  public on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default SocketClient;
