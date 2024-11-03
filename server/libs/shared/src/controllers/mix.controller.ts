import {  Controller,  Get,  Post } from "@nestjs/common";
import { CountryCodeService } from "../services/country-code.service";


@Controller("mix")
export class MixController {
  constructor(private readonly countryCodeService: CountryCodeService) {}


  @Post("upload/all/country-code")
  createCountryCode() {
    return this.countryCodeService.uploadCountryCodeToDb();
  }
  @Get("get/all/country-code")
    getAllCountryCode() {
        return this.countryCodeService.getAllCountryCode();
    }


}