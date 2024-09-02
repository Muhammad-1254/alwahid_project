import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { Stack, useRouter,  } from "expo-router";
import { JsStack } from "../components/elements/CustomJsStack";
import { TransitionPresets } from "@react-navigation/stack";
import { useColorScheme } from "nativewind";

const Screens = ()=>{
    const { colorScheme } = useColorScheme();
    const router = useRouter();
  
    return(
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
          options={{
            presentation: "modal",
            headerShown: false,
            ...TransitionPresets.ModalPresentationIOS,
            gestureEnabled: true,
          }}
        />
        {/* ...modals */}
      </JsStack>
    )
}

export default Screens