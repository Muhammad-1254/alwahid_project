import {
  View,
  FlatList,
  Button,
} from "react-native";
import React, {
  useState,
} from "react";
import { Stack, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";

import { useAppSelector } from "@/src/hooks/redux";
import {
  setNewPostMedia,
} from "@/src/store/slices/addPost";
import { useDispatch } from "react-redux";
import _ from "lodash";

import { AddNewPostFlatListDocumentItems, AddNewPostInput, TagsUserNameBottomSheet,  } from "@/src/components/AddNewPostC";
export default function AddNewPost() {
  const [showSelectedDocuments, setShowSelectedDocuments] = useState(false);
  const router = useRouter();
  const selectedDocumentsheight = useSharedValue(80);
  const { text, postMedias } = useAppSelector((s) => s.newPost);
  const dispatch = useDispatch();

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "audio/*", "application/pdf", "video/*"],
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        dispatch(setNewPostMedia([...postMedias, ...result.assets]));
        setShowSelectedDocuments(true);
      } else {
        console.log("document picker cancelled");
      }
    } catch (e) {
      console.log("error from file picker", e);
    }
  };

  const handleGoBack = () => {
    if(text.length > 0 || postMedias.length > 0) {
    Alert.alert("Discard Post", "Are you sure you want to discard this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => {
          router.back();
        },
      },
    ]);
  }else router.back()

  };
  const handleSelectedDocumentsCollapse = () => {
    if (showSelectedDocuments) {
      selectedDocumentsheight.value = withTiming(
        selectedDocumentsheight.value - 80
      );
      setShowSelectedDocuments(false);
    } else {
      selectedDocumentsheight.value = withTiming(
        selectedDocumentsheight.value + 80
      );
      setShowSelectedDocuments(true);
    }
  };
  const { colorScheme } = useColorScheme();
  const navigateToPostView = () => {
    // checking if post is null then alert user

    if (text.length == 0 && postMedias?.length == 0) {
      Alert.alert("Post is Empty", "Post is empty, kindly some content", [
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    } else {
      router.push("/addNewPostView");
    }
  };
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Add New Post",
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
              onPress={handleGoBack}
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
              title="View"
              onPress={navigateToPostView}
              color={
                colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted
              }
            />
          ),
        }}
      />

      <View className="relative flex-1    bg-background dark:bg-backgroundDark">
        <Ionicons
          style={{
            borderWidth: 1,
            borderColor: "red",
            position: "absolute",
            bottom: showSelectedDocuments
              ? postMedias.length > 0
                ? 128
                : 20
              : 50,
            right: 10,
            backgroundColor:
              colorScheme === "dark"
                ? Colors.dark.popover
                : Colors.dark.popover,
            borderRadius: 10,
            paddingTop: 4,
            paddingBottom: 2,
            paddingHorizontal: 10,
          }}
          name="add-sharp"
          size={28}
          color={
            colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          }
          onPress={pickDocuments}
        />

        {/* selected media  */}
        {postMedias.length > 0 && (
          <Animated.View
            style={{ height: selectedDocumentsheight }}
            className={`absolute bottom-0  w-screen  
        ${
          showSelectedDocuments ? "border-y" : "border-y-2 "
        } border-popover dark:border-gray-400  `}
          >
            <View>
              <FlatList
                className=""
                horizontal={true}
                data={postMedias}
                keyExtractor={(item) => item.uri}
                renderItem={({ item, index }) => (
                  <AddNewPostFlatListDocumentItems item={item} index={index} />
                )}
              />
              <Ionicons
                style={{
                  borderWidth: 1,
                  borderColor: "red",
                  position: "absolute",
                  right: 10,
                  top: -42,
                  backgroundColor:
                    colorScheme === "dark"
                      ? Colors.dark.popover
                      : Colors.dark.popover,
                  borderRadius: 10,
                  paddingTop: 2,
                  paddingHorizontal: 8,
                }}
                name="chevron-down"
                size={32}
                color={
                  colorScheme === "dark"
                    ? Colors.dark.primary
                    : Colors.light.primary
                }
                onPress={handleSelectedDocumentsCollapse}
              />
            </View>
          </Animated.View>
        )}

        <AddNewPostInput />
        <TagsUserNameBottomSheet />

      </View>
    </>
  );
}
