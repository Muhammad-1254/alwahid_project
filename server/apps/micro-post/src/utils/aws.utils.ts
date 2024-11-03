import { CustomRpcExceptions } from "@app/shared/filters/CustomRpcExceptions.filter";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

export const getCloudFrontSignedUrl = async (
  awsService: ClientProxy,
  urlKey: StringConstructor,
) => {
  let flag = false;
  const responseFromAws = awsService.send(
    { cmd: "getCloudFrontSignedUrl" },
    { urlKey },
  );
  const url = await firstValueFrom(responseFromAws)
    .then(res => res)
    .catch(err => {
      console.log("error while fetching presigned url: ", err);
      if (flag) throw CustomRpcExceptions.InternalException();
      flag = true;
      return getCloudFrontSignedUrl(awsService, urlKey);
    });
  return url;
};
