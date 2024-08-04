import {
  FlatList,
  Button,
  View,
} from "react-native";
import React,{useRef} from "react";
import { Stack, useRouter } from "expo-router";
import { useAppSelector } from "@/src/hooks/redux";
import {  Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import {
  setPostUploadLoading,
  setPostUploadProgress,
} from "@/src/store/slices/addPost";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import cAxios from "@/src/lib/cAxios";
import { apiRoutes } from "@/src/constants/apiRoutes";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import axios from "axios";
import { LoadingIndicatorModal, RenderFlatListItem } from "@/src/components/AddNewPostViewC";
import Modal from "@/src/components/elements/modal";

const AddNewPostView = () => {
  const abortController = useRef(new AbortController());
  const { text, postMedias, uploadError, uploadLoading, uploadProgress } =
    useAppSelector((s) => s.newPost);
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const uploadPostMedias = async (signal: AbortSignal) => {
    let presignedResData: { fileName: string; key: string; url: string }[] = [];
    const postMediaReqData = postMedias.map((media) => ({
      fileName: media.name,
      mimeType: media.mimeType,
      size: media.size,
    }));

    console.log("presigned url started");
    const presignedRes = await cAxios.post(
      apiRoutes.createPostMediaPresignedUrl,
      postMediaReqData
    );
    presignedResData = [...presignedRes.data];

    // now put postMedia to aws s3
    let completeUploads = 0;
    dispatch(setPostUploadProgress(0));
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
          dispatch(setPostUploadProgress(percent));
        },
        signal,
      });
      console.log("status from aws s3 : ", s3Res.status);
      completeUploads++;
      console.log();
      dispatch(
        setPostUploadProgress(
          Math.round((completeUploads / presignedResData.length) * 100)
        )
      );
      if (signal.aborted) return { postMediaReqData, presignedResData };
    }
    return { postMediaReqData, presignedResData };
  };

  const addNewPostHandler = async () => {
    dispatch(setPostUploadLoading(true));
    const controller = new AbortController();
    abortController.current = controller;
    try {
      console.log("post function started");
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

      console.log("response from create post : ", res.data);
      dispatch(setPostUploadLoading(false));
    } catch (e) {
      console.log("error from addNewPostHandler : ", e);
      dispatch(setPostUploadLoading(false));
    }
  };

  const cancelUploadHandler = () => {
    console.log("aborting upload");
    if (abortController.current) {
      abortController.current.abort();
      dispatch(setPostUploadLoading(true));
      dispatch(setPostUploadProgress(0));
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
              disabled={uploadLoading}
              onPress={addNewPostHandler}
              color={
                colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted
              }
            />
          ),
        }}
      />
      {/* loading indicator while uploading content */}
      <LoadingIndicatorModal cancelUploadHandler={cancelUploadHandler} />

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

