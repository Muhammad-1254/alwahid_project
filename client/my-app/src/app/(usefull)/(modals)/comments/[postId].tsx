import Modal from "@/src/components/elements/modal";
import ModalDrawerUI from "@/src/components/elements/ModalDrawerUI";
import { apiRoutes } from "@/src/constants/apiRoutes";
import { Colors } from "@/src/constants/Colors";
import cAxios from "@/src/lib/cAxios";
import { dummyCommentLikes, PostLikeEnum } from "@/src/types/post";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import _, { head, set } from "lodash";
import moment from "moment";
import { useColorScheme } from "nativewind";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  ColorSchemeName,
  Dimensions,
  TouchableHighlight,
  TouchableHighlightBase,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Text, View, FlatList, Image, Pressable } from "react-native";
import { HandlerStateChangeEvent, LongPressGestureHandler, LongPressGestureHandlerEventPayload, State } from "react-native-gesture-handler";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { getPostLikeIcon } from "@/src/lib/utils";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableWithoutFeedback } from "react-native";

type CommentModalProps = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  postId: string;
};

type CommentsType = {
  id: string;
  createdAt: string;
  content: string;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    avatarUrl: string | null;
    isActive: boolean;
  };
  commentLikes: {
    likesCount: string;
    likeType: PostLikeEnum;
  }[];
  currentUserLike: {
    likeType: PostLikeEnum;
    userId: string;
    commentId: string;
  } | null;
  totalCommentLikesCount: number;
};
const pageInitialState = {
  skip: 0,
  take: 6,
};
const CommentModal: FC<CommentModalProps> = () => {
  const { postId } = useLocalSearchParams();
  
  // for modal
  const [likeModalVisible, setLikeModalVisible] =useState(false)
  const [likeModalPosition,setLikeModalPosition ] = useState({x:0,y:0})
  // ....
  
  // for commentLike 
  const selectedCommentForLikeId = useRef<string|null>(null)
  // ....
  
  // for flatListHandle
  const comments = useRef<CommentsType[]>([]);
  const [isLoadComplete, setIsLoadComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const page = useRef(pageInitialState);
  const isLatest = useRef(true);
// ....
  const canFetchMore = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const api = `${apiRoutes.getAllPostComments}/${postId}?isLatest=${isLatest.current}&skip=${page.current.skip}&take=${page.current.take}`;
      console.log({ api });
      const res = await cAxios.get(api);
      if (res.status === 200 && res.data.length === 0) {
        setIsLoadComplete(true);
        return;
      }
      res.data.forEach((element:any) => {
        console.log("fetch data name: ", element.content);
      });
      if (comments.current.length === 0) {
        // setComments(res.data);
        comments.current = res.data;
      } else {
        // setComments([...comments, ...res.data]);
        comments.current = [...comments.current, ...res.data];
      }
      // updating page values
      page.current.skip = page.current.skip + page.current.take;
    } catch (error) {
      console.error("error from comments loadMore: ", error);
    } finally {
      setLoading(false);
    }
  };
  const onEndReachedHandler = _.debounce(async () => {
    // if isLoadComplete is true then return
    console.log("comment modal onEndReachedHandler: ", isLoadComplete);
    if (isLoadComplete) return;
    await canFetchMore();
  }, 1250);

  useEffect(() => {}, [comments.current]);

  const sortDataHandler = (latest: boolean) => {
    console.log("sortDataHandler");
    console.log("latest: ", latest);
    isLatest.current = latest;
    setIsLoadComplete(() => false);
    page.current.skip = 0;
    comments.current = [];
  };
  const commentLikeHandler = async (likeType:PostLikeEnum) => {
    // checking if commentId not then return
    if(selectedCommentForLikeId.current === null)return
    console.log("commentLikeHandler clicked")
    console.log({selectedCommentForLikeId})
    console.log({likeType})

  // TODO: complete this like btn by add, patch or delete  
  function addLikeToCurrentData(){
    comments.current.map((comment)=>{
      if(comment.id === selectedCommentForLikeId.current){
        if(comment.currentUserLike){
          comment.currentUserLike.likeType = likeType
        }else{
          comment.currentUserLike={
            userId:"",
            commentId:selectedCommentForLikeId.current,
            likeType
          }
        }
        console.log('check add or updated one data')
      }
    })
  }  
  
   // first check in data that like is exist or not
   const commentsFound = comments.current.find(comment=>comment.id === selectedCommentForLikeId.current)
try {
  if(commentsFound){
     if(!commentsFound.currentUserLike){ // checks if currentUserLike don't like then simple hit api and then return
      const res = await cAxios.post(apiRoutes.createPostCommentLike,{commentId:selectedCommentForLikeId, likeType})
      
     }
   }
  
} catch (error) {
  
}
    
    
    // setLikeModalVisible(false)


    

  };
  const commentUserNavigatorHandler = async (userId: string) => {
    // item.user.id
  };
  return (
    <>
      <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark">
        <FlatList
          className="flex-1  bg-muted dark:bg-mutedDark "
          data={comments.current}
          onEndReached={onEndReachedHandler}
          onEndReachedThreshold={0.5}
          keyExtractor={(item) => `${item.id}`}
          contentContainerStyle={{ rowGap: 10, paddingBottom: 20 }}
          ListHeaderComponent={() => (
            <FlatListHeaderItem
              latest={isLatest.current}
              loading={loading}
              sortDataHandler={sortDataHandler}
            />
          )}
          ListFooterComponent={() => (
            <FlatListFooterItem isLoadComplete={isLoadComplete} />
          )}
          ListEmptyComponent={
            <TabDataSkeleton
              noCommentsFound={comments.current.length === 0 && isLoadComplete}
            />
          }
          renderItem={({ item }) => (
            <FlatListRenderItem
              item={item}
              setLikeModalPosition={setLikeModalPosition}
              setLikeModalVisible={setLikeModalVisible}
              selectedCommentForLikeId={selectedCommentForLikeId}
              commentUserNavigatorHandler={commentUserNavigatorHandler}
            />
          )}
        />
        <ChooseLikeTypeModal 
      modalPosition={likeModalPosition}
      visible={likeModalVisible}
      setVisible={setLikeModalVisible}
      commentLikeHandler={commentLikeHandler}
        />
      </SafeAreaView>
    </>
  );
};

export default CommentModal;

type FlatListHeaderItemProps = {
  loading: boolean;
  latest: boolean;
  sortDataHandler: (latest: boolean) => void;
};

const FlatListHeaderItem: FC<FlatListHeaderItemProps> = ({
  sortDataHandler,
  latest,
  loading,
}) => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="relative flex-row items-center justify-between px-4 pt-8 mb-4">
      <Text className="text-primary dark:text-primaryDark">Comments</Text>
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
}: {
  isLoadComplete: boolean;
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
          No more comments found
        </Text>
      </View>
    );
  }
};
type FlatListRenderItemProps = {
  item: CommentsType;
  commentUserNavigatorHandler: (userId: string) => Promise<void>;
  setLikeModalVisible:React.Dispatch<React.SetStateAction<boolean>>
  selectedCommentForLikeId: React.MutableRefObject<string | null>
  setLikeModalPosition: React.Dispatch<React.SetStateAction<{
    x: number;
    y: number;
}>>
};
const FlatListRenderItem: FC<FlatListRenderItemProps> = ({
  item,
  setLikeModalVisible,
  commentUserNavigatorHandler,
  setLikeModalPosition,
  selectedCommentForLikeId
}) => {
  const likeBtnRef = useRef<View>(null)
const handleLongPressLikeBtn = useCallback((event: HandlerStateChangeEvent<LongPressGestureHandlerEventPayload>)=>{
  console.log("long press handler called")
  if(event.nativeEvent.state === State.ACTIVE){
    likeBtnRef.current?.measure((fx, fy, width, height, px, py)=>{
      setLikeModalPosition({x:px, y:py+height})
      selectedCommentForLikeId.current = `${item.id}`
      setLikeModalVisible(true)
    })
  }
},[])
  return (
    <View className="w-full flex-row items-start  px-3">
      {/*  if long press than navigate to user profile */}
      <Pressable
        className="pr-2 mt-2.5"
        onLongPress={() => commentUserNavigatorHandler(item.user.id)}
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

      <View className="flex-1">
        <View className="items-start px-3 py-4  bg-cardDark rounded-2xl rounded-tl-none">
          <View className="flex-row items-center justify-between w-full">
            <Text className="text-primary dark:text-primaryDark capitalize">
              {item.user.firstname}&nbsp;{item.user.lastname}
            </Text>
            <View
              className={`w-1 h-1 rounded-full mr-2 ${
                item.user.isActive
                  ? "bg-green-500 dark:bg-green-400 "
                  : " bg-gray-500 dark:bg-gray-400"
              }`}
            />
          </View>
          <Text className="text-primary dark:text-primaryDark opacity-70 text-xs">
            {item.createdAt}
          </Text>
          <Text className="text-primary dark:text-primaryDark mt-4">
            {item.content}
          </Text>
        </View>
        <View className="flex-row items-center ">
          {/* comment like and reply btn */}
          <View className="flex-row items-center ml-2">
            <LongPressGestureHandler onHandlerStateChange={handleLongPressLikeBtn}>

            <View
            ref={likeBtnRef}
              // onPress={() => commentLikeHandler(item.id)}
              className="pr-2.5 py-1.5"
            >
              {item.currentUserLike ? (
                <Image
                  className="w-6 h-6  "
                  source={getPostLikeIcon(item.currentUserLike.likeType)}
                />
              ) : (
                <Text className="text-primary dark:text-primaryDark  ">
                  Like
                </Text>
              )}
            </View>
            </LongPressGestureHandler>

            <Text className="text-primary dark:text-primaryDark text-base">
              |
            </Text>
            <TouchableHighlight className="pl-2.5 py-1.5">
              <Text className="text-primary dark:text-primaryDark  ">
                Reply
              </Text>
            </TouchableHighlight>
          </View>
          {/* user like ui */}
          {item.commentLikes.length > 0 && (
            <View className="flex-1 flex-row items-end h-24 bg-cardDark rounded-2xl  pl-2.5 ml-3 mr-5 pb-1.5 -mt-14 -z-10">
              <View className="flex-row  items-end flex-1">
                {item.commentLikes.map((like, i) => {
                  return (
                    <Image
                      key={like.likeType}
                      style={{ zIndex: 20 - i }}
                      className={`w-6 h-6  ${
                        i === 0 ? "-translate-x-0" : "translate-x-1"
                      } `}
                      source={getPostLikeIcon(like.likeType)}
                    />
                  );
                })}
              </View>
              {item.totalCommentLikesCount - item.commentLikes.length > 0 && (
                <Text
                  key="hello world"
                  style={{ textAlignVertical: "center" }}
                  className="text-primaryForeground dark:text-primaryForegroundDark bg-cardForegroundDark  w-6 h-6  rounded-full text-center    ml-2 mr-2.5 "
                >
                  +{item.totalCommentLikesCount - item.commentLikes.length}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const TabDataSkeleton = ({ noCommentsFound }: { noCommentsFound: boolean }) => {
  const { colorScheme } = useColorScheme();
  const { width } = Dimensions.get("screen");
  const height = 130;

  if (noCommentsFound) {
    return (
      <View className="w-full items-center justify-center">
        <Text className="text-primary dark:text-primaryDark">
          No Comments found
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

type ChooseLikeTypeModalProps = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  modalPosition: { x: number; y: number };
  commentLikeHandler:(likeType:PostLikeEnum)=>Promise<void>
}

const ChooseLikeTypeModal:FC<ChooseLikeTypeModalProps> = ({commentLikeHandler,setVisible,visible,modalPosition}) => {
  const likeList = [PostLikeEnum.HEART, PostLikeEnum.LIKE, PostLikeEnum.LAUGH, PostLikeEnum.SAD, PostLikeEnum.WOW];

  return(
    <Modal 
    visible={visible}
    setVisible={setVisible}
    transparent={true}
    animationType="none"
    
    >
<View

style={{position:'absolute', left:modalPosition.x-8, top:modalPosition.y-100<0?20:modalPosition.y-130}}
className="flex-row items-center justify-center  w-60    bg-card dark:bg-mutedDark  rounded-2xl"
>
    {
      likeList.map((likeType, _)=>(
        <Pressable key={_}
        onPress={async()=>await commentLikeHandler(likeType)}
        className="  px-[7px] py-[11px]"
        >
        <Image 
        className="w-8 h-8 "
        
        resizeMethod="resize"
        resizeMode="contain"
        source={getPostLikeIcon(likeType)}
        />
        </Pressable>
      ))
    }
</View>
    </Modal>
  )
}