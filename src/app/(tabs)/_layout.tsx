import React from "react";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import { useColorScheme } from "nativewind";
import { useAuth } from "@/src/hooks/auth";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Redirect href={"/login"} />;
  }
  return (
    <Tabs initialRouteName="index">
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          headerStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          },
          tabBarStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.accent : Colors.light.accent,
          },
          headerTitle: "Home",
          headerTitleStyle:{
            color:colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          
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
                size={25}
              />
            );
          },
        }}
      />
        <Tabs.Screen
        name="search"
        options={{
          title: "",
          headerStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          },
          tabBarStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.accent : Colors.light.accent,
          },
          headerTitle: "Home",
          headerTitleStyle:{
            color:colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          
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
                name={focused ? "search" : "search-outline"}
                color={color}
                size={25}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "",
          headerStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          },
          tabBarStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.accent : Colors.light.accent,
          },
          headerTitle: "Notifications",
          headerTitleStyle:{
            color:colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              style={{ marginBottom: -5 , color:
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.primary,}}
              name={focused ? "notifications" : "notifications-outline"}
              color={color}
              size={25}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "",
          headerStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          },
          tabBarStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.accent : Colors.light.accent,
          },
          headerTitle: "Profile",
          headerTitleStyle:{
            color:colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          
          },

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              style={{ marginBottom: -5, color:
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.primary, }}
              name={!focused ? "reorder-three" : "reorder-three-outline"}
              color={color}
              size={40}
            />
          ),
        }}
      />
    </Tabs>
  );
}
