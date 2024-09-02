import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Provider as StoreProvider } from "react-redux";
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
import { RootSiblingParent } from "react-native-root-siblings";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../db/migrations/migrations";
import { View } from "react-native";
import { Text } from "react-native";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite/driver";
import Screens from "./screens";

const CHAT_DB_NAME = "chat.db";
const expoDb = openDatabaseSync(CHAT_DB_NAME);
const chatDb = drizzle(expoDb);

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  // sqlite database with drizzle orm
  const { success, error } = useMigrations(chatDb, migrations);
  useDrizzleStudio(expoDb)
  if(error){ 
    console.log("migration error", error);
  }
  if(!success){
  console.log("migrating...");
  }  
  // end sqlite database with drizzle orm
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
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "black" }}>
        <BottomSheetModalProvider>
          <RootSiblingParent>
            <StoreProvider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <SQLiteProvider databaseName={CHAT_DB_NAME}>
                  <AuthProvider>
                    {error ? (
                      <View className="flex-1 items-center justify-center">
                        <Text className="text-primary dark:text-primaryDark text-base">
                          Migration error: {error.message}
                        </Text>
                      </View>
                    ) : !success ? (
                      <View className="flex-1 items-center justify-center">
                        <Text className="text-primary dark:text-primaryDark text-base">
                          Database is migrating...
                        </Text>
                      </View>
                    ) : (
                      <Screens />
                    )}
                  </AuthProvider>
                </SQLiteProvider>
              </PersistGate>
            </StoreProvider>
          </RootSiblingParent>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
