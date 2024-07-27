import * as DocumentPicker from "expo-document-picker";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../hooks/redux";
import {
  GetSimilarFriendsZoneByNameResponse,
  setModalResponseData,
  setNewPostMedia,
  setNewPostText,
  TGetSimilarHashtagByNameResponse,
} from "../store/slices/addPost";
import { Image, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "nativewind";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Text } from "react-native";
import { getSimilarHashtagByName } from "../lib/utils";
import _, { lastIndexOf } from "lodash";

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
