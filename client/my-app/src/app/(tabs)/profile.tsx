import {
  View,
  Text,
  useWindowDimensions,
  Pressable,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useColorScheme } from "nativewind";
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux";
import { setUser, setUserRole } from "@/src/store/slices/auth";

import { Stack, useRouter } from "expo-router";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import RNRAnimated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import {
  fetchProfileTabLikedPosts,
  fetchProfileTabPosts,
  fetchProfileTabSavedPosts,
  ProfileTabEnum,
  ProfileTabLikedPostsProps,
  ProfileTabPostsProps,
  ProfileTabSavedPostsProps,
  setProfileTabIndex,
  setProfileTabInitialData,
} from "@/src/store/slices/profileTabs";
import cAxios from "@/src/lib/cAxios";
import { apiRoutes } from "@/src/constants/apiRoutes";
import { UserRoleEnum } from "@/src/types/user";
import { ColorSchemeName } from "react-native";
import _, { set } from "lodash";
import ContentLoader, { Facebook, Rect } from "react-content-loader/native";
import { RefreshControl } from "react-native-gesture-handler";
export default function Profile() {
  const IMG_HEIGHT = useMemo(() => 240, []);
  const scrollY = useRef(new Animated.Value(0));

  const {
    tabIndex,
    loading,
    likedPosts,
    posts,
    savedPosts,
    error,
    isLikedPostComplete,
    isPostComplete,
    isSavedPostComplete,
    postsCount,
    likedPostsCount,
    savedPostsCount,
  } = useAppSelector((state) => state.profileTab);

  const dispatch = useAppDispatch();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colorScheme } = useColorScheme();
  const router = useRouter();


  // get user profile data
  useEffect(() => {
    async function getProfileData() {
      try {
        const res = await cAxios.get(`${apiRoutes.getUserProfileData}`);
        const data = {
          user: res.data.user,
          friends: {
            followersCount: res.data.followersCount,
            followingCount: res.data.followingCount,
          },
        };
        dispatch(setUser(data));
        dispatch(setUserRole(res.data.user.userRole));
      } catch (error) {
        console.log("error from fetching user profile data :", error);
      }
    }
    console.log("profile data called");
    getProfileData();
  }, []);

  const canFetchMore = _.debounce(async () => {
    // the page state will handle all three posts type
    // checking current type of post and depending on len making page {from, to}
    // if some post is completely fetch then set load complete true and do nothing
    if (error.length > 1) {
      console.log("error from canFetchMore: ", error);
      return;
    }
    if (loading) return;

    if (tabIndex === ProfileTabEnum.POSTS) {
      if (isPostComplete) return;
      const postLen = posts.length ? posts.length : 0;
      const page = { from: postLen, to: postLen + 8 };
      await dispatch(fetchProfileTabPosts(page));
    } else if (tabIndex === ProfileTabEnum.SAVED_POSTS) {
      if (isSavedPostComplete) return;
      const savedPostLen = savedPosts.length ? savedPosts.length : 0;
      const page = {
        from: savedPostLen,
        to: savedPostLen + 8,
      };
      await dispatch(fetchProfileTabSavedPosts(page));
    } else if (tabIndex === ProfileTabEnum.LIKED_POSTS) {
      if (isLikedPostComplete) return;
      const likedPostLen = likedPosts.length ? likedPosts.length : 0;
      const page = {
        from: likedPostLen,
        to: likedPostLen + 8,
      };
      await dispatch(fetchProfileTabLikedPosts(page));
    }
  }, 1200);

  const onEndReachedHandler = async () => {
    console.log("onEndReachedHandler called");
    await canFetchMore();
  };

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

  const handleRefresh = useCallback(async ()=>{
    dispatch(setProfileTabInitialData())
  },[])
  return (
    <>
      <Stack.Screen
        options={{
          headerBackground: () => (
            <>
              <Animated.View
                className="absolute top-0 left-0 w-full h-[90px]  bg-muted dark:bg-mutedDark"
                style={[headerAnimatedStyle]}
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
      <Animated.FlatList
        data={
          tabIndex === ProfileTabEnum.POSTS
            ? posts
            : tabIndex === ProfileTabEnum.SAVED_POSTS
            ? savedPosts
            : likedPosts
        }
        ListHeaderComponent={() => (
          <View className="">
            {/* bg image  */}
            <Animated.Image
              style={[{ height: IMG_HEIGHT }, imageAnimatedStyle]}
              className="w-full "
              source={{
                uri: "https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              }}
            />
            <UserProfileInfo />
            <Tabs />
          </View>
        )}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY.current } } }],
          { useNativeDriver: true }
        )}
        onEndReached={onEndReachedHandler}
        onEndReachedThreshold={0.5}
        keyExtractor={(item) => `${item}-${Math.random()}`}
        style={{
          backgroundColor:
            colorScheme === "dark"
              ? Colors.dark.background
              : Colors.light.background,
        }}
        numColumns={3}
        refreshControl={
          <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          />
        }
        renderItem={({ item }) => (
          <FlatListRenderItem
            item={item}
            type={
              tabIndex === ProfileTabEnum.POSTS
                ? ProfileTabEnum.POSTS
                : tabIndex === ProfileTabEnum.SAVED_POSTS
                ? ProfileTabEnum.SAVED_POSTS
                : ProfileTabEnum.LIKED_POSTS
            }
           
          />
        )}
        ListEmptyComponent={<TabDataSkeleton tabIndex={tabIndex}/>}
        ListFooterComponent={() => (
          <ListFooterComponent
            loading={loading}
            showSkeleton={showSkeleton}
            colorScheme={colorScheme}
          />
        )}
      />
    </>
  );
}

type FlatListRenderItemProps = {
  item:
    | ProfileTabPostsProps
    | ProfileTabSavedPostsProps
    | ProfileTabLikedPostsProps;
  type: ProfileTabEnum;
};
const FlatListRenderItem: FC<FlatListRenderItemProps> = ({
  item,
  type,
}) => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  if (type === ProfileTabEnum.POSTS) {
    return (
      <TouchableOpacity
        style={{ width: width / 3 }}
        className="aspect-[1/2] border border-border dark:border-borderDark rounded-md "
        key={item.id}
        onPress={() => router.push(`/postDetails/${item.id}`)}
      >
        {item.postMedias && item.postMedias.length > 0 && (
          <Image
            source={{
              uri: item.postMedias[0].url,
            }}
            className="w-full h-full object-cover bg-center"
          />
        )}
        {!item.postMedias && item.textContent && (
          <Text className="text-primary dark:text-primaryDark ">
            {item.textContent.slice(0, 30)}
          </Text>
        )}
      </TouchableOpacity>
    );
  } else if (type === ProfileTabEnum.LIKED_POSTS) {
    return (
      <TouchableOpacity
        style={{ width: width / 3 }}
        className="aspect-[3/4] border border-border dark:border-borderDark rounded-md "
        key={item.id}
        onPress={() => router.push(`/postDetails/${item.id}`)}
      >
        {item.postMedias && item.postMedias.length > 0 && (
          <Image
            source={{
              uri: item.postMedias[0].url,
            }}
            className="w-full h-full object-cover bg-center"
          />
        )}
        {!item.postMedias && item.textContent && (
          <Text className="text-primary dark:text-primaryDark ">
            {item.textContent.slice(0, 30)}
          </Text>
        )}
      </TouchableOpacity>
    );
  } else {
    return (
      <TouchableOpacity
        style={{ width: width / 3 }}
        className="aspect-[3/4] border border-border dark:border-borderDark rounded-md "
        key={item.id}
        onPress={() => router.push(`/postDetails/${item.id}`)}
      >
        {item.postMedias && item.postMedias.length > 0 && (
          <Image
            source={{
              uri: item.postMedias[0].url,
            }}
            className="w-full h-full object-cover bg-center"
          />
        )}
        {!item.postMedias && item.textContent && (
          <Text className="text-primary dark:text-primaryDark ">
            {item.textContent.slice(0, 30)}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
};

type ListFooterComponentProps = {
  loading: boolean;
  colorScheme: ColorSchemeName;
  showSkeleton: boolean;
};
const ListFooterComponent: FC<ListFooterComponentProps> = ({
  loading,
  showSkeleton,
  colorScheme,
}) => {
  if (!showSkeleton && loading) {
    return (
      <View className=" items-center justify-center h-20 ">
        <ActivityIndicator
          size={"large"}
          color={
            colorScheme === "dark"
              ? Colors.dark.mutedForeground
              : Colors.light.mutedForeground
          }
        />
      </View>
    );
  }
  return null;
};
const UserProfileInfo = () => {
  const { data, userRole } = useAppSelector((state) => state.auth);
  const { friends, user } = data;
  return (
    <View className="w-full  bg-background dark:bg-backgroundDark pb-5">
      <View className="flex-row  items-start justify-center mt-2">
        <View className=" w-[50%]">
          <Text className="text-primary dark:text-primaryDark text-base capitalize">
            {user.firstname}&nbsp;{user.lastname}
          </Text>
          <Text className="text-primary dark:text-primaryDark opacity-60">
            role: {userRole}
          </Text>
        </View>
        <View className="w-[50%] flex-row items-center gap-x-8">
          <Text className="text-primary dark:text-primaryDark text-center">
            Followers{"\n"}
            {friends.followersCount}
          </Text>
          <Text className="text-primary dark:text-primaryDark text-center">
            Following{"\n"}
            {friends.followingCount}
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
  );
};

const Tabs = () => {
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const index = useAppSelector((state) => state.profileTab.tabIndex);
  const userRole = useAppSelector((state) => state.auth.userRole);

  const AnimatedViewStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX:
            userRole === UserRoleEnum.NORMAL
              ? withTiming(
                  index === ProfileTabEnum.LIKED_POSTS
                    ? 0
                    : width / 2 + (width / 100) * 2,
                  {
                    duration: 150,
                  }
                )
              : withTiming(
                  index === ProfileTabEnum.POSTS
                    ? 0
                    : index === ProfileTabEnum.LIKED_POSTS
                    ? width / 3
                    : (width / 3) * 2,
                  { duration: 150 }
                ),
        },
      ],
    };
  });

  return (
    <View className="relative w-full h-12 bg-background dark:bg-backgroundDark flex-row-reverse items-center justify-between  mb-2">
      <RNRAnimated.View
        style={[AnimatedViewStyle]}
        className={`absolute  left-0   h-full bg-muted dark:bg-mutedDark rounded-lg
          ${userRole === UserRoleEnum.NORMAL ? "w-[48%]" : "w-[33%]"}
          `}
      />

      <View
        className={`${
          userRole === UserRoleEnum.NORMAL ? "w-[48%]" : "w-[32%]"
        } h-full `}
      >
        <Ionicons
          name={index === 0 ? "bookmark" : "bookmark-outline"}
          size={36}
          onPress={() =>
            dispatch(setProfileTabIndex(ProfileTabEnum.SAVED_POSTS))
          }
          color={
            colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          }
          style={{
            width: "100%",
            height: "100%",
            textAlign: "center",
            textAlignVertical: "center",
          }}
        />
      </View>

      <View
        className={`${
          userRole === UserRoleEnum.NORMAL ? "w-[48%]" : "w-[32%]"
        } h-full `}
      >
        <Ionicons
          name={index === 1 ? "heart" : "heart-outline"}
          size={36}
          onPress={() =>
            dispatch(setProfileTabIndex(ProfileTabEnum.LIKED_POSTS))
          }
          color={
            colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          }
          style={{
            width: "100%",
            height: "100%",
            textAlign: "center",
            textAlignVertical: "center",
          }}
        />
      </View>
      {(userRole === UserRoleEnum.ADMIN ||
        userRole === UserRoleEnum.CREATOR) && (
        <View className="w-[32%] h-full">
          <Ionicons
            name={index === 2 ? "grid" : "grid-outline"}
            size={32}
            onPress={() => dispatch(setProfileTabIndex(ProfileTabEnum.POSTS))}
            color={
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary
            }
            style={{
              width: "100%",
              height: "100%",
              textAlign: "center",
              textAlignVertical: "center",
            }}
          />
        </View>
      )}
    </View>
  );
};



const TabDataSkeleton = ({tabIndex}:{tabIndex:ProfileTabEnum}) => {
const {colorScheme}  = useColorScheme()
const {width} = useWindowDimensions()

const Content = ({height,width}:{width:number, height:number})=>(
  <ContentLoader
  style={{ width , height }}
  viewBox={`0 0 ${width} ${height}`}
  animate={true}
  backgroundColor={colorScheme==='dark'?Colors.dark.muted:Colors.light.border}
  foregroundColor={colorScheme==='dark'?Colors.dark.primaryForeground:Colors.light.muted}

>
  <Rect x="0" y="0" rx="4" ry="4" width={width} height={height} />
</ContentLoader>
)
return <View className="flex-row flex-wrap items-center justify-between">
{
Array.from({length:4},()=>Math.random()).map((_)=>{
  if(tabIndex===ProfileTabEnum.POSTS){
    return  <Content key={_} height={(width/3)*(2)} width={width/3} />
    
  }else if(tabIndex === ProfileTabEnum.LIKED_POSTS){
   return <Content key={_} height={(width/3)*(4/3)} width={width/3} />
  }else{
   return <Content key={_} height={(width/3)*(4/3)} width={width/3} />
  }
})
}
</View> 

};
