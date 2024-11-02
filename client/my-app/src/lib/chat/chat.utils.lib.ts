import axios from "axios";
import { getTokenFromStorage } from "../utils";
import { apiRoutes } from "@/src/constants/apiRoutes";
import * as SecureStore from "expo-secure-store";

export const updateJwtToken = async()=>{
  console.log("updating token")
    const {refreshToken} = await getTokenFromStorage();
    console.log("refreshToken: ",refreshToken)
    const response = await axios.post(apiRoutes.getAccessToken,{refreshToken});
    console.log("response:",response)
    
    const {accessToken, refreshToken:rf} = response.data;
    
    await SecureStore.setItemAsync("accessToken",accessToken);
    await SecureStore.setItemAsync("refreshToken",rf);
    return {accessToken};
  }
  