import { Controller } from "@nestjs/common";
import { AwsService } from "./aws.service";
import { Ctx, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { SharedService } from "@app/shared";
import { GeneratePutPresignedUrlPayloadType } from "./types/aws-payload.types";

@Controller()
export class AwsController{
constructor(
    private readonly awsService: AwsService,
    private readonly sharedService: SharedService,
){}

@MessagePattern({cmd:"getCloudFrontSignedUrl"})
async getCloudFrontSignedUrl(
    @Ctx() context:RmqContext,
    @Payload() data: {urlKey:string}
){
    this.sharedService.acknowledgeMessage(context)
    return this.awsService.getCloudFrontSignedUrl(data.urlKey)

}

@MessagePattern({cmd:"generatePutPresignedUrl"})
async generatePutPresignedUrl(
    @Ctx() context:RmqContext,
    @Payload() data: GeneratePutPresignedUrlPayloadType
){
    this.sharedService.acknowledgeMessage(context)
    return this.awsService.generatePutPresignedUrl(data)

}
@MessagePattern({cmd:"deleteObjectFromS3"})
async deleteObjectFromS3(
    @Ctx() context:RmqContext,
    @Payload() data: {url:string}
){
    this.sharedService.acknowledgeMessage(context)
    const deleteRes =await this.awsService.deleteObjectFromS3(data.url)
    const invalidateCloudfrontRes =await this.awsService.invalidateCloudfrontCache(data.url)
    return {deleteRes,invalidateCloudfrontRes}
}
    
    


 
    

}