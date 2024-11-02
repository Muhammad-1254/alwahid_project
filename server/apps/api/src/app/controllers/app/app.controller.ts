import { Body, Controller, Get, Inject, Param, Post, UseInterceptors } from "@nestjs/common";
import { AppService } from "../../app.service";
import { ApiTags } from "@nestjs/swagger";
import { ClientProxy } from "@nestjs/microservices";



@ApiTags('Root (App)')
@Controller()
export class AppController {
    
  constructor(private readonly appService: AppService,
    @Inject('USER_SERVICE')
     private readonly userService: ClientProxy
    ) {}

  @Get()
  getHello(): string {
    return "hello api 123 ";
  }



}
