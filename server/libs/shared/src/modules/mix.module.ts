import { Module } from "@nestjs/common";
import { MixController } from "../controllers/mix.controller";
import { CountryCodeService } from "../services/country-code.service";


@Module({
    
    controllers: [MixController],
    providers: [CountryCodeService],

})
export class MixModule {}