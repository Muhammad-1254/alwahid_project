import {  Controller,  Get,  Post } from "@nestjs/common";
import { DatabaseService } from "./database.service";


@Controller("mix")
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}


  @Post("upload/all/country-code")
  createCountryCode() {
    return this.databaseService.uploadCountryCodeToDb();
  }
  @Get("get/all/country-code")
    getAllCountryCode() {
        return this.databaseService.getAllCountryCode();
    }


}