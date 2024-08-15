import {
  FlatList,
  Button,
  View,
  Text,
  Pressable,
} from "react-native";
import React,{useEffect, useRef, useState} from "react";
import { Stack, useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux";
import {  Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import cAxios from "@/src/lib/cAxios";
import { apiRoutes } from "@/src/constants/apiRoutes";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import axios from "axios";
import Modal from "@/src/components/elements/modal";
import { DocumentPickerAsset } from "expo-document-picker";

import MasonryList from "reanimated-masonry-list";
import { ResizeMode, Video } from "expo-av";
import LoadingIndicatorModal from "@/src/components/modals/LoadingIndicatorModal";
import { setNewPostMedia } from "@/src/store/slices/addPost";
import { getImageAspectRatio } from "@/src/lib/utils";
import { Image } from "react-native";
import ErrorHandler from "@/src/lib/ErrorHandler";
import Toast from "react-native-root-toast";

const AddNewPostView = () => {
  const [postUploadLoading,setPostUploadLoading] = useState(false);
  const [postUploadProgress,setPostUploadProgress] = useState({progress:0,completed:0});
  // const [postUploadComplete,setPostUploadComplete] = useState(false);

  const abortController = useRef(new AbortController());
  const dispatch = useAppDispatch();
  const { text, postMedias, uploadError,  } =
    useAppSelector((s) => s.newPost);
  const { colorScheme } = useColorScheme();
  const router = useRouter();

  const uploadPostMedias = async (signal: AbortSignal) => {
    let presignedResData: { fileName: string; key: string; url: string }[] = [];
    const postMediaReqData = postMedias.map((media) => ({
      fileName: media.name,
      mimeType: media.mimeType,
      size: media.size,
    }));

    const presignedRes = await cAxios.post(
      apiRoutes.createPostMediaPresignedUrl,
      postMediaReqData
    );
    presignedResData = [...presignedRes.data];

    // now put postMedia to aws s3
    let completeUploads = 0;
    setPostUploadProgress(prev=>({...prev,progress:0}))
    for (let i = 0; i < presignedResData.length; i++) {
      const file = postMedias.find(
        (media) => media.name === presignedResData[i].fileName
      );
      console.log("file : ", file);
      if (!file) throw new Error("file not found");

      // converting blob uri data to base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // converting base64  data to a buffer
      const buffer = Buffer.from(base64, "base64");

      const s3Res = await axios.put(presignedResData[i].url, buffer, {
        headers: {
          "Content-Type": file.mimeType,
        },
        onUploadProgress: (progressEvent) => {
          if (signal.aborted) return;
          const total = progressEvent.total;
          const current = progressEvent.loaded;
          const percent = Math.round((current / total!) * 100);
          console.log("percent : ", percent);
          setPostUploadProgress(prev=>({...prev,progress:percent}));
        },
        signal,
      });
      completeUploads++;
        setPostUploadProgress(prev=>({completed:prev.completed+1,progress:
          Math.round((completeUploads / presignedResData.length) * 100)}))
      if (signal.aborted) return { postMediaReqData, presignedResData };
    }
    return { postMediaReqData, presignedResData };
  };

  const addNewPostHandler = async () => {
    setPostUploadLoading(true)
    const controller = new AbortController();
    abortController.current = controller;
    try {
      const { postMediaReqData, presignedResData } = await uploadPostMedias(
        abortController.current.signal
      );
      // now create post
      const postRequestData = {
        textContent: text.length > 0 ? text : null,
        postMedias: presignedResData.map((i) => ({
          urlKey: i.key,
          mimeType: postMediaReqData.find((j) => j.fileName === i.fileName)
            ?.mimeType,
        })),
      };
      const res = await cAxios.post(apiRoutes.createPost, postRequestData);
      console.log(res.data)
      setPostUploadLoading(false)
      if(res.status===201){
        Toast.show("Post created successfully", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.CENTER,
          textColor:colorScheme==='dark'?Colors.dark.primaryForeground:Colors.light.primaryForeground,
          backgroundColor:colorScheme==='dark'?Colors.dark.foreground:Colors.light.foreground,
          containerStyle:{borderRadius:12},
        })
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.replace("/(tabs)")
      }
    } catch (e) {
      console.log("error from addNewPostHandler : ", e);
      ErrorHandler.handle(e)
      setPostUploadLoading(false)

    }
  };

 

  const cancelUploadHandler = () => {
    if (abortController.current) {
      abortController.current.abort();
      setPostUploadLoading(true)
      setPostUploadProgress({progress:0,completed:0})
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor:
              colorScheme === "dark"
                ? Colors.dark.background
                : Colors.light.background,
          },
          headerTitleStyle: {
            color:
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary,
          },
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              style={{ paddingRight: 20 }}
              onPress={() => router.canGoBack() && router.back()}
              size={24}
              color={
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.primary
              }
            />
          ),
          headerRight: () => (
            <Button
              title="Post"
              disabled={postUploadLoading}
              onPress={addNewPostHandler}
              color={
                colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted
              }
            />
          ),
        }}
      />
      {/* loading indicator while uploading content */}
      <LoadingIndicatorModal cancelUploadHandler={cancelUploadHandler}
      uploadLoading={postUploadLoading} uploadProgress={postUploadProgress.progress}
      loadingHeader={<Text className="text-primary dark:text-primaryDark text-2xl text-center mb-10">{postUploadProgress.completed}/{postMedias.length}</Text>}

      />

      <FlatList
        className=" bg-background dark:bg-backgroundDark"
        data={[{ text, postMedias }]}
        renderItem={(props) => <RenderFlatListItem {...props.item} />}
        keyExtractor={(item) => item.text}
      />
    </>
  );
};

export default AddNewPostView;





export const RenderBeautifulText = ({ text }: { text: string }) => {
  const [beautifyText, setBeautifyText] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    function getBeautifyText() {
      const tl = text.split(" ");
      const temp: React.JSX.Element[] = [];

      for (let i = 0; i < tl.length; i++) {
        let isEndsWithDot: boolean = false;

        if (tl[i].startsWith("#")) {
          isEndsWithDot = tl[i].endsWith(".");
          temp.push(
            <Text
              key={`${i}_hash`}
              className="text-blue-500 dark:text-blue-400"
            >
              {tl[i].replace(".", "")}
            </Text>
          );
          if (isEndsWithDot) {
            temp.push(
              <Text
                key={`${i}_hash_dot`}
                className="text-primary dark:text-primaryDark"
              >
                {"."}
              </Text>
            );
          }
        } else if (tl[i].startsWith("@")) {
          isEndsWithDot = tl[i].endsWith(".");
          temp.push(
            <Text key={`${i}_at`} className="text-blue-500 dark:text-blue-400">
              {tl[i].replace(".", "")}
            </Text>
          );
          if (isEndsWithDot) {
            temp.push(
              <Text
                key={`${i}_at_dot`}
                className="text-primary dark:text-primaryDark"
              >
                {"."}
              </Text>
            );
          }
        } else {
          temp.push(
            <Text key={i} className="text-primary dark:text-primaryDark">
              {tl[i]}
            </Text>
          );
        }
        temp.push(
          <Text
            key={`${i}_space_`}
            className="text-primary dark:text-primaryDark"
          >
            &nbsp;
          </Text>
        );
      }

      setBeautifyText(temp);
    }
    getBeautifyText();
  }, [text]);

  return <View className=" flex-row flex-wrap">{beautifyText}</View>;
};
const RenderFlatListItem = ({
  text,
  postMedias,
}: {
  text: string;
  postMedias: DocumentPickerAsset[];
}) => {
  return (
    <View className="">
      <View className="text-primary dark:text-primaryDark px-1 mb-5 mt-2">
        <RenderBeautifulText text={text} />
      </View>
      <View className="w-full h-full">
        <Media media={postMedias} />
      </View>
    </View>
  );
};

const Media = ({ media }: { media: DocumentPickerAsset[] }) => {
  return (
    <MasonryList
      data={media}
      keyExtractor={(item) => item.uri}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      // @ts-ignore
      renderItem={(props) => <MasonryListImageRenderItem media={props.item} />}
      style={{ gap: 8 }}
    />
  );
};


const MasonryListImageRenderItem = ({ media }: { media: DocumentPickerAsset }) => {
    const dispatch = useDispatch();
    const { colorScheme } = useColorScheme();
    const [ar, setAr] = useState("1/1");
    const [visible, setVisible] = useState(false);
    const { postMedias } = useAppSelector((s) => s.newPost);
    const videoRef = useRef<Video>(null);
    const removeDocument = () => {
      dispatch(setNewPostMedia(postMedias.filter((i) => i.uri !== media.uri)));
    };
  
    const imagePressHandler = async () => {
      if (media.mimeType?.includes("video")) {
        videoRef.current?.playAsync();
        setVisible(true);
      } else if (media.mimeType?.includes("image")) setVisible(true);
    };
    useEffect(() => {
      // @ts-ignore
      async function getAr() {
        const v = await getImageAspectRatio(media.uri);
        if (typeof v === "string") setAr(v);
      }
      getAr();
    }, []);
    return (
      <>
        <Pressable onPress={imagePressHandler} className="  mb-2">
          {/* for image */}
          {(media.mimeType?.includes("image") ||
            media.mimeType?.includes("video")) && (
            <>
              <Image
                source={{ uri: media.uri }}
                style={{ aspectRatio: ar }}
                className="rounded"
              />
  
              <Ionicons
                name="remove"
                size={28}
                color={"white"}
                style={{
                  position: "absolute",
                  top: 7,
                  right: 4,
                  borderRadius: 999,
                  zIndex: 99,
                  backgroundColor:
                    colorScheme === "dark"
                      ? Colors.dark.primaryForeground
                      : Colors.light.primaryForeground,
                }}
                onPress={removeDocument}
              />
              {/*  icon if video or docs available */}
              {media.mimeType?.includes("video") && (
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
            </>
          )}
          {/* for pdf */}
          {media.mimeType?.includes("application/pdf") && (
            <View className="w-full h-[260px] items-center  justify-between border border-border dark:border-borderDark rounded ">
              <View className="w-full h-[200px] items-center justify-center">
                <Image
                  source={require("@/src/assets/images/app-icons/pdf.png")}
                  className="w-20 h-20 object-cover bg-center"
                />
              </View>
              <View className="w-full h-[60px]  items-center justify-center px-2 border-t border-border dark:border-borderDark">
                <Text className="text-primary dark:text-primaryDark  text-base text-center">
                  {media.name.length > 40
                    ? media.name.slice(0, 35) + "... .pdf"
                    : media.name}
                </Text>
              </View>
            </View>
          )}
        </Pressable>
        <Modal
          visible={visible}
          setVisible={setVisible}
          animationType="fade"
          transparent={true}
          showStatusBar={false}
        >
          <Ionicons
            name="close"
            size={32}
            onPress={() => setVisible(false)}
            color={
              colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
            }
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 99,
              borderRadius: 999,
              padding: 10,
              backgroundColor:
                colorScheme === "dark"
                  ? Colors.dark.primaryForeground
                  : Colors.light.primaryForeground,
            }}
          />
  
          {/* for image */}
          {media.mimeType?.includes("image") && (
            <View className="  w-screen max-h-screen overflow-hidden  ">
              <Image source={{ uri: media.uri }} style={{ aspectRatio: ar }} />
            </View>
          )}
  
          {/* for videos */}
          {media.mimeType?.includes("video") && (
            <View className="w-screen max-h-screen ">
              <Video
                style={{ aspectRatio: ar }}
                ref={videoRef}
                source={{ uri: media.uri }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
              />
            </View>
          )}
        </Modal>
      </>
    );
  };
  
