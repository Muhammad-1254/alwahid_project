const {S3Client} = require('@aws-sdk/client-s3')
const { GetObjectCommand } =require('@aws-sdk/client-s3' )
const { getSignedUrl }  = require('@aws-sdk/s3-request-presigner')

const s3Client = new S3Client({
    region:"eu-north-1",
    credentials:{
        accessKeyId:"AKIAZGODJ2YX2SGAPT5C",
        secretAccessKey:"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"

    }
}) 



async function getObjectURl(key) {
    const command = new GetObjectCommand({
        Bucket:"alwahid-post-data-01",
        Key:key
    })
    const url = await getSignedUrl(s3Client,command,)
    return url
    
}

async function init() {
    console.log("url: ",await getObjectURl("pdf.png"))
}

init()