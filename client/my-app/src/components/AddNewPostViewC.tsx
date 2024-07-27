import { DocumentPickerAsset } from "expo-document-picker";
import { useColorScheme } from "nativewind";
import { FC, useEffect, useRef, useState } from "react";
import { Image, Pressable, Text, useWindowDimensions, View } from "react-native";
import * as Progress from "react-native-progress";

import MasonryList from "reanimated-masonry-list";
import { useAppSelector } from "../hooks/redux";
import Modal from "./elements/modal";
import { ResizeMode, Video } from "expo-av";
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { getImageAspectRatio } from "../lib/utils";
import { setNewPostMedia } from "../store/slices/addPost";
import { useDispatch } from "react-redux";

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

export const RenderFlatListItem = ({
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
      renderItem={(props) => <ImageRenderItem media={props.item} />}
      style={{ gap: 8 }}
    />
  );
};

type LoadingIndicatorModalProps = {
  cancelUploadHandler: () => void;
};
export const LoadingIndicatorModal: FC<LoadingIndicatorModalProps> = ({
  cancelUploadHandler,
}) => {
  const { width } = useWindowDimensions();
  const [btnDisable, setBtnDisable] = useState(false);
  const { colorScheme } = useColorScheme();
  const { uploadLoading, uploadProgress } = useAppSelector((s) => s.newPost);
  return (
    <Modal
      visible={uploadLoading}
      transparent={true}
      animationType="none"
      showStatusBar={true}
    >
      <Progress.Circle
        progress={uploadProgress / 100}
        size={250}
        showsText={true}
        allowFontScaling={true}
      />

      <Pressable
        disabled={btnDisable}
        className="w-40 items-center justify-center mx-auto mt-8 rounded-xl  py-4  bg-muted dark:bg-mutedDark"
        onPress={() => {
          setBtnDisable(true);
          cancelUploadHandler();
        }}
      >
        <Text className="text-primary dark:text-primaryDark text-base  ">
          {btnDisable ? "Cancelling..." : "Cancel"}
        </Text>
      </Pressable>
    </Modal>
  );
};



const ImageRenderItem = ({ media }: { media: DocumentPickerAsset }) => {
    const dispatch = useDispatch();
    const { width, height } = useWindowDimensions();
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
  