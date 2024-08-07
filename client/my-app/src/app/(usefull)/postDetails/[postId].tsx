import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { FC, useEffect, useRef, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { apiRoutes } from "@/src/constants/apiRoutes";
import { UserRoleEnum } from "@/src/types/user";
import cAxios from "@/src/lib/cAxios";
import { useAppSelector } from "@/src/hooks/redux";
import MasonryList from "reanimated-masonry-list";
import { Pressable } from "react-native";
import {
  getVideoPropsFromUrl,
  getImageAspectRatio,
  getAspectRatio,
} from "@/src/lib/utils";
import { AntDesign, EvilIcons, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import Modal from "@/src/components/elements/modal";
import { ResizeMode, Video } from "expo-av";
import Divider from "@/src/components/elements/Divider";

type PostUserType = {
  firstname: string;
  lastname: string;
  avatarUrl: string | null;
};
type LastUserInteraction = {
  firstname: string | null;
  lastname: string | null;
};
type PostMediasType = {
  id: string;
  mimeType: string;
  url: string;
}[];
type PostDataProps = {
  post: {
    id: string;
    textContent: string | null;
    createdAt: string;
    postBy: UserRoleEnum.ADMIN | UserRoleEnum.CREATOR;
  };
  postMedias: PostMediasType;
  user: PostUserType;

  lastLike: {
    likeType: string;
  };
  lastLikeUser: LastUserInteraction;
  lastComment: {
    createdAt: string;
    content: string;
  };
  lastCommentUser: LastUserInteraction;
  isCurrentUserLiked: string | null;
  likesCount: string;
  commentsCount: string;
};

export default function PostDetailsScreen() {
  const [data, setData] = useState<PostDataProps | null>(null);
  const [loading, setLoading] = useState(false);
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const userId = useAppSelector((s) => s.auth.data.user.userId);
  useEffect(() => {
    async function getPost() {
      let api: string;
      if (userId) {
        api = `${apiRoutes.getSinglePostData}/${postId}?userId=${userId}`;
      } else {
        api = `${apiRoutes.getSinglePostData}/${postId}`;
      }
      console.log(api);
      try {
        setLoading(true);
        const postsData = await (await cAxios.get(api)).data;
        setData(postsData);
        // console.log(postsData);
        setLoading(false);
      } catch (error) {
        console.error("error from post detail screen: ", error);
        setLoading(false);
        throw error;
      }
    }
    if (data === null) {
      getPost();
    }
  }, [postId, userId]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              style={{ paddingRight: 20 }}
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
          headerStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          },
        }}
      />
      {!data || loading ? (
        <Text className="text-red-600">loading...</Text>
      ) : (
        <View className="flex-1 justify-end">
          <ScrollView className="flex-1 bg-background dark:bg-backgroundDark pt-4">
            <PostUserComponent
              createdAt={data.post.createdAt}
              user={data.user}
            />
            {data.post.textContent && (
              <PostTextComponent text={data.post.textContent} />
            )}
            <PostMediaComponent media={data.postMedias} />
          </ScrollView>
          <PublicInteractions
            data={{
              postId:typeof postId==='string'?postId:postId[0],
              lastLike: data.lastLike,
              lastLikeUser: data.lastLikeUser,
              lastComment: data.lastComment,
              lastCommentUser: data.lastCommentUser,
              isCurrentUserLiked: data.isCurrentUserLiked,
              likesCount: data.likesCount,
              commentsCount: data.commentsCount,
            }}
          />
        </View>
      )}
    </>
  );
}

type PostUserComponentProps = {
  user: PostUserType;
  createdAt: string;
  isActive?: boolean;
};

const PostUserComponent: FC<PostUserComponentProps> = ({
  user,
  createdAt,
  isActive,
}) => {
  return (
    <View className="w-full px-4 flex-row items-center justify-normal gap-x-3">
      <View
        className={`w-14 h-14  rounded-full overflow-hidden  
      ${
        isActive
          ? "border-2 border-green-600 dark:border-green-500"
          : "border-0"
      }
      `}
      >
        <Image
          source={
            user.avatarUrl
              ? { uri: user.avatarUrl }
              : require("@/src/assets/images/avatar-null.jpg")
          }
          alt="profileImage"
          className={`w-full h-full bg-center object-cover `}
        />
        <View />
      </View>
      <View className="">
        <Text className="text-primary dark:text-primaryDark text-lg font-semibold">
          {user.firstname}&nbsp;{user.lastname}
        </Text>
        <Text className=" text-gray-500 dark:text-gray-400 text-xs ">
          {createdAt}
        </Text>
      </View>
    </View>
  );
};

const PostTextComponent = ({ text }: { text: string }) => {
  const [seeMore, setSeeMore] = useState(false);
  return (
    <View className="px-4 pt-4">
      {text.length > 200 ? (
        <Text className="text-primary dark:text-primaryDark">
          {seeMore ? text : text.slice(0, 200)}{" "}
          <TouchableOpacity onPress={() => setSeeMore(!seeMore)}>
            <Text className="text-gray-500 dark:text-gray-400">
              {" "}
              {seeMore ? "see less" : "... see more"}
            </Text>
          </TouchableOpacity>
        </Text>
      ) : (
        <Text className="text-primary dark:text-primaryDark">{text}</Text>
      )}
    </View>
  );
};

type PostMediaComponentProps = {
  media: PostMediasType;
};
type MediaDataProps = {
  url: string;
  mimeType: string;
  videoUrl: string | null;
  aspectRatio: string;
  id: string;
};

const PostMediaComponent: FC<PostMediaComponentProps> = ({ media }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [mediaData, setMediaData] = useState<MediaDataProps[]>([]);
  const [mediaModalData, setMediaModalData] = useState<mediaModalDataType>();

  useEffect(() => {
    async function prepareMedia() {
      for (let i = 0; i < media.length; i++) {
        if (media[i].mimeType.includes("video")) {
          const videoProps = await getVideoPropsFromUrl(media[i].url);
          if (videoProps) {
            const { height, url, width } = videoProps;
            const aspectRatio = getAspectRatio(width, height);
            setMediaData((prev) => [
              ...prev,
              {
                id: media[i].id,
                url,
                mimeType: media[i].mimeType,
                videoUrl: media[i].url,
                aspectRatio,
              },
            ]);
          }
        } else if (media[i].mimeType.includes("image")) {
          const ar = await getImageAspectRatio(media[i].url);
          if (typeof ar === "string") {
            setMediaData((prev) => [
              ...prev,
              {
                id: media[i].id,
                url: media[i].url,
                mimeType: media[i].mimeType,
                videoUrl: null,
                aspectRatio: ar,
              },
            ]);
          }
        }
      }
    }
    prepareMedia();
  }, []);
  const imagePressHandler = (id: string) => {
    console.log(id);
    const data = mediaData.find((item) => item.id === id);
    console.log(data);
    setMediaModalData({
      mimeType: data?.mimeType,
      ar: data?.aspectRatio,
      url: data?.url,
      videoUrl: data?.videoUrl,
    });
    setModalVisible(true);
  };
  return (
    <>
      <MasonryList
        data={mediaData}
        numColumns={mediaData.length > 1 ? 2 : 1}
        keyExtractor={(item) => `${item.id}_${Math.random()}`}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 2 }}
        renderItem={({ item }) => (
          <PostMediaItemComponent
            // @ts-ignore
            ar={item.aspectRatio}
            // @ts-ignore
            id={item.id}
            // @ts-ignore
            mimeType={item.mimeType}
            // @ts-ignore
            url={item.url}
            imagePressHandler={imagePressHandler}
          />
        )}
      />
      <MediaViewModal
        setVisible={setModalVisible}
        visible={modalVisible}
        ar={mediaModalData?.ar}
        mimeType={mediaModalData?.mimeType}
        url={mediaModalData?.url}
        videoUrl={mediaModalData?.videoUrl}
      />
    </>
  );
};

type PostMediaItemComponentProps = {
  url: string;
  mimeType: string;
  ar: string;
  id: string;
  imagePressHandler: (id: string) => void;
};
const PostMediaItemComponent: FC<PostMediaItemComponentProps> = ({
  mimeType,
  url,
  id,
  ar,
  imagePressHandler,
}) => {
  const { colorScheme } = useColorScheme();

  return (
    <Pressable onPress={() => imagePressHandler(id)} className="z-[100] p-1.5">
      <View className="overflow-hidden rounded-md">
        <View style={{ aspectRatio: ar, overflow: "hidden" }}>
          <Image
            source={{ uri: url }}
            resizeMethod="resize"
            resizeMode="cover"
            className="w-full h-full "
            alt="image"
          />
        </View>
        {/*  icon if video or docs available */}
        {mimeType?.includes("video") && (
          <View
            className="absolute top-0 left-0 items-center justify-center  z-10 w-full h-full
          "
          >
            <View className="absolute left-0 w-full h-full bg-background dark:bg-backgroundDark opacity-40" />
            <Ionicons
              name="videocam"
              size={28}
              color={"white"}
              style={{
                borderRadius: 999,
                zIndex: 99,
                padding: 10,
                backgroundColor:
                  colorScheme === "dark"
                    ? Colors.dark.primaryForeground
                    : Colors.light.primaryForeground,
              }}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
};

interface MediaViewModalProps extends mediaModalDataType {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

type mediaModalDataType = {
  url?: string;
  mimeType?: string;
  videoUrl?: string | null;
  ar?: string;
};
const MediaViewModal: FC<MediaViewModalProps> = ({
  setVisible,
  visible,
  mimeType,
  url,
  videoUrl,
  ar,
}) => {
  const ref = useRef<Video>(null);
  const { width, height } = Dimensions.get("window");
  const [contentDimensions, setContentDimensions] = useState({ width, height });

  useEffect(() => {
    if (ar) {
      const [w, h] = ar.split("/").map(Number);
      const height_ = (width / w) * h;
      if (height_ >= height - 100) {
        setContentDimensions({
          width: (width / 100) * 92,
          height: (height / 100) * 92,
        });
      } else {
        setContentDimensions({ width, height: height_ });
      }
    }
  }, [ar]);
  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      transparent={true}
      animationType="fade"
      showStatusBar={true}
      withInput={false}
      bgOpacity={0.8}
    >
      <View
        style={{
          width: contentDimensions.width,
          height: contentDimensions.height,
        }}
      >
        {mimeType?.includes("image") && (
          <Image
            className="w-full h-full"
            source={{ uri: url }}
            resizeMethod="resize"
            resizeMode="contain"
            alt="image"
          />
        )}
        {mimeType?.includes("video") && videoUrl && (
          <Video
            ref={ref}
            source={{ uri: videoUrl }}
            className="w-full h-full"
            resizeMode={ResizeMode.COVER}
            useNativeControls
            isLooping
          />
        )}
      </View>
    </Modal>
  );
};

type PublicInteractionsProps = {
  data: {
    postId:string,
    lastLike: { likeType: string | null };
    lastLikeUser: LastUserInteraction;
    lastComment: { createdAt: string | null; content: string | null };
    lastCommentUser: LastUserInteraction;
    isCurrentUserLiked: string | null;
    likesCount: string;
    commentsCount: string;
  };
};
const PublicInteractions: FC<PublicInteractionsProps> = ({ data }) => {
  const {
    commentsCount,
    postId,
    isCurrentUserLiked,
    lastComment,
    lastCommentUser,
    lastLike,
    lastLikeUser,
    likesCount,
  } = data;
  const { colorScheme } = useColorScheme();
  const [isSave, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(isCurrentUserLiked !== null);
  const [loading,setLoading] = useState(false)
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const router = useRouter ()

  const lastLikeUsername =
    lastLikeUser?.firstname + " " + lastLikeUser?.lastname;
  const likesCountNumber = Number.parseInt(likesCount);
  

  const likePostHandler =async ()=>{
    const body = {
      postId,
      likeType:'like'
    }
    console.log({body})
    try {
      setLoading(true)
      const res = await cAxios.post(apiRoutes.createPostLike,body)
      if(res.status === 201){
        setIsLiked(true)
      }else{
        setIsLiked(false)
      }
      console.log(res.data.message)
    } catch (error) {
      console.log("error while liking post")
    }finally{
      setLoading(false)
    }
  }
  
  const commentPostHandler =()=>{
    router.push({pathname:`/(usefull)/(modals)/comments/[postId]`,params:{postId}})
  }
  const savePostHandler =async () => {
    const body = {
      postId,
    }
    console.log({body})
    try {
      setLoading(true)
      const res = await cAxios.post(apiRoutes.createPostSave,body)
      if(res.status === 201){
        setIsSaved(true)
      }else{
        setIsSaved(false)
      }
      console.log(res.data.message)
    } catch (error) {
      console.log("error while saving post")
    }finally{
      setLoading(false)

    }
  };
  
  return (
    <>
    <View className="w-full   bg-mutedDark">
      <View className="w-full flex-row items-center justify-between  mt-1.5 ">
        <View className="flex-row items-center w-[72%] pl-1">
          {lastLike.likeType && (
            <>
              <Text className="text-primary dark:text-primaryDark ">
                {lastLike.likeType}
              </Text>
              <Text className="text-primary dark:text-primaryDark ">
                {lastLikeUsername.length > 12
                  ? lastLikeUsername.slice(0, 10) + " ..."
                  : lastLikeUsername}
              </Text>

              {likesCountNumber - 1 > 0 && (
                <Text className="text-primary dark:text-primaryDark">
                  {likesCountNumber - 1}
                  {likesCountNumber - 1 === 1 ? " & other" : " & others"}
                </Text>
              )}
            </>
          )}
        </View>
        <Text
          style={{ textAlign: "right" }}
          className="text-primary  dark:text-primaryDark  w-[28%] pr-1"
        >
          {commentsCount}&nbsp;
          <Text className="text-primary  dark:text-primaryDark opacity-60">
            {commentsCount === "1" ? "comment" : "comments"}
          </Text>
        </Text>
      </View>

      <Divider styles=" bg-mutedForeground dark:bg-mutedForegroundDark my-0.5 w-[95%] mx-auto opacity-30" />

      <View className="w-full h-16 flex-row items-center justify-between  ">
        <Pressable className="w-[25%] h-full items-center justify-start pt-1" onPress={likePostHandler} disabled={loading}>
          <AntDesign
            name={isLiked || isCurrentUserLiked ? "like1" : "like2"}
            size={32}
            color={
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary
            }
          />
          <Text className="text-primary dark:text-primaryDark opacity-75 text-xs">
            Like
          </Text>
        </Pressable>

        <Pressable className="w-[25%] h-full items-center justify-start pt-1" onPress={commentPostHandler} disabled={loading}>
          <EvilIcons
            name="comment"
            size={42}
            color={
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary
            }
          />
          <Text className="text-primary dark:text-primaryDark opacity-75 text-xs">
            Comment
          </Text>
        </Pressable>
        <Pressable className="w-[25%] h-full items-center justify-start pt-1">
          <EvilIcons
            name="share-google"
            size={42}
            color={
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary
            }
          />
          <Text className="text-primary dark:text-primaryDark opacity-75 text-xs">
            Share
          </Text>
        </Pressable>

        <Pressable className="w-[25%] h-full items-center justify-start pt-1" onPress={savePostHandler} disabled={loading}>
          <Ionicons
            name={isSave ? "bookmark" : "bookmark-outline"}
            size={35}
            color={
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary
            }
          />
          <Text className="text-primary dark:text-primaryDark opacity-75 text-xs">
            Save
          </Text>
        </Pressable>
      </View>
    </View>
  
    </>

  );
};
