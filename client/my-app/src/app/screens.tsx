import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { Stack, useRouter } from "expo-router";
import { JsStack } from "../components/elements/CustomJsStack";
import { TransitionPresets } from "@react-navigation/stack";
import { useColorScheme } from "nativewind";

const Screens = () => {
  const { colorScheme } = useColorScheme();
  const router = useRouter();

  return (
    <JsStack
      initialRouteName="(tabs)"

      screenOptions={{ cardStyle:{backgroundColor:'red'} }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
   
      <Stack.Screen
        name="(usefull)/postDetails/[postId]"
        options={{ headerShown: false }}
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
  );
};

export default Screens;
