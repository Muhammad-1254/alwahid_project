import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/src/store/store";
import AuthProvider from "../provider/auth";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("@/src/assets/fonts/SpaceMono-Regular.ttf"),
  });
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  if (!loaded) {
    return null;
  }
  return (
    <Provider store={store}>
      <AuthProvider>
      <Stack>
        <Stack.Screen  name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />

      </Stack>
      </AuthProvider>
    </Provider>
  );
}
