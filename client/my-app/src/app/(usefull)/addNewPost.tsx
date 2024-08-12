import {
  View,
  FlatList,
  Button,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  GetSimilarFriendsZoneByNameResponse,
  setModalResponseData,
  setNewPostMedia,
  setNewPostText,
  TGetSimilarHashtagByNameResponse,
} from "@/src/store/slices/addPost";
import { useDispatch } from "react-redux";
import _ from "lodash";
import { Image } from "react-native";
import { getSimilarHashtagByName } from "@/src/lib/utils";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";

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




type DocumentFilesProps = {
  item: DocumentPicker.DocumentPickerAsset;
  index: number;
};
export const AddNewPostFlatListDocumentItems: FC<DocumentFilesProps> = ({
  item,
  index,
}) => {
  const dispatch = useDispatch();
  const { postMedias } = useAppSelector((s) => s.newPost);
  const removeDocument = (index: number) => {
    dispatch(setNewPostMedia(postMedias.filter((_, i) => i !== index)));
  };
  const { colorScheme } = useColorScheme();

  const getMimeTypeIcon = (mimeType: string) => {
    if (mimeType.includes("video")) {
      return (
        <Ionicons
          name="videocam"
          size={28}
          color={
            colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          }
          style={{
            width: 80,
            height: 80,
            borderRadius: 999,
            textAlign: "center",
            textAlignVertical: "center",
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          }}
        />
      );
    } else if (mimeType.includes("audio")) {
      return (
        <Ionicons
          name="musical-note"
          size={28}
          color={
            colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          }
          style={{
            width: 80,
            height: 80,
            borderRadius: 999,
            textAlign: "center",
            textAlignVertical: "center",
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          }}
        />
      );
    } else if (mimeType.includes("pdf")) {
      return (
        <Ionicons
          name="document"
          size={28}
          color={
            colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          }
          style={{
            width: 80,
            height: 80,
            borderRadius: 999,
            textAlign: "center",
            textAlignVertical: "center",
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          }}
        />
      );
    }
    return null;
  };
  return (
    <View className="relative w-20 h-20   items-center justify-center mx-2">
      {item.mimeType &&
        (item.mimeType.includes("image") ? (
          <Image
            className="w-full h-full rounded-full object-cover bg-center"
            source={{ uri: item.uri }}
          />
        ) : (
          getMimeTypeIcon(item.mimeType)
        ))}
      <Ionicons
        title="remove"
        onPress={() => removeDocument(index)}
        name="remove-circle"
        size={24}
        color="white"
        style={{ position: "absolute", top: 0, right: 0, borderRadius: 50 }}
      />
    </View>
  );
};

export const AddNewPostInput = () => {
  const { text } = useAppSelector((s) => s.newPost);

  const { colorScheme } = useColorScheme();

  const dispatch = useDispatch();

  const searchSimilarHashtagAndUsers = async (q: string) => {
    try {
      if (q.startsWith("#")) {
        const data = (await getSimilarHashtagByName(q.slice(1, q.length))).data;
        console.log({ data });
        dispatch(setModalResponseData(data));
      } else if (q.startsWith("@")) {
        // TODO: get similar users
        // const data = (await getSimilarFriendsZoneByName(q.slice(1, q.length)))
        //   .data;
        dispatch(
          setModalResponseData([
            {
              isOnline: true,
              user: {
                userId: "1",
                firstname: "John",
                lastname: "Doe",
                avatar:
                  "https://images.pexels.com/photos/839011/pexels-photo-839011.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              },
            },

            {
              isOnline: false,
              user: {
                userId: "2",
                firstname: "Jane",
                lastname: "Doe",
                avatar:
                  "https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              },
            },
          ])
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  const functionDebounce = useCallback(
    _.debounce(async (q: string) => await searchSimilarHashtagAndUsers(q), 200),
    []
  );

  const onTextChangeHandler = (q: string) => {
    dispatch(setNewPostText(q));
    const t = q.split(" ");
    const t1 = t[t.length - 1];
    console.log({ t1 });
    if (t1.startsWith("#") || t1.startsWith("@")) {
      functionDebounce(t1);
    } else {
      dispatch(setModalResponseData([]));
    }
  };

  return (
    <>
      <TextInput
        className="border  max-h-[85%] -z-10  text-primary dark:text-primaryDark
         text-base p-2"
        value={text}
        onChangeText={onTextChangeHandler}
        placeholder="Enter Your Thoughts"
        placeholderTextColor={
          colorScheme === "dark" ? Colors.dark.input : Colors.light.input
        }
        cursorColor={
          colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
        }
        multiline={true}
        scrollEnabled={true}
      />
    </>
  );
};

export const TagsUserNameBottomSheet = () => {
  const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);
  const { colorScheme } = useColorScheme();
  const { text, modalResponseData } = useAppSelector((s) => s.newPost);
  const dispatch = useDispatch();
  const ref = useRef<BottomSheet>(null);
  console.log("original text outside: ", text);
  
  function hashtagHandler(item: TGetSimilarHashtagByNameResponse[0]) {
    console.log("original text: ", text);
    const preText = text.slice(0, text.lastIndexOf("#") - 1);
    console.log("item.hashtag.name: ", item.hashtag.name)
    console.log({preText})
    dispatch(setNewPostText(preText + " #" + item.hashtag.name));
    ref.current?.close();
  }
  function taggedUserHandler(item: GetSimilarFriendsZoneByNameResponse[0]) {
    const preText = removeLastWord(text);
    dispatch(
      setNewPostText(preText + " @" + item.user.firstname + item.user.lastname)
    );
    ref.current?.close();
  }
  function removeLastWord(str: string) {
    const lastSpaceIndex = str.lastIndexOf("#");
    console.log({ lastSpaceIndex });
    console.log({ str });
    if (lastSpaceIndex === -1) return "";
    const s = str.slice(0, lastSpaceIndex);
    console.log("removing last word: ", s);
    return s;
  }
  const renderItem = useCallback(
    ({
      item,
    }: {
      item:
        | TGetSimilarHashtagByNameResponse[0]
        | GetSimilarFriendsZoneByNameResponse[0];
    }) => {
      if ("hashtag" in item) {
        return (
          <TouchableOpacity onPress={() => hashtagHandler(item)}>
            <View className="flex-row items-center justify-between px-5 py-2">
              <Text className="text-blue-600 dark:text-blue-500 text-base">
                #{item.hashtag.name}
              </Text>
              <Text className="text-blue-600 dark:text-blue-500">
                {item.count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity onPress={() => taggedUserHandler(item)}>
            <View className="flex-row items-center justify-between px-4 py-2 ">
              <Image
                source={{ uri: item.user.avatar }}
                className="w-[72px] h-[72px] rounded-full "
              />
              <Text className="text-primary dark:text-primaryDark">
                {item.user.firstname + " " + item.user.lastname}
              </Text>
              <View
                className={`w-2 h-2 rounded-full 
                ${
                  item.isOnline
                    ? " bg-green-500 dark:bg-green-400"
                    : "bg-gray-500 dark:bg-gray-400"
                }
                `}
              />
            </View>
          </TouchableOpacity>
        );
      }
    },
    []
  );
  useEffect(() => {
    if (modalResponseData.length > 0) {
      ref.current?.snapToIndex(0);
      console.log("snaping index");
    }
  }, [modalResponseData]);
  return (
    <BottomSheet
      backgroundStyle={{
        backgroundColor:
          colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
      }}
      handleIndicatorStyle={{
        backgroundColor:
          colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary,
      }}
      enablePanDownToClose={true}
      index={-1}
      ref={ref}
      snapPoints={snapPoints}
    >
      <BottomSheetFlatList
        data={modalResponseData}
        keyExtractor={(i) => ("hashtag" in i ? i.hashtag.id : i.user.userId)}
        renderItem={renderItem}
      />
    </BottomSheet>
  );
};
