import {
  View,
  Text,
  Button,
  Switch,
  Alert,
  FlatList,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { useColorScheme } from "nativewind";
import { useAppSelector } from "@/src/hooks/redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setIsAuthenticated,
  setUser,
  userDataInitialState,
} from "@/src/store/slices/auth";

import { useDispatch } from "react-redux";
import { Link, Stack, useRouter } from "expo-router";
import { Image } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import { NavigationContainer } from "@react-navigation/native";
import { Tab, TabView } from "@rneui/themed";
import ProfileTabs from "@/src/components/profileTabs";

export default function Profile() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const user = useAppSelector((state) => state.auth);

  const router = useRouter();
  const dispatch = useDispatch();

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
  const IMG_HEIGHT = 240;
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
    };
  });
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollOffset.value, [0, IMG_HEIGHT / 1.5], [0, 1]),
    };
  });
  return (
    <>
      <Stack.Screen
        options={{
          headerBackground: () => (
            <Animated.View
              className=" w-full h-[90px] flex-row items-end justify-between px-4 bg-muted dark:bg-mutedDark"
              style={[headerAnimatedStyle]}
            >
              <Text className="text-primary dark:text-primaryDark text-lg  mb-[14px]">
                Profile
              </Text>

              <Image
                className="w-10 h-10 rounded-full mb-2.5"
                source={{
                  uri: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                }}
              />

              <Ionicons
                name="menu"
                size={40}
                color={
                  colorScheme === "dark"
                    ? Colors.dark.primary
                    : Colors.light.primary
                }
                style={{ marginBottom: 8 }}
                onPress={() => router.navigate("(usefull)/userProfile")}
              />
            </Animated.View>
          ),
        }}
      />
      <Animated.ScrollView
        className=" bg-background dark:bg-backgroundDark "
        ref={scrollRef}
        scrollEventThrottle={16}
      >
        <>
          {/* bg image  */}
          <Animated.Image
            style={[{ height: IMG_HEIGHT }, imageAnimatedStyle]}
            className="w-full "
            source={{
              uri: "https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            }}
          />
          <View className="w-full bg-background dark:bg-backgroundDark ">
            <View className="flex-row  items-start justify-center mt-2">
              <View className=" w-[50%]">
                <Text className="text-primary dark:text-primaryDark text-base capitalize">
                  {user.data.firstname}&nbsp;{user.data.lastname}
                </Text>
                <Text className="text-primary dark:text-primaryDark opacity-60">
                  Age: {user.data.age}&nbsp;
                  {user.data.age && `(${user.data.gender})`}
                </Text>
                {user.data.email && (
                  <Text className="text-primary dark:text-primaryDark opacity-60">
                    E-mail: {user.data.email}
                  </Text>
                )}
                {user.data.phoneNumber && (
                  <Text className="text-primary dark:text-primaryDark opacity-60">
                    Phone: {user.data.phoneNumber}
                  </Text>
                )}
              </View>
              <View className="w-[50%] flex-row items-center gap-x-8">
                <Text className="text-primary dark:text-primaryDark text-center">
                  following{"\n"}0
                </Text>
                <Text className="text-primary dark:text-primaryDark text-center">
                  followers{"\n"}0
                </Text>
              </View>
            </View>

            <View className="w-full  flex-row items-center justify-evenly mt-5">
              <Pressable className="w-[40%] py-1.5 items-center bg-muted dark:bg-mutedDark rounded-md">
                <Text className="text-primary dark:text-primaryDark">
                  Edit Profile
                </Text>
              </Pressable>
              <Pressable className="w-[40%] py-1.5 items-center bg-muted dark:bg-mutedDark rounded-md">
                <Text className="text-primary dark:text-primaryDark">
                  Share Profile
                </Text>
              </Pressable>
            </View>
          </View>
          <View className="pb-96">
          <ProfileTabs />
          </View>
        </>
      </Animated.ScrollView>
    </>
  );
}
