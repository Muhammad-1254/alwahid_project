import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { readFileSync } from "fs";

import { PostService } from "src/post/post.service";
import { EntityManager } from "typeorm";
import { CountryCode } from "./mix-entities/country-code.entity";

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(CountryCode)
    private readonly countryCodeEM: EntityManager,
    private readonly postService: PostService,
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
        const s3Client = await this.postService.getS3Client();
        const key = `country_flags/${item.iso}__${item.code}.png`;
        const url = await this.postService.generatePresignedUrl(
          key,
          s3Client,
          60 * 60 * 24 * 6,
        );

        const countryCode = new CountryCode();
        countryCode.countryName = item.name;
        countryCode.countryCode = item.code;
        countryCode.isoCode = item.iso;
        countryCode.flagUrl = url;
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
