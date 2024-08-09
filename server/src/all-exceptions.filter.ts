import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { MyLoggerService } from "./my-logger/my-logger.service";
import { Request, Response } from "express";
import { QueryFailedError } from "typeorm";



type MyResponseObject = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new MyLoggerService(AllExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getResponse<Request>();

    const myResponseObject: MyResponseObject = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: "",
    };
    if (exception instanceof HttpException) {
      myResponseObject.statusCode = exception.getStatus();
      myResponseObject.response = exception.getResponse();

    }else if(exception instanceof QueryFailedError){
      if (exception.message.includes('duplicate key value violates unique constraint')) {
        myResponseObject.statusCode = HttpStatus.CONFLICT;
        myResponseObject.response = 'Duplicate entry detected';
      } else {
        myResponseObject.response = 'Database Error';
      }
    }
    else if (exception instanceof Error) {
      myResponseObject.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObject.response = exception.message;
    } else {
      myResponseObject.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObject.response = "Internal Server Error";
    }
    response.status(myResponseObject.statusCode).json(myResponseObject);
    this.logger.error(myResponseObject.response, AllExceptionFilter.name);
    super.catch(exception, host);
  }
}

