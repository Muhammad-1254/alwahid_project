import React from "react";
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

  if (isAuthenticated) {
    return <Redirect href={"(tabs)"} />;
  }

  const { colorScheme } = useColorScheme();
  const router = useRouter();

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
