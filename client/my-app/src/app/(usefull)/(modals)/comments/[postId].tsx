import { apiRoutes } from "@/src/constants/apiRoutes";
import { Colors } from "@/src/constants/Colors";
import cAxios from "@/src/lib/cAxios";
import { PostLikeEnum, PostLikeTargetEnum } from "@/src/types/post";
import { Ionicons } from "@expo/vector-icons";
import {  useLocalSearchParams, useRouter, } from "expo-router";
import _  from "lodash";
import moment from "moment";
import { useColorScheme } from "nativewind";
import React, { FC, useCallback,  useRef, useState } from "react";
import {
  ColorSchemeName,
  Dimensions,
  TouchableHighlight,
  useWindowDimensions,
} from "react-native";
import { Text, View, FlatList, Image, Pressable } from "react-native";
import {
  HandlerStateChangeEvent,
  LongPressGestureHandler,
  LongPressGestureHandlerEventPayload,
  State,
  TapGestureHandler,
  TapGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { getPostLikeIcon } from "@/src/lib/utils";
import { SafeAreaView } from "react-native-safe-area-context";
import ErrorHandler from "@/src/lib/ErrorHandler";
import { useAppSelector } from "@/src/hooks/redux";
import ChooseLikeTypeModal from "@/src/components/modals/ChooseLikeTypeModal";

type CommentModalProps = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  postId: string;
};

type CommentDataType = {
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
  take: 20,
};
const CommentModal: FC<CommentModalProps> = () => {
  const { postId } = useLocalSearchParams();
  const userId = useAppSelector((s) => s.auth.data.user.userId);

  // for modal
  const [likeModalVisible, setLikeModalVisible] = useState(false);
  const [likeModalPosition, setLikeModalPosition] = useState({ x: 0, y: 0 });


  // for commentLike
  const selectedCommentForLikeId = useRef<string | null>(null);
  
  // for flatListHandle
  const [comments, setComments]=useState<CommentDataType[]>([])
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
      const res = await cAxios.get(api);
      if (res.status === 200 && res.data.length === 0) {
        setIsLoadComplete(true);
        return;
      }
      if(res.data.length< page.current.take){
        setIsLoadComplete(true);
      }
        setComments(prev=>[...prev,...res.data])
      // updating page values
      page.current.skip = page.current.skip + page.current.take;
    } catch (error) {
      console.error("error from comments loadMore: ", error);
      ErrorHandler.handle(error);
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


  const sortDataHandler = (latest: boolean) => {
    isLatest.current = latest;
    page.current.skip = 0;
    setIsLoadComplete(false);
    setComments([]);
  };


  const removeCommentLike = async (
    commentId: string,
  ) => {
    const res = await cAxios.delete(
      `${apiRoutes.removePostCommentLike}/${commentId}`
    );
    setComments(prev=>prev.map(comment => {
      if (comment.id === commentId) {
        comment.currentUserLike = null;
      }
      return comment;
    }))
  };
  const createCommentLike = async(commentId: string, likeType:PostLikeEnum)=>{
    const res = await cAxios.post(apiRoutes.createPostCommentLike, {
      commentId,
      likeType
    });
    if (res.status === 201) {
      setComments(prev=>prev.map(comment => {
        if (comment.id === commentId) {
          comment.currentUserLike = {
            userId,
            commentId,
            likeType,
          };
        }
        return comment;
      }))
     
    }
  }
  const updateCommentLike = async (commentId: string, likeType: PostLikeEnum) => {
    const res = await cAxios.patch(apiRoutes.updatePostCommentLike, {
      commentId
, likeType
    });

    setComments(prev=>prev.map(comment => {
      const prevLikeType = comment.currentUserLike?.likeType;
      if (comment.id === commentId) {
        comment.currentUserLike = {
          userId,
          commentId,
          likeType,
        };
      }
    
      return comment;
    }))
    
  }
  
  const commentLikeHandler = async (likeType: PostLikeEnum) => {
    if (!selectedCommentForLikeId.current) return;
    const comment = comments.find(
      (c) => c.id === selectedCommentForLikeId.current
    );
    if (!comment) return;
    console.log("commentLikeHandler: ", comment);
    if (comment.currentUserLike  ) {
      console.log("currentUserLike" ,comment?.currentUserLike)
      console.log("likeType",likeType)

      if(comment.currentUserLike.likeType === likeType)await removeCommentLike(selectedCommentForLikeId.current);
      else await updateCommentLike(selectedCommentForLikeId.current, likeType);
    } else await createCommentLike(selectedCommentForLikeId.current, likeType);
  };
 
  const commentLikeToggle = async (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return
    if (comment.currentUserLike) await removeCommentLike(commentId);
    else await createCommentLike(commentId, PostLikeEnum.LIKE);
    
  };
  
  const commentUserNavigatorHandler = async (userId: string) => {
    // item.user.id
  };
  return (
    <>
      <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark">
        <FlatList
          className="flex-1  bg-muted dark:bg-mutedDark "
          data={comments}
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
            isLoadComplete={isLoadComplete}
            commentsLength={comments.length}
            />
          }
        
          renderItem={({ item }) => (
            <FlatListRenderItem
              item={item}
              setLikeModalPosition={setLikeModalPosition}
              setLikeModalVisible={setLikeModalVisible}
              selectedCommentForLikeId={selectedCommentForLikeId}
              commentUserNavigatorHandler={commentUserNavigatorHandler}
              commentLikeToggle={commentLikeToggle}
            />
          )}
        />
          {/* // left: modalPosition.x - 8,
          // top: modalPosition.y - 100 < 0 ? 20 : modalPosition.y - 130, */}
        <ChooseLikeTypeModal
          modalPosition={{x:likeModalPosition.x-8,y:likeModalPosition.y-100<0?20:likeModalPosition.y-93}}
          visible={likeModalVisible}
          setVisible={setLikeModalVisible}
          likeHandler={commentLikeHandler}
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
      <Text className="text-primary dark:text-primaryDark text-xl">Comments</Text>
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
  item: CommentDataType;
  commentUserNavigatorHandler: (userId: string) => Promise<void>;
  setLikeModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCommentForLikeId: React.MutableRefObject<string | null>;
  commentLikeToggle: (commentId: string) => Promise<void>;
  setLikeModalPosition: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    }>
  >;
};
const FlatListRenderItem: FC<FlatListRenderItemProps> = ({
  item,
  setLikeModalVisible,
  commentUserNavigatorHandler,
  setLikeModalPosition,
  selectedCommentForLikeId,
  commentLikeToggle,
}) => {
  const longPressActive = useRef(false);
  const likeBtnRef = useRef<View>(null);
  
  const handleLongPressLikeBtn = useCallback((
    event:HandlerStateChangeEvent<LongPressGestureHandlerEventPayload>) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      longPressActive.current = true; // Set long press flag
      likeBtnRef.current?.measure((fx, fy, width, height, px, py) => {
        
        setLikeModalPosition({ x: px, y: py + height });
        selectedCommentForLikeId.current = item.id;
        setLikeModalVisible(true);
      });
    } else if (event.nativeEvent.state === State.END) {
      longPressActive.current = false; 
    }
  }, []);
  const handleShortPressLikeBtn = useCallback(async(
    event:HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
    if (event.nativeEvent.state === State.END) {
      if (longPressActive.current) {
        longPressActive.current = false; 
        return
      }
      await commentLikeToggle(item.id);
    }
  }, []);

const router = useRouter()
const commentLikeScreenHandler = ()=>{
  router.push({
    pathname: `/(usefull)/(modals)/likes/[targetType,id]`,
    params: { targetType: PostLikeTargetEnum.COMMENT, id: item.id },

  });
};
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
            {moment(item.createdAt).fromNow()}
          </Text>
          <Text className="text-primary dark:text-primaryDark mt-4">
            {item.content}
          </Text>
        </View>
        <View className="flex-row items-center ">
          {/* comment like and reply btn */}
          <View className="flex-row items-center ml-2">
          <TapGestureHandler onHandlerStateChange={handleShortPressLikeBtn}>
      <LongPressGestureHandler
        onHandlerStateChange={handleLongPressLikeBtn}
        minDurationMs={800} // Adjust the duration for long press
      >
        <View ref={likeBtnRef} className="pr-2.5 py-1.5">
          {item.currentUserLike ? (
            <Image
              className="w-6 h-6"
              source={getPostLikeIcon(item.currentUserLike.likeType)}
            />
          ) : (
            <Text className="text-primary dark:text-primaryDark">Like</Text>
          )}
        </View>
      </LongPressGestureHandler>
    </TapGestureHandler>

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
            <Pressable className="flex-1 flex-row items-end h-24 bg-cardDark rounded-2xl  pl-2.5 ml-3 mr-5 pb-1.5 -mt-14 -z-10 border border-border dark:border-borderDark"
            onPress={commentLikeScreenHandler}
            >
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
                  {item.totalCommentLikesCount }
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const TabDataSkeleton = ({ isLoadComplete,commentsLength }: { isLoadComplete: boolean,commentsLength:number }) => {
  const { colorScheme } = useColorScheme();
  const { width } = Dimensions.get("screen");
  const height = 130;

  if (commentsLength===0 &&isLoadComplete) {
    return (
      <View className="w-full items-center justify-center">
        <Text className="text-primary dark:text-primaryDark">
          No more comments 
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
