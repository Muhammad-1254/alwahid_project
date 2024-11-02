import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    let pubClient;
    if (process.env.NODE_ENV === "development") {
      pubClient = createClient({
        url: "redis://default:password@localhost:6379",
      });
    } else {
      pubClient = createClient({
        password: process.env.REDIS_PASS,
        socket:{
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
        }
      });
    }

    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
