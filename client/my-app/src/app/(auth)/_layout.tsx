import React from "react";
import { useAuth } from "@/src/hooks/auth";
import { Redirect, Slot, Stack, useRouter } from "expo-router";
import { AppState } from "react-native";
import { supabase } from "@/src/lib/supabase";
import { Colors } from "@/src/constants/Colors";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";

export default function _layout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    
    return <Redirect href={"(tabs)"} />;
  }
  // Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
const {colorScheme} = useColorScheme()
const router = useRouter()

  return(
    <Stack initialRouteName="/login" screenOptions={{
      headerTitleStyle:{color:colorScheme==='dark'?Colors.dark.primary:Colors.light.primary, },
      headerStyle:{
        backgroundColor:colorScheme==='dark'?Colors.dark.muted:Colors.light.muted,
        
      },
     

    }}>
    <Stack.Screen name="login"
     options={{
      headerTitle:"Login",
       }}/>
    <Stack.Screen name="signup"
    
     options={{
    headerTitle:"Sign Up",
      headerLeft:()=>(
        <Ionicons name='arrow-back' style={{paddingRight:20}} onPress={()=>{router.back()}} size={24} color={colorScheme==='dark'?Colors.dark.primary:Colors.light.primary}/>
      )
     }}/>

    </Stack>
  );

}
