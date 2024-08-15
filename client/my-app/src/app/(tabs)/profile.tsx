import {
  View,
  Text,
  useWindowDimensions,
  Pressable,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useColorScheme } from "nativewind";
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux";
import {  setUserRole } from "@/src/store/slices/auth";

import { Stack, useRouter } from "expo-router";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
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
import MediaViewModal, { MediaViewModalDataType } from "@/src/components/modals/MediaViewModal";
import { setUserBasicInfo } from "@/src/store/slices/userInformation";

type PostMediasProps = {
  id: string;
  mimeType: string;
  url: string;
};
type PostDataType = {
  id: string;
  createdAt: string;
  postMedias: PostMediasProps[];
};


enum ProfileTabEnum {
  SAVED_POSTS = 0,
  LIKED_POSTS = 1,
  POSTS = 2,
}

const pageInitialState: PaginationType = {
  skip: 0,
  take: 10,
};
const postControlInitial = {
  post: {
    page: pageInitialState,
    isComplete: false,
  },
  savedPost: {
    page: pageInitialState,
    isComplete: false,
  },
  likePost: {
    page: pageInitialState,
    isComplete: false,
  },
};

export default function Profile() {
  const IMG_HEIGHT = useMemo(() => 240, []);
  const scrollY = useRef(new Animated.Value(0));

  //profile image view 
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [mediaModalData, setMediaModalData] = useState<MediaViewModalDataType>();
const profileImageUrl = useAppSelector(s=>s.userInformation.userBasicInfo.avatarUrl)

  const [posts, setPosts] = useState<PostDataType[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostDataType[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostDataType[]>([]);

  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(ProfileTabEnum.LIKED_POSTS);
  const [refreshing, setRefreshing] = useState(false);

const [postControl, setPostControl] = useState(postControlInitial)

  const { colorScheme } = useColorScheme();
  const dispatch = useAppDispatch();
  const router = useRouter();

  // get user profile data
  async function getProfileData() {
    try {
      const res = await cAxios.get(`${apiRoutes.getUserProfileData}`);
      console.log("data from api: " ,res.data)
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

const profileImagePressHandler =()=>{
  setMediaModalData({
    url:profileImageUrl===null?"@/src/assets/images/avatar-null.jpg"
    :profileImageUrl,
    mimeType:"image"
  })
  setMediaModalVisible(true)
} 



  const getPersonalPostData = async () => {
    try {
      setLoading(true);
      const res = await cAxios.get(
        `${apiRoutes.getUserProfileTabPosts}?skip=${postControl.post.page.skip}&take=${postControl.post.page.take}`
      );
      if (res.data.length === 0) {
        setPostControl((prev)=>({...prev,post:{...prev.post,isComplete:true}}))
      } else {
        setPosts((prev) => [...prev, ...res.data]);
        setPostControl((prev)=>({...prev,post:{...prev.post,page:{...prev.post.page,skip:prev.post.page.skip+prev.post.page.take}}}))

      }
      setLoading(false);
    } catch (error) {
      console.log("error from fetching user profile tab posts", error);
      ErrorHandler.handle(error);
    } finally {
    
      setLoading(false);
    }
  };
  const getPersonalLikedPostData = async () => {
    try {
      setLoading(true);
      const res = await cAxios.get(
        `${apiRoutes.getUserProfileTabLikedPosts}?skip=${postControl.likePost.page.skip}&take=${postControl.likePost.page.take}`
      );
      if (res.data.length === 0) {
        setPostControl((prev)=>({...prev,likePost:{...prev.likePost,isComplete:true}}))
      } else {
        setLikedPosts((prev) => [...prev, ...res.data]);
        setPostControl((prev)=>({...prev,likePost:{...prev.likePost,page:{...prev.likePost.page,skip:prev.likePost.page.skip+prev.likePost.page.take}}}))

      }
      setLoading(false);
    } catch (error) {
      console.log("error from fetching user profile tab like posts", error);
      ErrorHandler.handle(error);
    } finally {
    
      setLoading(false);
    }
  };
  const getPersonalSavedPostData = async () => {
    try {
      setLoading(true);
      const res = await cAxios.get(
        `${apiRoutes.getUserProfileTabSavedPosts}?skip=${postControl.savedPost.page.skip}&take=${postControl.savedPost.page.take}`
      );
      if (res.data.length === 0) {
        setPostControl((prev)=>({...prev,savedPost:{...prev.savedPost,isComplete:true}}))
      } else {
        setSavedPosts((prev) => [...prev, ...res.data]);
        setPostControl((prev)=>({...prev,savedPost:{...prev.savedPost,page:{...prev.savedPost.page,skip:prev.savedPost.page.skip+prev.savedPost.page.take}}}))

      }
      setLoading(false);
    } catch (error) {
      console.log("error from fetching user profile tab saved posts", error);
      ErrorHandler.handle(error);
    } finally {
    
      setLoading(false);
    }
  };

  const canFetchMore = async () => {
    if (tabIndex === ProfileTabEnum.POSTS) {
      if (postControl.post.isComplete) return;
      await getPersonalPostData()
    }else  if (tabIndex === ProfileTabEnum.LIKED_POSTS) {
      if (postControl.likePost.isComplete) return;
      await getPersonalLikedPostData()
    }else  if (tabIndex === ProfileTabEnum.SAVED_POSTS) {
      if (postControl.savedPost.isComplete) return;
      await getPersonalSavedPostData()
    }
  }

  const onEndReachedHandler = _.debounce(async () => {
   
    console.log("onEndReachedHandler called");
    if(loading) return
    await canFetchMore();
  },500)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPostControl(postControlInitial)
      setPosts([]);
      setLikedPosts([]);
       setSavedPosts([]);
    await getProfileData()
    setRefreshing(false);
  }, []);
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
            : tabIndex === ProfileTabEnum.LIKED_POSTS
            ? likedPosts
            : savedPosts
        }
        ListHeaderComponent={() => (
          <View className="">
            {/* bg image  */}
            <Pressable 
            onLongPress={profileImagePressHandler}
            >
            <Animated.Image
              style={[{ height: IMG_HEIGHT }, imageAnimatedStyle]}
              className="w-full "
              source={profileImageUrl===null?require("@/src/assets/images/avatar-null.jpg"):
                {uri:profileImageUrl}
              }
              />
              </Pressable>
            <UserProfileInfo />
            <Tabs tabIndex={tabIndex} setTabIndex={setTabIndex} />
          </View>
        )}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY.current } } }],
          { useNativeDriver: true }
        )}
        onEndReached={onEndReachedHandler}
        onEndReachedThreshold={0.5}
        keyExtractor={(item) => `${item}__${Math.random()}`}
        style={{
          backgroundColor:
            colorScheme === "dark"
              ? Colors.dark.background
              : Colors.light.background,
        }}
        numColumns={3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <FlatListRenderItem
            item={item}
            type={
              tabIndex === ProfileTabEnum.POSTS
                ? ProfileTabEnum.POSTS
                : tabIndex === ProfileTabEnum.LIKED_POSTS
                ? ProfileTabEnum.LIKED_POSTS
                : ProfileTabEnum.SAVED_POSTS
            }
          />
        )}
        ListEmptyComponent={<TabDataSkeleton tabIndex={tabIndex} />}
        ListFooterComponent={() => <ListFooterComponent loading={loading} />}
      />
      <MediaViewModal
        setVisible={setMediaModalVisible}
        visible={mediaModalVisible}
        ar={mediaModalData?.ar}
        mimeType={mediaModalData?.mimeType}
        url={mediaModalData?.url}
        videoUrl={mediaModalData?.videoUrl}
      />
    </>
  );
}

type FlatListRenderItemProps = {
  item: PostDataType;
  type: ProfileTabEnum;
};
const FlatListRenderItem: FC<FlatListRenderItemProps> = ({ item, type }) => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  if (type === ProfileTabEnum.POSTS) {
    return (
      <TouchableOpacity
        style={{ width: width / 3 }}
        className="aspect-[1/2] border border-border dark:border-borderDark rounded-md "
        key={item.id}
        onPress={() => router.push(`/(usefull)/postDetails/${item.id}`)}
      >
        <Image
          source={{
            uri: item.postMedias[0]?.url,
          }}
          className="w-full h-full object-cover bg-center"
        />
      </TouchableOpacity>
    );
  } else if (type === ProfileTabEnum.LIKED_POSTS) {
    return (
      <TouchableOpacity
        style={{ width: width / 3 }}
        className="aspect-[3/4] border border-border dark:border-borderDark rounded-md "
        key={item.id}
        onPress={() => router.push(`/(usefull)/postDetails/${item.id}`)}
      >
        <Image
          source={{
            uri: item.postMedias[0].url,
          }}
          className="w-full h-full object-cover bg-center"
        />
      </TouchableOpacity>
    );
  } else {
    return (
      <TouchableOpacity
        style={{ width: width / 3 }}
        className="aspect-[3/4] border border-border dark:border-borderDark rounded-md "
        key={item.id}
        onPress={() => router.push(`/(usefull)/postDetails/${item.id}`)}
      >
        <Image
          source={{
            uri: item.postMedias[0].url,
          }}
          className="w-full h-full object-cover bg-center"
        />
      </TouchableOpacity>
    );
  }
};

type ListFooterComponentProps = {
  loading: boolean;
};
const ListFooterComponent: FC<ListFooterComponentProps> = ({ loading }) => {
  const { colorScheme } = useColorScheme();
  if (loading) {
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
  const userRole  = useAppSelector((state) => state.auth.userRole);
const user = useAppSelector(s=>s.userInformation.userBasicInfo)
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
        <Pressable className="w-[40%] py-1.5 items-center bg-muted dark:bg-mutedDark rounded-md"
        onPress={()=>router.push("/(usefull)/(edit)/editProfileData")}
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

type TabsProps = {
  tabIndex: ProfileTabEnum;
setTabIndex: React.Dispatch<React.SetStateAction<ProfileTabEnum>>;
}
const Tabs:FC<TabsProps> = ({setTabIndex,tabIndex}) => {
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const userRole = useAppSelector(s=>s.auth.userRole);

  const AnimatedViewStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX:
            userRole === UserRoleEnum.NORMAL
              ? withTiming(
                tabIndex === ProfileTabEnum.LIKED_POSTS
                    ? 0
                    : width / 2 + (width / 100) * 2,
                  {
                    duration: 150,
                  }
                )
              : withTiming(
                tabIndex === ProfileTabEnum.POSTS
                    ? 0
                    : tabIndex === ProfileTabEnum.LIKED_POSTS
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
          name={tabIndex === 0 ? "bookmark" : "bookmark-outline"}
          size={36}
          onPress={() =>
            setTabIndex(ProfileTabEnum.SAVED_POSTS)
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
          name={tabIndex === 1 ? "heart" : "heart-outline"}
          size={36}
          onPress={() =>
            setTabIndex(ProfileTabEnum.LIKED_POSTS)
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
            name={tabIndex === 2 ? "grid" : "grid-outline"}
            size={32}
            onPress={() => setTabIndex(ProfileTabEnum.POSTS)}
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

const TabDataSkeleton = ({ tabIndex }: { tabIndex: ProfileTabEnum }) => {
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();

  const Content = ({ height, width }: { width: number; height: number }) => (
    <ContentLoader
      style={{ width, height }}
      viewBox={`0 0 ${width} ${height}`}
      animate={true}
      backgroundColor={
        colorScheme === "dark" ? Colors.dark.muted : Colors.light.border
      }
      foregroundColor={
        colorScheme === "dark"
          ? Colors.dark.primaryForeground
          : Colors.light.muted
      }
    >
      <Rect x="0" y="0" rx="4" ry="4" width={width} height={height} />
    </ContentLoader>
  );
  return (
    <View className="flex-row flex-wrap items-center justify-between">
      {Array.from({ length: 4 }, () => Math.random()).map((_) => {
        if (tabIndex === ProfileTabEnum.POSTS) {
          return <Content key={_} height={(width / 3) * 2} width={width / 3} />;
        } else if (tabIndex === ProfileTabEnum.LIKED_POSTS) {
          return (
            <Content key={_} height={(width / 3) * (4 / 3)} width={width / 3} />
          );
        } else {
          return (
            <Content key={_} height={(width / 3) * (4 / 3)} width={width / 3} />
          );
        }
      })}
    </View>
  );
};
