import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { Image } from "react-native";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTokenFromStorage = async () => {
  const accessToken = await AsyncStorage.getItem("accessToken");
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  return { accessToken, refreshToken };
};

export const getImageAspectRatio =async (uri:string)=>{
  function gcd(a:number, b:number):number {
    return b === 0 ? a : gcd(b, a % b);
  }  
  function getAspectRatio(width:number, height:number):string {
    const divisor = gcd(width, height);
    const ratioWidth = width / divisor;
    const ratioHeight = height / divisor;
    
    return `${ratioWidth}/${ratioHeight}`;
  }
 return new Promise((resolve, reject) => { 
  Image.getSize(uri,(w,h)=>{
    const ar = getAspectRatio(w,h);
    resolve(ar);
  },(e=>{

    console.log(`Couldn't get the image size: ${e.message}`)
    resolve("1/1")
  })
 )})

}


export const getSimilarHashtagByName = async (value: string) => {
  return await axios.get(`${process.env.EXPO_PUBLIC_SERVER_DOMAIN_DEV}/api/hashtag/search?name=${value}`);
};
export const getSimilarFriendsZoneByName = async (value: string) => {
  return await axios.get(`${process.env.EXPO_PUBLIC_SERVER_DOMAIN_DEV}/api/`);
};
