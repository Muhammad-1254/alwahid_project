import {
  View,
  Text,
  TouchableHighlight,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  FlatList,
  Button,
} from "react-native";
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { chatsData } from "@/src/constants/data";
import {
  setChatDetailsScreenData,
  TMessage,
} from "@/src/store/slices/chatScreenData";
import { useAppSelector } from "@/src/hooks/redux";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import moment from "moment";
import Spacer from "@/src/components/elements/Spacer";
import { handleAsync } from "@/src/lib/utils";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src/db/schema/chatSchema";
import {
  chatService,
  InsertUserChatMessageType,
  MessageScreenDataType,
  UserChatInformationType,
} from "@/src/db/services/chat.service";
import { MessageDetailScreenRouteTargetType } from "@/src/types/chat";
import Modal from "@/src/components/elements/modal";
import { type Socket } from "socket.io-client";
import ChatSocket from "@/src/lib/chat/SocketClient.lib";
import SocketIOClient from "socket.io-client";
import { apiChatRoutes } from "@/src/constants/apiRoutes";
import { getItemAsync } from "expo-secure-store";
import {
  MessageEventEnums,
  MessageSubscriptionsEnum,
} from "@/src/lib/chat/message-sub-events.lib";
import { Message } from "@/src/db/schema/chatSchema";
import { sql } from "drizzle-orm";
import { updateJwtToken } from "@/src/lib/chat/chat.utils.lib";
/*
In route params there are two values, type and id. Type can be either 'chat' or 'group'. Id is the id of the chat or group.
we can first check from server that if user have chat or group with this id and type. If user have chat or group with this id then we can check in our local db if user or group register or not.
if user register than we simply load previous data. if not present in local db than we create new.
if chat or group is not present in server than we can show modal that show that start new chat with that user or request admin to add you in group.
*/

const pageControlInitialState = {
  isLoadComplete: false,
  isLoading: false,
  offset: 0,
  limit: 10,
};

enum ShowModalTypeEnum {
  NEW_CHAT = "NEW_CHAT",
  NEW_GROUP = "NEW_GROUP",
  NORMAL = "NORMAL",
}

export default function ChatDetailScreen() {
  const database = useSQLiteContext();
  const db = drizzle(database, { schema });
  const userId = useAppSelector((s) => s.userInformation.userBasicInfo.userId);
  const {
    type: targetType,
    id: targetId,
  }: { type: string; id: string | null } = useLocalSearchParams();
  const [friendData, setFriendData] = useState<UserChatInformationType>();
  const [data, setData] = useState<MessageScreenDataType[]>([]);
  const pageControl = useRef(pageControlInitialState);

  const [showModalType, setShowModalType] =
    useState<null | ShowModalTypeEnum>();

  const { colorScheme } = useColorScheme();
  const router = useRouter();

  const [input, setInput] = useState("");

  async function initial() {
    // checking  if user wants to create new chat with another user
    switch (targetType) {
      case MessageDetailScreenRouteTargetType.NEW_CHAT:
        setShowModalType(ShowModalTypeEnum.NEW_CHAT);
        break;
      case MessageDetailScreenRouteTargetType.NEW_GROUP:
        setShowModalType(ShowModalTypeEnum.NEW_GROUP);
        break;
      case MessageDetailScreenRouteTargetType.Chat ||
        MessageDetailScreenRouteTargetType.Group:
        setShowModalType(ShowModalTypeEnum.NORMAL);
    }
  }

  async function getUserInformation() {
    const [result, error] = await handleAsync(
      chatService.getChatUserInformation({ db, chatId: targetId })
    );
    if (error) {
      console.log(
        "error while fetching user information from local db: ",
        error
      );
      return;
    }
    if (result && result.length === 0) return;
    setFriendData(result[0]);
  }

  const sendMessageHandler = async (_) => {
    const { textContent, mediaContent, mediaType } = _;
    if(!tempUuid) return;
    const socket = ChatSocket.getInstance();
    if (!socket.isConnected()) {
      socket.connect(apiChatRoutes.wsUrl);
    }

    // first insert message in to our  local db
    const message: InsertUserChatMessageType = {
      id: tempUuid,
      chatId: targetId,
      textContent,
      mediaContent,
      mediaType,
      ownerId: userId,
      sentAt: new Date().toISOString(),
    };
    const [result, error] = await handleAsync(
      chatService.insertUserChatMessage({ db, data: message })
    );

    if (error) {
      console.error("error while inserting message into local db: ", error);
      return;
    }
    // now update in list
    setData((prev)=>[
      ...prev,
      {
        id: tempUuid,
        chatId: targetId,
        textContent,
        mediaContent:null,
        mediaType:null,
        ownerId: userId,
        sentAt: message.sentAt,
        deliveredAt: null,
        readAt: null,
        groupId: null,
        isSent: 0,
      },
    ]);

    if (socket.isConnected()) {
      if (textContent) {
        console.log("sending message: ", textContent);
        socket.emit(MessageSubscriptionsEnum.MESSAGE_SEND, {
          id: message.id,
          chatId: message.chatId,
          friendId: friendData?.id,
          textContent:message.textContent,
          sentAt: message.sentAt,
        });
      }
    }
    setTempUuid(null);
  }

  async function getMessages() {
    if (pageControl.current.isLoadComplete) return;
    if (targetType === MessageDetailScreenRouteTargetType.Chat) {
      const [result, error] = await handleAsync(
        chatService.getUserChatMessages({
          db,
          chatId: targetId,
          offset: pageControl.current.offset,
          limit: pageControl.current.limit,
        })
      );
      if (error) {
        console.error(
          "error from while fetching chat message from local db: ",
          error
        );
        return;
      }
      if (result && result.length === 0) {
        return;
      }
      setData(result);
    } else if (targetType === MessageDetailScreenRouteTargetType.Group) {
      const [result, error] = await handleAsync(
        chatService.getUserGroupMessages({
          db,
          groupId: targetId,
          offset: pageControl.current.offset,
          limit: pageControl.current.limit,
        })
      );
      if (error) {
        console.error(
          "error from while fetching group message from local db: ",
          error
        );
        return;
      }
      if (result && result.length === 0) {
        return;
      }
      setData(result);
    }
  }

  async function CreateUserNewChat() {}
  async function CreateAddUserInNewGroup() {}
  function cancelCreateChatOrGroup() {
    setShowModalType(null);
    router.back();
  }
  useEffect(() => {
    initial();
  },[])

  useEffect(() => {
    const socket = ChatSocket.getInstance();
    if (!socket.isConnected()) {
      socket.connect(apiChatRoutes.wsUrl);
    }

    // socket.on(MessageEventEnums.CONNECTED, (data) =>
    //   console.log(MessageEventEnums.CONNECTED, "called: \n", data)
    // );
    // socket.on(MessageEventEnums.DISCONNECTED, (data) =>
    //   console.log(MessageEventEnums.DISCONNECTED, "called: \n", data)
    // );
    socket.on(MessageEventEnums.ERROR, (data) =>
      console.log(MessageEventEnums.ERROR, "called: \n", data)
    );
    socket.on(MessageEventEnums.MESSAGE_DELIVERED, (data) =>
      console.log(MessageEventEnums.MESSAGE_DELIVERED, "called: \n", data)
    );
    socket.on(MessageEventEnums.MESSAGE_UPLOAD, (data) =>
      console.log(MessageEventEnums.MESSAGE_UPLOAD, "called: \n", data)
    );
    
    socket.on(MessageEventEnums.MESSAGE_GET, (data) =>
     { 
      console.log(MessageEventEnums.MESSAGE_GET, "called: \n", data)
       setData((prev)=>[...prev,...data])
  }
);
    socket.on(MessageEventEnums.MESSAGE_SEEN, (data) =>
      console.log(MessageEventEnums.MESSAGE_SEEN, "called: \n", data)
    );
    socket.on(MessageEventEnums.MESSAGE_TYPING, (data) =>
      console.log(MessageEventEnums.MESSAGE_TYPING, "called: \n", data)
    );
 


    // temp events
    socket.on("temp-get-uuid", (data) => {
      setTempUuid(data);
    });
    return () => {
      socket.off(MessageEventEnums.CONNECTED);
      socket.off(MessageEventEnums.DISCONNECTED);
      socket.off(MessageEventEnums.ERROR);
      socket.off(MessageEventEnums.MESSAGE_DELIVERED);
      socket.off(MessageEventEnums.MESSAGE_GET);
      socket.off(MessageEventEnums.MESSAGE_SEEN);
      socket.off(MessageEventEnums.MESSAGE_TYPING);
    };
  }, []);
  useEffect(() => {
    getMessages();
    getUserInformation();
  }, []);
  const [tempUuid, setTempUuid] = useState<string>();
  function tempGetUuid() {
    const socket = ChatSocket.getInstance();
    console.log(socket.isConnected());
    socket.isConnected() && socket.emit("temp-get-uuid", null);
  }
  function checkSocket(){
    const socket = ChatSocket.getInstance();
    console.log("is socket connected: ",socket.isConnected());
  } 
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerStyle: {
            backgroundColor:
              colorScheme === "light" ? Colors.dark.muted : Colors.light.muted,
          },
          headerLeft: () => (
            <View className="flex-row items-center ">
              <Ionicons
                style={{ padding: 10, marginLeft: 0 }}
                name="arrow-back"
                onPress={() => router.back()}
                size={24}
                color={
                  colorScheme === "light"
                    ? Colors.dark.primary
                    : Colors.light.primary
                }
              />
              <TouchableHighlight className="" onPress={() => {}}>
                <View className="flex-row items-center gap-x-3 ">
                  <View className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      className="w-full h-full "
                      resizeMode="cover"
                      source={{ uri: friendData?.avatarUrl }}
                    />
                  </View>
                  <Text className="text-base ">
                    {friendData?.firstname}&nbsp; {friendData?.lastname}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>
          ),
          headerRight: () => (
            <Ionicons
              name="ellipsis-vertical"
              size={24}
              color={
                colorScheme === "light"
                  ? Colors.dark.primary
                  : Colors.light.primary
              }
              style={{ marginRight: 10 }}
            />
          ),
        }}
      />

      <View className="flex-1 relative  ">
        <Button title="get uuid" onPress={tempGetUuid} />
        <Button
            title="connect socket temp"
            onPress={checkSocket}
          />
        <FlatList
          keyExtractor={(item) => item.id?.toString()}
          data={data}
          className="flex-1 bg-background dark:bg-backgroundDark  "
          contentContainerStyle={{
            rowGap: 10,
            paddingTop: 10,
          }}
          renderItem={({ item }) => <RenderItem item={item} />}
        />

        <ChatsInput sendMessageHandler={sendMessageHandler} />
      </View>
      <Modal
        visible={showModalType && showModalType !== ShowModalTypeEnum.NORMAL}
        transparent={true}
      >
        <View className="w-[80%] h-[50%] items-center justify-evenly bg-muted dark:bg-mutedDark  rounded-3xl">
          {showModalType === ShowModalTypeEnum.NEW_CHAT ? (
            <Button
              title="start chat with username"
              onPress={CreateUserNewChat}
            />
          ) : (
            <Button
              title="join group groupName"
              onPress={CreateAddUserInNewGroup}
            />
          )}
          <Button
            title="connect socket temp"
            onPress={checkSocket}
          />
          <Button title="cancel" onPress={cancelCreateChatOrGroup} />
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 border border-border"
              value={input}
              onChangeText={(text) => setInput(text)}
            />
            <Button title="send" onPress={() => {}} />
          </View>
        </View>
      </Modal>
    </>
  );
}


const RenderItem = ({ item }: { item: MessageScreenDataType }) => {
  const userId = useAppSelector(
    (state) => state.userInformation.userBasicInfo.userId
  );
  return (
    <>
      <View
        className={`flex-row
          ${item.ownerId === userId ? "justify-end" : " justify-start"}`}
      >
        <View className=" relative min-w-[100px] max-w-[80%] px-4 pt-4 pb-6 mx-4 bg-accent dark:bg-accentDark    rounded-2xl  ">
          <Text className="text-primary dark:text-primaryDark">
            {item.textContent}
          </Text>
          <Text className="absolute right-10 bottom-1 text-xs font-normal text-primary dark:text-primaryDark opacity-50  ">
            {moment().format("hh:mm a")}
          </Text>
          {/* for delivered and seen */}
          <View className="absolute right-4 bottom-1 flex-row items-center gap-x-2">
              <View className={`w-1 h-1 ${item.isSent===1?"bg-green-400":"bg-white"} `}/>        
              <View className={`w-1 h-1 ${item.readAt?"bg-green-400":"bg-white"} `}/>            

          </View>
        </View>
      </View>
    </>
  );
};

interface ChatInputProps {
  sendMessageHandler: (_: {
    textContent?: string;
    mediaContent?: string;
    mediaType?: string;
  }) => Promise<void>;
}

const ChatsInput: FC<ChatInputProps> = ({ sendMessageHandler }) => {
  const [input, setInput] = useState("");
  const [inputHeight, setInputHeight] = useState(80);
  const { colorScheme } = useColorScheme();

  async function _sendMessageHandler() {
    if (input.length > 0) {
   await   sendMessageHandler({ textContent: input });
      setInput("");
      setInputHeight(80);
  }
  }

  // animation for input width
  const animatedWidth = useRef(new Animated.Value(78)).current;
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: input.length > 1 ? 90 : 78,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [input]);
  const animatedStyle = {
    width: animatedWidth.interpolate({
      inputRange: [78, 90],
      outputRange: ["78%", "90%"],
    }),
  };
  // ...

  return (
    <>
      <View
        style={{ height: inputHeight - 20 }}
        className="absolute bottom-0 w-full  bg-background dark:bg-backgroundDark opacity-50 "
      />

      <View
        style={{ height: inputHeight }}
        className={`absolute bottom-0  w-full flex-row px-1  ${
          inputHeight >= 80 ? "items-end pb-[2.5%]" : "items-center"
        }`}
      >
        <View
          style={{ height: inputHeight - 20 }}
          className={`  bg-muted  dark:bg-mutedDark flex-1 flex-row    rounded-[30px]  px-3 ${
            inputHeight > 80 ? "items-end pb-[2.5%]" : "items-center"
          }  `}
        >
          <Animated.View style={{ ...animatedStyle }}>
            <TextInput
              value={input}
              onChangeText={(text) => setInput(text)}
              placeholderTextColor={"gray"}
              placeholder="Message"
              className="w-full  text-base font-medium text-primary dark:text-primaryDark   "
              multiline
              scrollEnabled
              onContentSizeChange={(e) => {
                const height = e.nativeEvent.contentSize.height + 30;
                if (height > 150) setInputHeight(150);
                else if (height > 40) setInputHeight(height + 16);
              }}
            />
          </Animated.View>

          <Ionicons
            name="attach-outline"
            size={32}
            style={{ opacity: 0.75 }}
            color={
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary
            }
          />
          <Ionicons
            name="camera-outline"
            size={32}
            style={{
              opacity: 0.75,
              transform: [{ translateX: input.length > 1 ? 150 : 0 }],
            }}
            color={
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary
            }
          />
        </View>
        <Spacer styles="w-1 h-full" />
        <TouchableOpacity
          className="w-12 h-12 items-center justify-center bg-green-500  dark:bg-green-400 rounded-full"
          onPress={_sendMessageHandler}
        >
          <Ionicons
            name={input.length > 1 ? "send" : "mic"}
            size={input.length > 1 ? 24 : 32}
            color={
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary
            }
          />
        </TouchableOpacity>
      </View>
    </>
  );
};
