import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { Tabs, withLayoutContext } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import ChatSocket from "@/src/lib/chat/SocketClient.lib";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import type {
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { apiChatRoutes } from "@/src/constants/apiRoutes";

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function ChatTabsLayout() {

  const { colorScheme } = useColorScheme();

  useEffect(() => {
    const socket = ChatSocket.getInstance();
    if(!socket.isConnected()){
      socket.connect(apiChatRoutes.wsUrl);
    }
  },[])
  
  return (
  
  <MaterialTopTabs initialRouteName="chats" >
      <MaterialTopTabs.Screen
        name="chats"
        options={{
          title: "Chat",
        }}
      />
      <MaterialTopTabs.Screen name="calls" 
      options={{title: "Calls"}}
      />
    </MaterialTopTabs>
  );
}
