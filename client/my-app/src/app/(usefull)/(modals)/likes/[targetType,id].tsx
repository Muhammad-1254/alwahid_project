import {
  View,
  Text,
  FlatList,
  ColorSchemeName,
  Dimensions,
  useWindowDimensions,
  TouchableHighlight,
  Pressable,
  Image,
  RefreshControl,
} from "react-native";
import React, { FC, useCallback, useRef, useState } from "react";
import _ from "lodash";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { Colors } from "@/src/constants/Colors";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { apiRoutes } from "@/src/constants/apiRoutes";
import { useLocalSearchParams } from "expo-router";
import { useAppSelector } from "@/src/hooks/redux";
import cAxios from "@/src/lib/cAxios";
import ErrorHandler from "@/src/lib/ErrorHandler";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import { getPostLikeIcon } from "@/src/lib/utils";
import { PostLikeEnum, PostLikeTargetEnum } from "@/src/types/post";

type UserType = {
  id: string;
  firstname: string;
  lastname: string;
  avatarUrl: string | null;
  userRoles: string[];
  isActive: boolean;
  isSpecialUser: boolean;
};

type likeDataType = {
  createdAt: string;
  id: string;
  likeType: PostLikeEnum;
  user: UserType;
};
const pageInitialState = {
  skip: 0,
  take: 20,
};

export default function PostId() {

  const {targetType, id} = useLocalSearchParams();
  console.log("searchParams: ", id, targetType);

  const [likes, setLikes] = useState<likeDataType[]>([]);
  const [isLoadComplete, setIsLoadComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isLatest = useRef(true);
  const page = useRef(pageInitialState);

  const likeUserNavigatorHandler = () => {};

  const canFetchMore = async () => {
    if (loading) return;

    try {
      setLoading(true);
      
      const api = targetType===
      PostLikeTargetEnum.POST? `${apiRoutes.getAllPostLikes}/${id}?isLatest=${isLatest.current}&skip=${page.current.skip}&take=${page.current.take}`
      :`${apiRoutes.getAllPostCommentLikes}/${id}?isLatest=${isLatest.current}&skip=${page.current.skip}&take=${page.current.take}`
      const res = await cAxios.get(api);
      if (res.status === 200 && res.data.length === 0) {
        setIsLoadComplete(true);
        return;
      }
      if (res.data.length < page.current.take) {
        setIsLoadComplete(true);
      }
      setLikes((prev) => [...prev, ...res.data]);
      // updating page values
      page.current.skip = page.current.skip + page.current.take;
    } catch (error) {
      console.error(`error from ${targetType} likes loadMore: `,  error);
      ErrorHandler.handle(error);
    } finally {
      setLoading(false);
    }
  };
  const onEndReachedHandler = _.debounce(async () => {
    // if isLoadComplete is true then return
    console.log("like modal onEndReachedHandler: ", isLoadComplete);
    if (isLoadComplete) return;
    await canFetchMore();
  }, 1250);

  const sortDataHandler = (latest: boolean) => {
    isLatest.current = latest;
    page.current.skip = 0;
    setIsLoadComplete(false);
    setLikes([]);
  };
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    page.current.skip = 0;
     setIsLoadComplete(false)
      setLikes([]);
    setRefreshing(false);
  }, []);

  return (
    <>
      <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark">
        <FlatList
          className="flex-1  bg-muted dark:bg-mutedDark "
          data={likes}
          onEndReached={onEndReachedHandler}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ rowGap: 10, paddingBottom: 20 }}
          keyExtractor={(item) => `${item.id}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={() => (
            <FlatListHeaderItem
              latest={isLatest.current}
              loading={loading}
              targetType={Array.isArray(targetType)? targetType[0]: targetType}
              sortDataHandler={sortDataHandler}
            />
          )}
          ListFooterComponent={() => (
            <FlatListFooterItem isLoadComplete={isLoadComplete} dataLen={likes.length} />
          )}
          ListEmptyComponent={
            <TabDataSkeleton
              isLoadComplete={isLoadComplete}
              commentsLength={likes.length}
              targetType={Array.isArray(targetType)? targetType[0]: targetType}
            />
          }
          renderItem={({ item }) => (
            <FlatListRenderItem
              item={item}
              likeUserNavigatorHandler={likeUserNavigatorHandler}
            />
          )}
        />
      </SafeAreaView>
    </>
  );
}

type FlatListRenderItemProps = {
  item: likeDataType;
  likeUserNavigatorHandler: (userId: string) => void;
};

const FlatListRenderItem: FC<FlatListRenderItemProps> = ({
  item,
  likeUserNavigatorHandler,
}) => {
  const userId = useAppSelector((s) => s.userInformation.userBasicInfo.userId);
  return (
    <View className="w-full h-[72px]  flex-row items-center  px-3 ">
      {/*  if long press than navigate to user profile */}
      <Pressable
        className=""
        onPress={() => likeUserNavigatorHandler(item.user.id)}
      >
        <Image
          className="w-14 h-14 rounded-full"
          resizeMethod="resize"
          resizeMode="cover"
          source={
            item.user.avatarUrl
              ? { uri: item.user.avatarUrl }
              : require("@/src/assets/images/avatar-null.jpg")
          }
        />
      </Pressable>
      <View className="flex-1 flex-row items-center justify-between">
        <View className="ml-4 h-10 justify-between ">
          <View className="flex-row items-center ">
            <Text className="text-primary dark:text-primaryDark text-base mr-1.5">
         {item.user.id === userId ? "You" : `${item.user.firstname} ${item.user.lastname}`}
            </Text>
            <Text className="text-primary dark:text-primaryDark ">
              {item.user.isSpecialUser ? "🌟" : ""}
            </Text>
          </View>
          <Text className="text-primary dark:text-primaryDark font-normal opacity-80">
            {moment(item.createdAt).fromNow()}
          </Text>
        </View>
          <Image
          className="w-11 h-11"
          resizeMethod="resize"
          resizeMode="cover"
          source={getPostLikeIcon(item.likeType)}
          />
      </View>
    </View>
  );
};

type FlatListHeaderItemProps = {
  loading: boolean;
  latest: boolean;
  targetType: string;
  sortDataHandler: (latest: boolean) => void;

};

const FlatListHeaderItem: FC<FlatListHeaderItemProps> = ({
  sortDataHandler,
  latest,
  loading,
  targetType
}) => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="relative flex-row items-center justify-between px-4 pt-8 mb-4">
      <Text className="text-primary dark:text-primaryDark text-xl">{targetType=== PostLikeTargetEnum.POST?"Likes":"Comment Likes"}</Text>
      <TouchableHighlight
        className="flex-row items-center "
        onPress={() => sortDataHandler(!latest)}
        disabled={loading}
      >
        <>
          <Text className="text-primary dark:text-primaryDark pr-2">
            {latest ? "Latest" : "Oldest"}
          </Text>
          <Ionicons
            name={"caret-down"}
            size={20}
            color={
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary
            }
          />
        </>
      </TouchableHighlight>
    </View>
  );
};

const FlatListFooterItem = ({
  isLoadComplete,
  dataLen
}: {
  isLoadComplete: boolean;
  dataLen:number
}) => {
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const height = 130;
  if (!isLoadComplete) {
    return (
      <SingleSkeletonContentLoader
        colorScheme={colorScheme}
        height={height}
        width={width}
      />
    );
  } else {
    return (
      <View className="w-full items-center justify-center mt-5 ">
        <Text className="text-primary dark:text-primaryDark opacity-70">
      {dataLen ===0?"":"No more likes"}
        </Text>
      </View>
    );
  }
};

const TabDataSkeleton = ({
  isLoadComplete,
  commentsLength,
  targetType
}: {
  isLoadComplete: boolean;
  commentsLength: number;
  targetType: string;
}) => {
  const { colorScheme } = useColorScheme();
  const { width } = Dimensions.get("screen");
  const height = 130;

  if (commentsLength === 0 && isLoadComplete) {
    return (
      <View className="w-full items-center justify-center">
        <Text className="text-primary dark:text-primaryDark">
      No likes yet
        </Text>
      </View>
    );
  }
  return (
    <View className="flex-row flex-wrap items-center justify-between ">
      {Array.from({ length: 4 }, () => Math.random()).map((_) => {
        return (
          <SingleSkeletonContentLoader
            key={_}
            colorScheme={colorScheme}
            height={height}
            width={width}
            styles={{ marginBottom: 20 }}
          />
        );
      })}
    </View>
  );
};

type SingleSkeletonContentLoaderProps = {
  width: number;
  height: number;
  colorScheme: ColorSchemeName;
  styles?: object;
};
const SingleSkeletonContentLoader: FC<SingleSkeletonContentLoaderProps> = ({
  colorScheme,
  height,
  width,
  styles,
}) => {
  return (
    <ContentLoader
      style={{ width, height, ...styles }}
      viewBox={`0 0 ${width} ${height}`}
      animate={true}
      backgroundColor={
        colorScheme === "dark" ? Colors.dark.card : Colors.light.card
      }
      foregroundColor={
        colorScheme === "dark"
          ? Colors.dark.cardForeground
          : Colors.light.cardForeground
      }
    >
      <Circle x="0" y="0" cx="42" cy="42" r="32" />
      <Rect x="84" y="0" rx="16" ry="16" width={width - 100} height={height} />
    </ContentLoader>
  );
};
