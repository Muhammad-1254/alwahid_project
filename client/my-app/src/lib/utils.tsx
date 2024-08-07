import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { Image, ImageSourcePropType } from "react-native";
import { twMerge } from "tailwind-merge";
import * as VideoThumbnails from 'expo-video-thumbnails';
import { PostLikeEnum } from "../types/post";


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