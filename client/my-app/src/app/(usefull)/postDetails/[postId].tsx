import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
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
  getPostLikeIcon,
} from "@/src/lib/utils";
import { AntDesign, EvilIcons, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import Divider from "@/src/components/elements/Divider";
import ErrorHandler from "@/src/lib/ErrorHandler";
import { PostLikeEnum, PostLikeTargetEnum } from "@/src/types/post";
import ChooseLikeTypeModal from "@/src/components/modals/ChooseLikeTypeModal";
import MediaViewModal, { MediaViewModalDataType } from "@/src/components/modals/MediaViewModal";
import moment from "moment";

type PostUserType = {
  id: string;
  firstname: string;
  lastname: string;
  avatarUrl: string | null;
  role: UserRoleEnum;
  isPostSaved: boolean;
  isPostLiked: boolean;
  postLikeType: PostLikeEnum|null;
};
type PublicInteractionsType = {
  totalLikes: string;
  totalComments: string;
  mostLikeTypes: {
    likeType: PostLikeEnum;
    count: string;
  }[];
};
type PostMediasType = {
  id: string;
  mimeType: string;
  url: string;
  postId: string;
}[];
type PostDataType = {
  postId: string;
  createdAt: string;
  textContent: string | null;
  postMedias: PostMediasType;
  user: PostUserType;
  interactions: PublicInteractionsType;
};

export default function PostDetailsScreen() {
  const [data, setData] = useState<PostDataType | null>(null);
  const [loading, setLoading] = useState(false);
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const userId = useAppSelector((s) => s.userInformation.userBasicInfo.userId);

  async function getPost() {
    let api: string;
    if (userId) {
      api = `${apiRoutes.getSinglePostData}/${postId}?userId=${userId}`;
    } else {
      api = `${apiRoutes.getSinglePostData}/${postId}`;
    }
    try {
      setLoading(true);
      const res = await cAxios.get(api);
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error("error from post detail screen: ", error);
      setLoading(false);
      ErrorHandler.handle(error);
    }
  }

  useEffect(() => {
    if (!data) {
      getPost();
    }
  }, [userId]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              style={{ paddingLeft: 20 }}
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
            <PostUserComponent createdAt={data?.createdAt} user={data?.user} />
            {data.textContent && <PostTextComponent text={data?.textContent} />}
            <PostMediaComponent media={data?.postMedias} />
          </ScrollView>

          <PublicInteractions
            interactions={data?.interactions}
            user={data?.user}
            postId={data?.postId}
            setData={setData}
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
          {moment(createdAt).fromNow()}
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
  const [mediaModalData, setMediaModalData] = useState<MediaViewModalDataType>();

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
    const data = mediaData.find((item) => item.id === id);
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


type PublicInteractionsProps = {
  user: PostUserType;
  interactions: PublicInteractionsType;
  setData: React.Dispatch<React.SetStateAction<PostDataType | null>>
  postId: string;
};
const postInteractionControlsInitialState ={
  like:{
    loading: false
  },
  save:{
    loading: false
  }
} 
const PublicInteractions: FC<PublicInteractionsProps> = ({
  interactions,
  user,
  postId,
  setData
  
}) => {

  const [postInteractionControls, setPostInteractionControls] = useState(postInteractionControlsInitialState)
  const [loading, setLoading] = useState(false);
  
  const [chooseLikeModal ,setChooseLikeModal] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { height} = useWindowDimensions()
  

  const likeScreenHandler = () => {
    router.push({
      pathname: `/(usefull)/(modals)/likes/[targetType,id]`,
     // @ts-expect-error 
      params: {targetType: PostLikeTargetEnum.POST, id: postId },

    });
  };
  const commentScreenHandler = () => {
    router.push({
      pathname: `/(usefull)/(modals)/comments/[postId]`,
      params: { postId },
    });
  };
  const chooseLikeModalHandler =async (likeType:PostLikeEnum)=>{
    // this is trigger by modal check if likeType same then do nothing
    if(user.postLikeType === likeType)return
    await likePostToggle(likeType);
  }

  
  const likePostToggle = async (likeType:PostLikeEnum) => {
    // like btn is toggle type btn 
    if(postInteractionControls.like.loading)return

    setPostInteractionControls((prev)=>({...prev,like:{...prev.like,loading:true,}}));
    try {
      if(user.isPostLiked){
        if(likeType === user.postLikeType){
          const res = await cAxios.delete(`${apiRoutes.removePostLike}/${postId}`);
          if(res.status === 200)
            setData(prev =>prev===null?null:(
                {
                  ...prev,
                  user:{
                    ...prev?.user,
                    isPostLiked:false,
                    postLikeType:null
                  },
                  interactions:{
                    ...prev.interactions,
                    totalLikes: (parseInt(prev.interactions.totalLikes) -1).toString(),
                  }
                }
              )
            )
          
        }else if(likeType !== user.postLikeType){
          // update like type
          const res = await cAxios.patch(apiRoutes.updatePostLike, {postId, likeType});
          if(res.status === 200)
            setData(prev => prev === null?null:(
                {
                  ...prev,
                  user:{
                    ...prev?.user,
                    postLikeType:likeType
                  },
                }
              )
            )
        }
      }else{
        // create like post
        const res = await cAxios.post(apiRoutes.createPostLike, {postId, likeType});
        if (res.status === 201)
          setData(prev =>prev===null?null:(
              {
                ...prev,
                user:{
                  ...prev?.user,
                  isPostLiked:true,
                  postLikeType:likeType
                },
                interactions:{
                  ...prev.interactions,
                  totalLikes: (parseInt(prev.interactions.totalLikes) +1).toString(),
                }
              }
            )
          )   
    }
  }
      catch (error) {
        console.log("error while toggle like post: ",error);
        ErrorHandler.handle(error);
      } finally {
        setPostInteractionControls((prev)=>({...prev,like:{...prev.like,loading:false,}}));
      }
    

  }
   

  const savePostToggle = async () => {
     // save btn is toggle type btn first check if isSave true then unsave
     if(postInteractionControls.save.loading)return
     try {
       setPostInteractionControls((prev)=>({...prev,save:{...prev.save,loading:true,}}));
    if(user.isPostSaved){
      // unsave post
        const res = await cAxios.delete(`${apiRoutes.removePostSave}/${postId}`);
        if(res.status === 200){
          setData(prev=>prev===null?null:(
              {
                ...prev,
                user:{
                  ...prev?.user,
                  isPostSaved:false
                }
              }
            )
          )
        }
      }else{
        // save post
        const res = await cAxios.post(apiRoutes.createPostSave, {postId});
        if (res.status === 201){
          setData(prev=>prev===null?null:(
            {
              ...prev,
              user:{
                ...prev?.user,
                isPostSaved:true
              }
            }
          )
        )
        }
      }
     } catch (error) {
        console.log("error while saving post: ",error);
        ErrorHandler.handle(error);
      } finally {
        setPostInteractionControls((prev)=>({...prev,save:{...prev.save,loading:false,}}));
      }
  };

    console.log({postId})

  return (
    <>
      <View className="w-full   bg-mutedDark">
        <View className="w-full flex-row items-center justify-between   px-4 ">
          {/*  display most 3 like Types */}
          <View className="flex-1 flex-row items-center justify-start gap-x-1.5  ">
            <Pressable onPress={likeScreenHandler} disabled={loading}>
              {interactions.mostLikeTypes
                .sort((a, b) => parseInt(b.count) - parseInt(a.count))
                .slice(0, 3)
                .map((item, index) => (
                  <Image
                    key={index}
                    className="w-7 h-7"
                    source={getPostLikeIcon(item.likeType)}
                    resizeMethod="resize"
                    resizeMode="center"
                    alt={item.likeType}
                  />
                ))}
            </Pressable>
          </View>
          <View className="flex-row items-center justify-center flex-1 gap-x-4">
            <Pressable
              className="flex-1"
              onPress={likeScreenHandler}
              disabled={loading}
            >
              <Text className="text-center text-xs text-primary dark:text-primaryDark">
                {parseInt(interactions.totalLikes) === 1
                  ? `${interactions.totalLikes}\nLike`
                  : `${interactions.totalLikes}\nLikes`}{" "}
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 "
              onPress={commentScreenHandler}
              disabled={loading}
            >
              <Text className="text-center text-xs text-primary dark:text-primaryDark ">
                {parseInt(interactions.totalComments) === 1
                  ? `${interactions.totalComments}\nComment`
                  : `${interactions.totalComments}\nComments`}{" "}
              </Text>
            </Pressable>
          </View>
        </View>

        <Divider styles=" bg-mutedForeground dark:bg-mutedForegroundDark my-0.5 w-[95%] mx-auto opacity-30" />

        <View className="w-full h-16 flex-row items-center justify-between  ">
          <Pressable
            className="w-[25%] h-full items-center justify-start pt-1"

            // if longPress then show like type modal
            onLongPress={()=>setChooseLikeModal(true)}
            // if liked and press then unlike
            // if not liked and press then like
            onPress={()=>user.isPostLiked ? likePostToggle(user.postLikeType!) : likePostToggle(PostLikeEnum.LIKE)}
            disabled={postInteractionControls.like.loading}
          >
            {user.isPostLiked ? (
<Image
className="w-8 h-8"
resizeMethod="resize"
resizeMode="center"

  source={getPostLikeIcon(user.postLikeType!)}
/>
            ):(
              <AntDesign
              name={"like2"}
              size={32}
              color={
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.primary
              }
            />
            )}
           
            <Text className="text-primary dark:text-primaryDark opacity-75 text-xs">
              {user.isPostLiked?user.postLikeType:"like"}
            </Text>
          </Pressable>

          <Pressable
            className="w-[25%] h-full items-center justify-start pt-1"
            onPress={commentScreenHandler}
            disabled={loading}
          >
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

          <Pressable
            className="w-[25%] h-full items-center justify-start pt-1"
            onPress={savePostToggle}

            disabled={postInteractionControls.save.loading}
          >
            <Ionicons
              name={user.isPostSaved ? "bookmark" : "bookmark-outline"}
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
      <ChooseLikeTypeModal
      visible={chooseLikeModal}
      setVisible={setChooseLikeModal}
      modalPosition={{ x: 8, y: height-85 }}
      likeHandler={chooseLikeModalHandler}
      />
    </>
  );
};
