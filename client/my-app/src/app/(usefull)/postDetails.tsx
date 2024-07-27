import {
  View,
  Text,
  Image,
  Dimensions,
  FlatList,
  ScrollView,
  TouchableHighlight,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TPostMedia,
  TPostUserComments,
  TPostUserLikes,
} from "@/src/store/slices/postData";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useAppSelector } from "@/src/hooks/redux";
import { homePageData } from "@/src/constants/data";
// import MediaSlider from "@/src/components/elements/ImageSlider";
import ImageViewer from "react-native-image-zoom-viewer";
import { HomePagePostTextItem, HomePagePostUsersInteractions } from "../(tabs)";
import { TouchableWithoutFeedback } from "react-native";
import Divider from "@/src/components/elements/Divider";
import { ResizeMode, Video } from "expo-av";
export default function PostDetails() {
  const [data, setData] = useState(homePageData[1]);
  const [showText, setShowText] = useState(false);
  const { colorScheme } = useColorScheme();

  const router = useRouter();
  const postData = useAppSelector(
    (state) => state.postDetail.value.postDetailsScreen
  );
  useEffect(() => {
    if (postData.postMedia.length >= 1) {
      setData(postData);
    } else {
      setData(homePageData[1]);
    }
  }, [postData]);
  return (
    <SafeAreaView
      className="relative bg-background dark:bg-backgroundDark 
 w-full h-full"
    >
      {/* navigation  */}
      <View
        className=" z-10 bg-background dark:bg-backgroundDark opacity-50 
w-full h-20   flex-row items-center justify-between px-4 "
      >
        <Ionicons
          name="arrow-back"
          size={32}
          onPress={() => router.canGoBack() && router.back()}
          color={
            colorScheme == "dark" ? Colors.dark.primary : Colors.light.primary
          }
        />
        <Ionicons
          name="ellipsis-vertical"
          size={32}
          color={
            colorScheme == "dark" ? Colors.dark.primary : Colors.light.primary
          }
        />
      </View>

      {/* media content  */}
      <MediaSlider
        media={
          data.postMedia.length >= 1
            ? data.postMedia
            : homePageData[1].postMedia
        }
      />
      <View className="w-full absolute bottom-2 ">
        <PostText data={{ text: data.postText, showText, setShowText }} />
        <HomePagePostUsersInteractions
          item={{
            postId: data.id,
            comments: data.commentsBy,
            likes: data.likesBy,
            shouldLikeCommentCount: true,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export const MediaSlider = ({ media }: { media: TPostMedia }) => {
  const [video, setVideo] = useState<{present:boolean, url:string[]}>({present:false, url:[]})
  
  
  const { height } = Dimensions.get("window");
  return (
   
    <View
      style={{ height: height - 100 }}
      className={`w-full   absolute top-10 left-0 
  `}
    >
     
    
   
     <ImageViewer
    
      imageUrls={media.map(item=>({url:item.url}))}
      enableImageZoom
      enableSwipeDown
      onSwipeDown={() => console.log("swiped down")}
      useNativeDriver
    />
     
     {/* <View>

      {
        video.present? 
        <TouchableHighlight className="z-10 absolute border border-red-500">
        <View>

    <Video
        className="aspect-video"
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        
        /> 
        </View>
      </TouchableHighlight>
      :null}
    </View> */}

    </View>
  );
};

const PostText = ({
  data,
}: {
  data: {
    text: string;
    showText: boolean;
    setShowText: React.Dispatch<React.SetStateAction<boolean>>;
  };
}) => {
  return (
    <View   className={`bg-background dark:bg-backgroundDark  px-4 pb-3  
    
    ${data.showText?"opacity-90":"opacity-100"}`}>
      
   
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={data.showText}
        className={`${
          data.showText ? "min-h-[40vh] max-h-[40vh]" : "min-h-0 max-h-10"}   duration-200 `}
      >
      {data.text.length > 80 ? (
        <Text className="text-primary dark:text-primaryDark">
          {data.showText ? data.text : data.text.slice(0, 80)}{" "}
          <TouchableWithoutFeedback onPress={() => data.setShowText(!data.showText)}>
            <Text className="text-gray-500 dark:text-gray-400">
              {" "}
              {data.showText ? "\n\tsee less" : "... see more"}
            </Text>
          </TouchableWithoutFeedback>
        </Text>
      ) : (
        <Text className="text-primary dark:text-primaryDark">{data.text}</Text>
      )}
      </ScrollView>
    </View>
  );
};
