import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../hooks/redux";
import { getUser,  } from "../store/slices/auth";
import {  useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";
import { getTokenFromStorage } from "../lib/utils";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appState, setAppState] = useState(AppState.currentState)
  const dispatch = useAppDispatch();
const router = useRouter()
console.log("auth provider called")
  useEffect(() => {
    async function checkTokens(){
      const accessToken = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if(!accessToken&& !refreshToken)  router.navigate("(auth)/login")
      
    } 
    checkTokens();
    dispatch(getUser()).unwrap().catch(err=>router.navigate("(auth)/login"));
  }, []);
  useEffect(()=>{
    const subscription = AppState.addEventListener('change',handleAppStateChange)
    return()=>{
      subscription.remove()
    }
  },[])

  const handleAppStateChange = async(nextAppState:AppStateStatus)=>{
if(appState.match("/inactive|background/") && nextAppState === "active"){
const {accessToken,refreshToken} = await getTokenFromStorage()
if(!accessToken && !refreshToken) router.navigate("(auth)/login")
}
setAppState(nextAppState)
  }
    return <>{children}</>;
}
