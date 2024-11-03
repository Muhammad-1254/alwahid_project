export type GeneratePutPresignedUrlPayloadType={
    urlKey:string,
    contentType:string;
    expiresIn?:number;
}