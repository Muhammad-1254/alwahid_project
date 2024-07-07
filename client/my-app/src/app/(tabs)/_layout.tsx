import React from "react";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import { fontScale, useColorScheme } from "nativewind";
import { useAuth } from "@/src/hooks/auth";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Redirect href={"(auth)"} />;
  }
  return (
    <Tabs initialRouteName="index" safeAreaInsets={{bottom:10, }}
     screenOptions={
      {tabBarLabelStyle:{fontSize:10,marginBottom:-2,},
      tabBarActiveTintColor:colorScheme==='dark'?Colors.dark.primary:Colors.light.primary,
      
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          
          headerStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          },
          tabBarStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.accent : Colors.light.accent,
              
              
          },
          headerTitle: "Home",
          headerTitleStyle: {
            color:
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary,
          },
          tabBarIcon: ({ color, focused }) => {
            return (
              <Ionicons
                style={{
                  marginBottom: -5,
                  color:
                    colorScheme === "dark"
                      ? Colors.dark.primary
                      : Colors.light.primary,
                }}
                name={focused ? "home" : "home-outline"}
                color={color}
                size={24}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          },
          tabBarStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.accent : Colors.light.accent,
          },
          headerTitle: "Home",
          headerTitleStyle: {
            color:
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary,
          },
          tabBarIcon: ({ color, focused }) => {
            return (
              <Ionicons
                style={{
                  marginBottom: -5,
                }}
                name={focused ? "search" : "search-outline"}
                color={
                  colorScheme === "dark"
                    ? Colors.dark.primary
                    : Colors.light.primary
                }
                size={24}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Alerts",
          // headerStyle: {
          //   backgroundColor:
          //     colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          // },
          tabBarStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.accent : Colors.light.accent,
          },
          // headerTitle: "Notifications",
          // headerTitleStyle: {
          //   color:
          //     colorScheme === "dark"
          //       ? Colors.dark.primary
          //       : Colors.light.primary,
          // },
          headerShown:false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              style={{ marginBottom: -5}}
              name={focused ? "notifications" : "notifications-outline"}
              color={
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.primary
              }
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          headerStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          },
          tabBarStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.accent : Colors.light.accent,
          },
          headerTitle: "Chats",
          headerTitleStyle: {
            color:
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary,
          },
          headerRight:()=>(<Ionicons name="ellipsis-vertical"  size={24} style={{paddingRight:20}} color={colorScheme==='dark'?Colors.dark.primary:Colors.light.primary}/>),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              style={{ marginBottom: -5,  }}
              name={focused ? "chatbubble" : "chatbubble-outline"}
              color={
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.primary
              }
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          },
          tabBarStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.accent : Colors.light.accent,
          },
          headerTitle: "Profile",
          headerTitleStyle: {
            color:
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary,
          },

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              style={{ marginBottom: -5 }}
              name={!focused ? "people-outline" : "people"}
              color={
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.primary
              }
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
