import { useFonts } from "expo-font";
import {
  Stack,
  useRouter,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Provider as StoreProvider, } from "react-redux";
import { store, persistor } from "@/src/store/store";
import AuthProvider from "../provider/auth";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "nativewind";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PersistGate } from "redux-persist/integration/react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { JsStack } from "../components/elements/CustomJsStack";
import { TransitionPresets } from "@react-navigation/stack";
import { globalErrorHandler } from "@/src/lib/ErrorHandler";
import { RootSiblingParent } from 'react-native-root-siblings';



SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();

  const [loaded] = useFonts({
    SpaceMono: require("@/src/assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    ErrorUtils.setGlobalHandler(globalErrorHandler);
  }, []);
  useEffect(() => {
    console.log("app loading......");
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
 

  if (!loaded) {
    return null;
  }
  return (
    <SafeAreaProvider >
      <GestureHandlerRootView style={{ flex: 1,backgroundColor:'black' }}>
        <BottomSheetModalProvider>
            <RootSiblingParent>

          <StoreProvider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <AuthProvider>
                <JsStack initialRouteName="(tabs)">
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />

                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                  <Stack.Screen
                    name="(usefull)/postComments"
                    options={{
                      headerTitle: "",
                      headerLeft: () => (
                        <Ionicons
                          name="arrow-back"
                          onPress={() => router.back()}
                          size={24}
                          color={
                            colorScheme === "dark"
                              ? Colors.dark.primary
                              : Colors.light.primary
                          }
                        />
                      ),
                      headerRight: () => (
                        <Ionicons
                          name="ellipsis-vertical"
                          size={24}
                          color={
                            colorScheme === "dark"
                              ? Colors.dark.primary
                              : Colors.light.primary
                          }
                        />
                      ),
                      headerStyle: {
                        backgroundColor:
                          colorScheme === "dark"
                            ? Colors.dark.muted
                            : Colors.light.muted,
                      },
                    }}
                  />
                  <Stack.Screen
                    name="(usefull)/postDetails"
                    options={{ headerShown: false }}
                  />

                 
                  <Stack.Screen
                    name="chats/[userId]"
                    options={{
                      headerStyle: {
                        backgroundColor:
                          colorScheme === "dark"
                            ? Colors.dark.muted
                            : Colors.light.muted,
                      },
                      headerTitleStyle: {
                        color:
                          colorScheme === "dark"
                            ? Colors.dark.primary
                            : Colors.light.primary,
                      },
                    }}
                  />

                  {/* modals */}
                  <JsStack.Screen
                    name="(usefull)/(modals)/comments/[postId]"
                    options={{
                      headerShown: false,
                      ...TransitionPresets.SlideFromRightIOS,
                      gestureEnabled: true,
                    }}
                  />
                   <JsStack.Screen
                    name="(usefull)/(modals)/likes/[targetType,id]"
                    options={{
                      headerShown: false,
                      ...TransitionPresets.SlideFromRightIOS,
                      gestureEnabled: true,
                    }}
                  />
                   <JsStack.Screen
                    name="(usefull)/(modals)/sortData"
                    options={{ presentation: "modal",
                      headerShown: false,
                      ...TransitionPresets.ModalPresentationIOS,
                      gestureEnabled: true,
                     }}
                  />
                  {/* ...modals */}

                </JsStack>
              </AuthProvider>
            </PersistGate>
          </StoreProvider>
          </RootSiblingParent>

        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
