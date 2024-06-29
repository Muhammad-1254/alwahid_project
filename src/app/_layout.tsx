import { useFonts } from "expo-font";
import { Redirect, Stack, useNavigation, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/src/store/store";
import AuthProvider from "../provider/auth";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "nativewind";
import { SafeAreaProvider } from "react-native-safe-area-context";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation()
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
    <SafeAreaProvider>
    <Provider store={store}>
      <AuthProvider>
      <Stack>
        <Stack.Screen  name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen  name="(usefull)/postDetails" 
        options={{ headerTitle:"",
        headerLeft:()=>(
          <Ionicons name="arrow-back" onPress={()=>router.back()} size={24} color={colorScheme==='dark'?Colors.dark.primary:Colors.light.primary} />),
          headerRight:()=>(
            <Ionicons  name="ellipsis-vertical" size={24} color={colorScheme==='dark'?Colors.dark.primary:Colors.light.primary} />),
          headerStyle:{
            backgroundColor:colorScheme==='dark'?Colors.dark.muted:Colors.light.muted
          }
         }} />

<Stack.Screen  name="(usefull)/(modals)/sortData" options={{ presentation:'modal' }} />
<Stack.Screen
        name="modal"
        options={{
          // Set the presentation mode to modal for our modal route.
          presentation: 'modal',
        }}
      />

      </Stack>
      </AuthProvider>
    </Provider>
    </SafeAreaProvider>
  );
}
