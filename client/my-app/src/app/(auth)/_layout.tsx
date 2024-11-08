import React, { useEffect } from "react";
import { Redirect, Slot, Stack, usePathname, useRouter } from "expo-router";
import { AppState } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "@/src/hooks/redux";

export default function _layout() {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const router = useRouter();
  const { colorScheme } = useColorScheme();

    
  useEffect(()=>{
    if(isAuthenticated){
      router.replace("/(tabs)")
    }
  },[isAuthenticated])

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          color:
            colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary,
        },
        headerStyle: {
          backgroundColor:
            colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
        },
      }}
    >

      <Stack.Screen
        name="login"
        options={{
          headerTitle: "Login",
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              style={{ paddingRight: 20 }}
              onPress={() => {
                router.back();
              }}
              size={24}
              color={
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.primary
              }
            />
          ),
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerTitle: "Sign Up",
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              style={{ paddingRight: 20 }}
              onPress={() => {
                router.back();
              }}
              size={24}
              color={
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.primary
              }
            />
          ),
        }}
      />
     </Stack>
  );
}
