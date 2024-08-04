import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppSelector } from "@/src/hooks/redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setIsAuthenticated, setUser, userDataInitialState } from "@/src/store/slices/auth";

export default function UserProfile() {
  const [search, setSearch] = useState("");
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.auth);
  const logoutHandler = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          await AsyncStorage.clear();
          dispatch(setIsAuthenticated(false));
          dispatch(setUser(userDataInitialState));
          router.navigate("(auth)/login");
        },
      },
    ]);
  };
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
          

          {(user.userRole === "admin" || user.userRole === "creator") && (
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
           <View className="w-full flex-row items-center justify-between mb-4">
            <Text className="text-primary dark:text-primaryDark text-base">
              Logout
            </Text>
            <MaterialIcons
              name="logout"
              size={32}
              color={
                colorScheme === "dark"
                  ? Colors.dark.destructive
                  : Colors.light.destructive
              }
              onPress={logoutHandler}
              />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
