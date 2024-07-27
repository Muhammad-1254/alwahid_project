import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
} from "react-native";
import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppSelector } from "@/src/hooks/redux";

export default function UserProfile() {
  const [search, setSearch] = useState("");
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth);
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Profile Settings",
          headerStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          },
          headerTitleStyle: {
            color:
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary,
          },
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              style={{ paddingRight: 24, paddingLeft: 8 }}
              onPress={() => {
                router.back();
              }}
              size={24}
              color={
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.primary
              }
            />
          ),
        }}
      />
      <ScrollView className="bg-background dark:bg-backgroundDark">
        {/* input search  */}
        <View className="w-full h-9  mt-4 items-center justify-center">
          <TextInput
            className=" w-[90%] h-full text-primary dark:text-primaryDark bg-muted  dark:bg-mutedDark rounded-[10px] px-3 "
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholder="Search"
            placeholderTextColor={
              colorScheme === "dark"
                ? Colors.dark.mutedForeground
                : Colors.light.mutedForeground
            }
          />
        </View>
        <View className="items-center justify-center px-8 mt-4">
          <View className="w-full flex-row items-center justify-between mb-4">
            <Text className="text-primary dark:text-primaryDark text-base">
              Theme
            </Text>
            <Switch
              value={colorScheme == "dark"}
              onChange={toggleColorScheme}
            />
          </View>

          {(user.data.role === "admin" || user.data.role === "creator") && (
            <Pressable
              className="w-full flex-row items-center justify-between 
            bg-card dark:bg-cardDark  mb-4
          "
              onPress={() => router.push("(usefull)/addNewPost")}
            >
              <Text className="text-primary dark:text-primaryDark text-base">
                Add New Post
              </Text>
              <MaterialIcons
                name="post-add"
                size={32}
                color={
                  colorScheme === "dark"
                    ? Colors.dark.primary
                    : Colors.light.primary
                }
              />
            </Pressable>
          )}
        </View>
      </ScrollView>
    </>
  );
}
