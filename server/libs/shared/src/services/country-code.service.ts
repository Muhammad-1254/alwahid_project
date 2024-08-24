import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { readFileSync } from "fs";

import { EntityManager } from "typeorm";
import { CountryCode } from "../entities/country-code.entity";

@Injectable()
export class CountryCodeService {
  constructor(
    @InjectRepository(CountryCode)
    private readonly countryCodeEM: EntityManager,
  ) {}

  async uploadCountryCodeToDb() {
    try {
      const filePath = "D:/Usman/extras/apps/alwahid/server/country_codes.json";
      console.log({ filePath });
      const fileContent = readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContent);

      if (!Array.isArray(data)) throw new Error("Invalid format data");
      const entities: CountryCode[] = [];
      for (let i = 0; i < data.length; i++) {
        const item: { name: string; code: string; iso: string } = data[i];

        // create url of each image
        const key = `country_flags/${item.iso}__${item.code}.png`;

        const countryCode = new CountryCode();
        countryCode.countryName = item.name;
        countryCode.countryCode = item.code;
        countryCode.isoCode = item.iso;
        countryCode.flagUrl = key;
        entities.push(countryCode);
      }
      await this.countryCodeEM.save(entities);
    } catch (error) {
      console.log(error);
    }
  }

  async getAllCountryCode(){
    return this.countryCodeEM.find(CountryCode)
  }
}
