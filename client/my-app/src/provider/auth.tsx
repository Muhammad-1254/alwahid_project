import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../hooks/redux";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus, Text, View } from "react-native";
import { getTokenFromStorage } from "../lib/utils";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appState, setAppState] = useState(AppState.currentState);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  console.log("auth provider called");
  useEffect(() => {
    async function checkTokens() {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!accessToken && !refreshToken) {
        router.navigate("(auth)/login");
        return
      }
    
    }
    setLoading(true);
    checkTokens();
    setLoading(false)
  }, []);
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.match("/inactive|background/") && nextAppState === "active") {
      const { accessToken, refreshToken } = await getTokenFromStorage();
      if (!accessToken && !refreshToken) router.navigate("(auth)/login");
    }
    setAppState(nextAppState);
  };
  if (loading) {
    <View className="flex-1 items-center justify-center bg-background dark:bg-backgroundDark ">
      <Text className="text-2xl text-primary dark:text-primaryDark">
        Loading Auth Provider
      </Text>
    </View>;
  }

  return <>{children}</>;
}
