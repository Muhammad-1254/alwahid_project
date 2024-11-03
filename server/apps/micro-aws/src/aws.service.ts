import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {  DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSignedUrl as getSignedUrlCloudfront } from "@aws-sdk/cloudfront-signer";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { GeneratePutPresignedUrlPayloadType } from "./types/aws-payload.types";


@Injectable()
export class AwsService {

  constructor(
    private readonly configService: ConfigService) {}
  
  
    getS3Client() {
    const s3Client = new S3Client({
      region: this.configService.get("AWS_S3_REGION")||"eu-north-1",
      credentials: {
        accessKeyId: this.configService.get("AWS_S3_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_S3_SECRET_ACCESS_KEY"),
      },
    });
    return s3Client;
  }
  getCloudFrontClient() {
    return new CloudFrontClient({
      region: this.configService.get("AWS_CLOUDFRONT_REGION")||"eu-north-1",
      credentials:{
        accessKeyId: this.configService.get("AWS_S3_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_S3_SECRET_ACCESS_KEY"),
      }
    })
  }

  async generatePutPresignedUrl(
  data_:GeneratePutPresignedUrlPayloadType
  ) {
    const {contentType,urlKey,expiresIn} =data_
    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow("AWS_S3_BUCKET_NAME"),
      Key: urlKey,
      ContentType:contentType,
    });
    const url  =await getSignedUrl(this.getS3Client(), command, { expiresIn:expiresIn??1200 });
    return url
  }
  getCloudFrontSignedUrl(key: string,) {
    const url = `${this.configService.get('AWS_CLOUDFRONT_DOMAIN_NAME')}/${key}`
    const cloudfrontUrl = getSignedUrlCloudfront({
      url,
      dateLessThan:`${new Date(Date.now()+1000*60*60*24*7)}`,
      keyPairId: this.configService.get('AWS_CLOUDFRONT_KEY_PAIR_ID'),
      privateKey: this.configService.get('AWS_CLOUDFRONT_PRIVATE_KEY'),
    })
    return cloudfrontUrl
  }
  async deleteObjectFromS3(key:string){
    const s3Client = this.getS3Client()
    const command = new DeleteObjectCommand({
      Bucket: this.configService.getOrThrow("AWS_S3_BUCKET_NAME"),
      Key: key,
    });
    const result = await s3Client.send(command)
    return result
  }

  async invalidateCloudfrontCache(key:string){
  const invalidationParams={
    DistributionId: this.configService.get("AWS_CLOUDFRONT_DISTRIBUTION_ID"),
    InvalidationBatch: {
      CallerReference: key,
      Paths: {
        Quantity: 1,
        Items:[
          "/"+key
        ]
      },
    },
  }
  const cloudfrontClient = this.getCloudFrontClient()
  const command = new CreateInvalidationCommand(invalidationParams)
  const result = await cloudfrontClient.send(command)
  return result
}

  
  getKeyFromPresignedUrl(url: string) {
    const keyPrefix =
      "https://" +
      this.configService.getOrThrow("AWS_S3_BUCKET_NAME") +
      ".s3." +
      this.configService.getOrThrow("AWS_S3_REGION") +
      ".amazonaws.com/";
    const key = url.split(keyPrefix)[1].split("?")[0];
    return key;
  }
  checkPresignedUrlExpirationTime(url: string) {
    // first get the timestamp from the url
    const key = this.getKeyFromPresignedUrl(url);
    const timestamps = parseInt(key.split("/")[2].split("-")[0]);
    const diffMinutes = Math.floor((Date.now() - timestamps) / (1000 * 60));
    if (diffMinutes >= 60) {
      return true;
    }
    return false;
  }

  
  





}
