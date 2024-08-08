import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Button,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { homePageData } from "@/src/constants/data";
import React, { useEffect, useRef, useState } from "react";
import { ResizeMode, Video } from "expo-av";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import {
  Link,
  router,
  useNavigation,
  useRouter,
  useSegments,
} from "expo-router";
import { useDispatch } from "react-redux";
import {
  setHomePageData,
  setPostDetailsData,
  TPostUserComments,
  TPostUserLikes,
} from "@/src/store/slices/postData";
import { useAppSelector } from "@/src/hooks/redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function Home() {
  const auth = useAppSelector(state=>state.auth)
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setHomePageData(homePageData));
  }, []);

  return (
    <View className="bg-background dark:bg-backgroundDark flex-1 items-center justify-normal gap-y-4 ">
      <Button  title="show tokens" onPress={async()=>{
        const refreshToken = await AsyncStorage.getItem("refreshToken")
        const accessToken = await AsyncStorage.getItem("accessToken")
        console.log({refreshToken,accessToken})
      }}/>
      <FlatList
        className="w-full  py-4 "
        data={homePageData}
        renderItem={HomePageItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

export const HomePageItem = ({ item }: { item: (typeof homePageData)[0] }) => {
  return (
    <>
      <View
        className="bg-secondary dark:bg-cardDark border-y border-y-border dark:border-y-borderDark 
      w-full py-2
      "
      >
        <HomePagePostUserItem item={item.postBy} date={item.date} />
        <HomePagePostTextItem item={item.postText} />
        <HomePagePostMediaItem
          item={{ media: item.postMedia, postId: item.id }}
        />
        <HomePagePostUsersInteractions
          item={{
            postId: item.id,
            likes: item.likesBy,
            comments: item.commentsBy,
          }}
        />
      </View>
      <View className="w-full h-5 bg-transparent" />
    </>
  );
};

export const HomePagePostUserItem = ({
  item,
  date,
}: {
  item: { username: string; profilePic: string; isOnline: boolean };
  date: string;
}) => {
  return (
    <View className="w-full px-4 flex-row items-center justify-normal gap-x-3">
      <View
        className={`w-14 h-14  rounded-full overflow-hidden  
      ${
        item.isOnline
          ? "border-2 border-green-600 dark:border-green-500"
          : "border-0"
      }
      `}
      >
        <Image
          source={{ uri: item.profilePic }}
          alt="profileImage"
          className={`w-full h-full bg-center object-cover `}
        />
      </View>
      <View className="">
        <Text className="text-primary dark:text-primaryDark text-lg font-semibold">
          {item.username}
        </Text>
        <Text className=" text-gray-500 dark:text-gray-400 text-xs ">
          {date}
        </Text>
      </View>
    </View>
  );
};

export const HomePagePostTextItem = ({ item }: { item: string }) => {
  const [seeMore, setSeeMore] = useState(false);
  return (
    <View className="px-4 pt-4">
      {item.length > 200 ? (
        <Text className="text-primary dark:text-primaryDark">
          {seeMore ? item : item.slice(0, 200)}{" "}
          <TouchableOpacity onPress={() => setSeeMore(!seeMore)}>
            <Text className="text-gray-500 dark:text-gray-400">
              {" "}
              {seeMore ? "see less" : "... see more"}
            </Text>
          </TouchableOpacity>
        </Text>
      ) : (
        <Text className="text-primary dark:text-primaryDark">{item}</Text>
      )}
    </View>
  );
};

export const HomePagePostMediaItem = ({
  item,
}: {
  item: { media: { type: string; url: string }[]; postId: number };
}) => {
  const dispatch = useDispatch();
  const navigationHandler = () => {
    if (item.media.length == 1 && item.media[0].type == "video") {
      return;
    }
    const data = homePageData.find((data) => data.id == item.postId);
    if (data) {
      dispatch(setPostDetailsData(data));
      router.push("/postDetails");
    }
  };
  return (
    <TouchableHighlight onPress={() => navigationHandler()}>
      <View className=" flex-row  flex-wrap gap-[1%] overflow-hidden">
        {item.media.slice(0, 4).map((m, _) => (
          <View
            className={`${
              item.media.length > 1 ? "w-[49%]" : "w-full"
            } h-[200px]`}
          >
            <HomePagePostMediaItemEach key={_} item={m} />
          </View>
        ))}
      </View>
    </TouchableHighlight>
  );
};

export const HomePagePostUsersInteractions = ({
  item,
}: {
  item: {
    postId: number;
    likes: TPostUserLikes;
    comments: TPostUserComments;
    shouldLikeCommentCount?: boolean;
  };
}) => {
  const { colorScheme } = useColorScheme();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmark, setIsBookmark] = useState(false);

  const dispatch = useDispatch();
  const navigationHandler = () => {
    const data = homePageData.find((data) => data.id == item.postId);
    if (data) {
      dispatch(setPostDetailsData(data));
      router.navigate("/postComments");
    }
  };
  const segment = useSegments();

  function commentIconClickHandler() {
    if (segment[segment.length - 1] == "postDetails") {
      router.replace("/postComments");
    } else {
      router.push("/postComments");
    }
  }
  return (
    <View className="w-full ">
      {item.shouldLikeCommentCount ? null : (
        <View className="flex-row items-center px-[2%] h-10">
          <TouchableOpacity
            className="flex-1 flex-row items-center"
            onPress={() => navigationHandler()}
          >
            <View className="flex-row items-center">
              {item.likes.slice(0, 3).map((like) => (
                <Text key={Math.random()}>{like.likeType}</Text>
              ))}
            </View>
            <Text className="text-primary dark:text-primaryDark">
              {item.likes.length > 0
                ? item.likes.length > 1
                  ? item.likes[0].username +
                    " and " +
                    (item.likes.length - 1) +
                    " others "
                  : item.likes[0].username
                : "0 likes"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-primary dark:text-primaryDark">
              {item.comments.length + " comments"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View className="bg-border dark:bg-borderDark w-[75%] mx-auto h-[1px] " />
      <View className="flex-row items-center justify-around w-full -mb-2 h-16">
        <View className="items-center">
          <Ionicons
            name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
            size={30}
            onPress={() => setIsLiked(!isLiked)}
            color={
              colorScheme == "dark"
                ? isLiked
                  ? "#0000ff"
                  : Colors.dark.primary
                : isLiked
                ? "#0000ff"
                : Colors.light.primary
            }
          />
          <Text className="text-gray-500 dark:text-gray-400 ">
            {item.shouldLikeCommentCount
              ? item.likes.length.toString() + " Likes"
              : "Like"}
          </Text>
        </View>
        <View className="items-center">
          <Ionicons
            name={"chatbox-outline"}
            size={30}
            onPress={commentIconClickHandler}
            color={
              colorScheme == "dark" ? Colors.dark.primary : Colors.light.primary
            }
          />
          <Text className="text-gray-500 dark:text-gray-400 ">
            {item.shouldLikeCommentCount
              ? item.comments.length.toString() + " Comments"
              : "Comment"}
          </Text>
        </View>
        <View className="items-center">
          <Ionicons
            name={isBookmark ? "bookmark" : "bookmark-outline"}
            size={30}
            onPress={() => setIsBookmark(!isBookmark)}
            color={
              colorScheme == "dark" ? Colors.dark.primary : Colors.light.primary
            }
          />
          <Text className="text-gray-500 dark:text-gray-400 ">Save</Text>
        </View>
        <View className="items-center">
          <Ionicons
            name={"share-social-outline"}
            size={30}
            onPress={() => {}}
            color={
              colorScheme == "dark" ? Colors.dark.primary : Colors.light.primary
            }
          />
          <Text className="text-gray-500 dark:text-gray-400 ">Share</Text>
        </View>
      </View>
    </View>
  );
};

export const HomePagePostMediaItemEach = ({
  item,
}: {
  item: { type: string; url: string };
}) => {
  const [aspectRatio, setAspectRatio] = useState("auto");
  if (item.type == "image") {
    useEffect(() => {
      Image.getSize(
        item.url,
        (originalW, originalH) => {
          setAspectRatio(
              `${(originalW / originalH)}`
            );
        },
        (error) => {
          console.log(`Couldn't get the image size: ${error.message}`);
        }
      );
    }, []);
    return (
      <Image
        source={{ uri: item.url }}
        style={{ aspectRatio }}
        className={`bg-cover object-center`}
      />
    );
  } else if (item.type == "video") {
    const [status, setStatus] = useState({});
    const videoRef = useRef<null>(null);
    // console.log({status})
    return (
      <Video
        className="aspect-video"
        ref={videoRef}
        // onLoad={(d)=>console.log(d)}
        source={{ uri: item.url }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        // onTouchMove={()=>{videoRef.current?.pauseAsync()}}
      />
    );
  }
};
