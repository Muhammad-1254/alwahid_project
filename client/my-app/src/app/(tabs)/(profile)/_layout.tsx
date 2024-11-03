import { View, Text } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

import { useWindowDimensions, Pressable, Animated } from "react-native";

import { useAppDispatch, useAppSelector } from "@/src/hooks/redux";
import { setUserRole } from "@/src/store/slices/auth";

import { Stack, useRouter } from "expo-router";
import { Image } from "react-native";

import RNRAnimated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import cAxios from "@/src/lib/cAxios";
import { apiRoutes } from "@/src/constants/apiRoutes";
import { UserRoleEnum } from "@/src/types/user";
import _, { set } from "lodash";
import ContentLoader, { Rect } from "react-content-loader/native";
import { RefreshControl } from "react-native-gesture-handler";
import { PaginationType } from "@/src/types/post";
import ErrorHandler from "@/src/lib/ErrorHandler";
import MediaViewModal, {
  MediaViewModalDataType,
} from "@/src/components/modals/MediaViewModal";
import { setUserBasicInfo } from "@/src/store/slices/userInformation";
import { setListScrollY } from "@/src/store/slices/profile";

export type PostMediasProps = {
  id: string;
  mimeType: string;
  url: string;
};
export type PostDataType = {
  id: string;
  createdAt: string;
  postMedias: PostMediasProps[];
};

export default function ProfileTabsLayout() {
  const IMG_HEIGHT = useMemo(() => 240, []);

  //profile image view
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [mediaModalData, setMediaModalData] =
    useState<MediaViewModalDataType>();
  const profileImageUrl = useAppSelector(
    (s) => s.userInformation.userBasicInfo.avatarUrl
  );

  const { colorScheme } = useColorScheme();
  const dispatch = useAppDispatch();
  const router = useRouter();

  // get user profile data
  async function getProfileData() {
    try {
      const res = await cAxios.get(`${apiRoutes.getUserProfileData}`);
      console.log("data from api: ", res.data);
      dispatch(setUserBasicInfo(res.data));
      dispatch(setUserRole(res.data.userRole));
    } catch (error) {
      console.log("error from fetching user profile data :", error);
      ErrorHandler.handle(error);
    }
  }
  useEffect(() => {
    getProfileData();
  }, []);

  const profileImagePressHandler = () => {
    setMediaModalData({
      url:
        profileImageUrl === null
          ? "@/src/assets/images/avatar-null.jpg"
          : profileImageUrl,
      mimeType: "image",
    });
    setMediaModalVisible(true);
  };

    const scrollY = useRef(new Animated.Value(0));
    // const dispatch = useAppDispatch();
//     useEffect(()=>{
// dispatch(setListScrollY(scrollY.current))
//     },[scrollY])
    const imageAnimatedStyle = {
      transform: [
        {
          translateY: scrollY.current.interpolate({
            inputRange: [-IMG_HEIGHT, 0, IMG_HEIGHT],
            outputRange: [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75],
            extrapolate: "clamp",
          }),
        },
        {
          scale: scrollY.current.interpolate({
            inputRange: [-IMG_HEIGHT, 0, IMG_HEIGHT],
            outputRange: [2, 1, 1],
            extrapolate: "clamp",
          }),
        },
      ],
    };

    const headerAnimatedStyle = {
      opacity: scrollY.current.interpolate({
        inputRange: [0, IMG_HEIGHT / 1.5],
        outputRange: [0, 1],
        extrapolate: "clamp",
      }),
    };

  return (
    <>
      <Stack.Screen
        options={{
          headerBackground: () => (
            <>
              <Animated.View
                className="absolute top-0 left-0 w-full h-[90px]  bg-muted dark:bg-mutedDark"
                // style={[headerAnimatedStyle]}
              />
              <View className=" w-full h-[90px] flex-row items-end justify-between px-4 bg-transparent">
                <Text className="text-primary dark:text-primaryDark text-lg  mb-[14px]">
                  Profile
                </Text>

                <Ionicons
                  name="menu"
                  size={40}
                  color={
                    colorScheme === "dark"
                      ? Colors.dark.primary
                      : Colors.light.primary
                  }
                  style={{ marginBottom: 8 }}
                  onPress={() => router.navigate("/(usefull)/userProfile")}
                />
              </View>
            </>
          ),
        }}
      />
      <View>
        <View className="">
          {/* bg image  */}
          <Pressable onLongPress={profileImagePressHandler}>
            <Animated.Image
              style={[{ height: IMG_HEIGHT }]}
              //   style={[{ height: IMG_HEIGHT }, imageAnimatedStyle]}
              className="w-full "
              source={
                profileImageUrl === null
                  ? require("@/src/assets/images/avatar-null.jpg")
                  : { uri: profileImageUrl }
              }
            />
          </Pressable>
          <UserProfileInfo />
        </View>
      </View>
      <MaterialTopTabsLayout />
    </>
  );
}

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const MaterialTopTabsLayout = () => {
  const { colorScheme } = useColorScheme();
  return (
    <MaterialTopTabs
      initialRouteName="posts"
      screenOptions={{
        // lazy: true,
        tabBarContentContainerStyle: {
          // backgroundColor: "transparent",
          // justifyContent: "center",
          // alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor:
            colorScheme === "dark"
              ? Colors.dark.background
              : Colors.light.background,
        },
        tabBarLabelStyle: {
          textTransform: "capitalize",
          fontSize: 16,
          fontWeight: "bold",
        },
        tabBarActiveTintColor:
          colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary,
        tabBarInactiveTintColor:
          colorScheme === "dark"
            ? Colors.dark.mutedForeground
            : Colors.light.mutedForeground,
        tabBarIndicatorStyle: {
          backgroundColor:
            colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          borderRadius: 10,
          height: "100%",
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="posts"
        options={{
          title: "Posts",
        }}
      />
      <MaterialTopTabs.Screen
        name="liked"
        options={{ title: "Liked",
         }}
      />
      <MaterialTopTabs.Screen name="saved" options={{ title: "saved" }} />
    </MaterialTopTabs>
  );
};

const UserProfileInfo = () => {
  const userRole = useAppSelector((state) => state.auth.userRole);
  const user = useAppSelector((s) => s.userInformation.userBasicInfo);
  const router = useRouter();
  return (
    <View className="w-full  bg-background dark:bg-backgroundDark pb-5">
      <View className="flex-row  items-start justify-center mt-2">
        <View className=" w-[50%]">
          <Text className="text-primary dark:text-primaryDark text-base capitalize">
            {user?.firstname}&nbsp;{user?.lastname}
          </Text>
          <Text className="text-primary dark:text-primaryDark opacity-60">
            role: {userRole}
          </Text>
        </View>
        <View className="w-[50%] flex-row items-center gap-x-8">
          <Text className="text-primary dark:text-primaryDark text-center">
            Followers{"\n"}
            {user.followersCount}
          </Text>
          <Text className="text-primary dark:text-primaryDark text-center">
            Following{"\n"}
            {user.followingCount}
          </Text>
        </View>
      </View>

      <View className="w-full  flex-row items-center justify-evenly mt-5">
        <Pressable
          className="w-[40%] py-1.5 items-center bg-muted dark:bg-mutedDark rounded-md"
          onPress={() => router.push("/(usefull)/(edit)/editProfileData")}
        >
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
  );
};
