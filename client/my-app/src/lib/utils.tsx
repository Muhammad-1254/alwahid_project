import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { Image, ImageSourcePropType } from "react-native";
import { twMerge } from "tailwind-merge";
import * as VideoThumbnails from 'expo-video-thumbnails';
import { PostLikeEnum } from "../types/post";
import ParsePhoneNumber from "libphonenumber-js";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTokenFromStorage = async () => {
  const accessToken = await AsyncStorage.getItem("accessToken");
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  return { accessToken, refreshToken };
};


function gcd(a:number, b:number):number {
  return b === 0 ? a : gcd(b, a % b);
}  
export const  getAspectRatio = (width:number, height:number):string=> {
  const divisor = gcd(width, height);
  const ratioWidth = width / divisor;
  const ratioHeight = height / divisor;
  
  return `${ratioWidth}/${ratioHeight}`;
}

export const getImageAspectRatio =async (uri:string)=>{
 
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



export const getVideoPropsFromUrl = async (url: string) => {
  try {
    const videoProps = await VideoThumbnails.getThumbnailAsync(url,{
      time: 15000
    })
    
    return {url:videoProps.uri,height:videoProps.height,width:videoProps.width}
  } catch (error) {
    console.error("error while creating thumbnail",error)
  }
}


// get post icons by enum
export const getPostLikeIcon = (likeType: PostLikeEnum) => {
  let path:string = '@/src/assets/images/post-icons';
  let icon: ImageSourcePropType;
  if(likeType === PostLikeEnum.HEART){
    icon = require(path+ '/heart.png');
  }else if(likeType === PostLikeEnum.LIKE){
    icon = require(path+ '/like.png');
  }else if(likeType === PostLikeEnum.LAUGH){
    icon = require(path+ '/laugh.png');
  }else if(likeType === PostLikeEnum.SAD){
    icon = require(path+ '/sad.png');
  }else if(likeType === PostLikeEnum.WOW){
    icon = require(path+ '/wow.png');
  }else{
    icon = require(path+ '/like.png')
  }
return icon;

}

export const checkIsValidEmail =(email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const checkIsValidPhoneNumber = (phoneNumber: string) => {
    
  const parsePhoneNumber = ParsePhoneNumber(phoneNumber.startsWith("+")?phoneNumber:"+"+phoneNumber);
  if(!parsePhoneNumber?.isValid()){
  console.log("isValid", parsePhoneNumber?.isValid());
    return false;
  }
  const formatPhoneNumber = parsePhoneNumber?.formatInternational();
  const pnList   = formatPhoneNumber?.split(" ")
  const requiredPN = pnList[0]+"-"+pnList[1]+pnList[2];
  return requiredPN;
};


type Diff<T extends object, U extends object> = {
  [K in Exclude<keyof T, keyof U>]?: T[K];
} & {
  [K in Exclude<keyof U, keyof T>]?: U[K];
} & {
  [K in keyof T & keyof U]: T[K] extends object
      ? U[K] extends object
          ? Diff<T[K], U[K]>
          : T[K] | U[K]
      : T[K] extends U[K]
      ? never
      : T[K] | U[K];
};

export function findDifferenceBObjects<T extends object, U extends object>(obj1: T, obj2: U): Diff<T, U> {
  const changes: Partial<Diff<T, U>> = {};

  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  keys.forEach((key) => {
      const value1 = obj1[key as keyof T];
      const value2 = obj2[key as keyof U];

      if (typeof value1 === 'object' && value1 !== null && typeof value2 === 'object' && value2 !== null) {
          const nestedDiff = findDifferenceBObjects(value1, value2);
          if (Object.keys(nestedDiff).length > 0) {
              changes[key as keyof Diff<T, U>] = nestedDiff;
          }
      } else if (value1 !== value2) {
          changes[key as keyof Diff<T, U>] = value2 !== undefined ? value2 : value1;
      }
  });

  return changes as Diff<T, U>;
}
