// src/exceptions/custom-rpc-exceptions.ts
import { RpcException } from "@nestjs/microservices";
import { MyLoggerService } from "../services/logger.service";

export class CustomRpcExceptions {
  public static BadRequestException(message?: string) {
    return new RpcException({
      statusCode: 400,
      message: message ?? "Bad Request",
      timestamp: new Date().toISOString(),
    });
  }

  public static UnauthorizedException(message?: string) {
    return new RpcException({
      statusCode: 401,
      message: message ?? "Unauthorized",
      timestamp: new Date().toISOString(),
    });
  }

  public static NotFoundException(message?: string) {
    return new RpcException({
      statusCode: 404,
      message: message ?? "Not Found",
      timestamp: new Date().toISOString(),
    });
  }
  public static InternalException(message?: string) {
    return new RpcException({
      statusCode: 500,
      message: message ?? "Internal Server Error",
      timestamp: new Date().toISOString(),
    });
  }
}
