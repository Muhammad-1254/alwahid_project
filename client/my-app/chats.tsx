import _, { find, get, last, set } from "lodash";
import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Button,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { chatsData } from "@/src/constants/data";
import { useAppSelector } from "@/src/hooks/redux";
import { Link, useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { Image } from "react-native";
import moment from "moment";
import { FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src/db/schema/chatSchema";
import { desc, eq, sql } from "drizzle-orm";
import { TChat } from "@/src/store/slices/chatScreenData";
import { chatService } from "@/src/db/services/chat.service";
import { apiChatRoutes, apiRoutes } from "@/src/constants/apiRoutes";
import ChatSocket from "@/src/lib/chat/SocketClient.lib";
import {
  MessageEventEnums,
} from "@/src/lib/chat/message-sub-events.lib";
import cAxios from "@/src/lib/cAxios";
import LoadingIndicatorModal from "@/src/components/modals/LoadingIndicatorModal";
import { handleAsync } from "@/src/lib/utils";
// import { generateKeyPair } from "@/src/lib/chat/crypto.lib";
import * as SecureStore from "expo-secure-store";
import { generateKeyPair } from "@/src/lib/chat/crypto.lib";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { applicationKeyStoreKeys } from "@/src/constants/key-store-keys";
import {type Socket } from "socket.io-client";


type ChatScreenDataType = {

};
 

export default function Chats() {
  const userId = useAppSelector((state) => state.userInformation.userBasicInfo.userId);
  const database = useSQLiteContext();
  const db = drizzle(database, { schema });

  const [chatScreenData, setChatScreenData] = useState<ChatScreenDataType>({ chat: [], group: [] });
  const [loading, setLoading] = useState(false);
  // initial stage
  const [pageInitLoading, setPageInitLoading] = useState(false);
  const [userFoundInChatSection, setUserFoundInChatSection] = useState(false);
  const socket = useRef<Socket | null>(null);
  // ... initial stage
  async function getUserFoundInChat() {
    try {
      setPageInitLoading(true);
      const res = await cAxios.get(apiChatRoutes.getUserOnChatSection);
      if (res.status === 200) {
        setUserFoundInChatSection(res.data);
      }
    } catch (error) {
      console.log("error while fetching user on chat section", error);
      setUserFoundInChatSection(false);
    } finally {
      setPageInitLoading(false);
    }
  }
  async function getChatScreenData() {
    try {
      setLoading(true);
      const data = await chatService.getChatScreenData(db);
 
      // @ts-ignore 
      setChatScreenData({ chat: data.chat , group: data.group });
    } catch (error) {
      console.error("error while fetching getChatScreenData ", error);
    } finally {
      setLoading(false);
    }
  }
 
  async function fetchNewMessage() {}

  useEffect(() => {
 getUserFoundInChat();
 getChatScreenData();
 fetchNewMessage();
  }, []);

  
  useEffect(()=>{
    const socket = ChatSocket.getInstance();
    if(!socket.isConnected()) 
    socket.connect(apiChatRoutes.wsUrl)

    // listening for socket events
  
    console.log(socket.isConnected())

    return ()=>{
    }
    
  },[])


  async function createNewUserInChatSection() {
    const {privateKey,publicKey} =  await generateKeyPair(userId)
    await SecureStore.setItemAsync("privateKey",privateKey.toString())
    await SecureStore.setItemAsync("publicKey",publicKey.toString())
    // get flag that indicates user is already in chat section

    const [data, error] = await handleAsync(
      cAxios.post(apiChatRoutes.createNewUserInChatSection,{publicKey}),
    );
    if (data?.status === 200 || data?.status === 201) {
      setUserFoundInChatSection(true);
      await AsyncStorage.setItem(applicationKeyStoreKeys.userInChatSection,'true')
    }
    if (error) {
      console.log("error while creating new user in chat section", error);
      await AsyncStorage.setItem(applicationKeyStoreKeys.userInChatSection,'false')
    }
  }
  return (
    <>
      {userFoundInChatSection ? (
        <View className="bg-background dark:bg-backgroundDark flex-1">
          {/* <SearchInput /> */}
           
         
        </View>
      ) : (
        <View className="flex-1 bg-background dark:bg-backgroundDark items-center justify-center">
          <Text className="text-primary dark:text-primaryDark">
            Start messaging to your friends
          </Text>
          <Button
            title="start messaging"
            onPress={createNewUserInChatSection}
          />
        </View>
      )}

      <LoadingIndicatorModal uploadLoading={loading} />
    </>
  );
}

const SearchInput = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const { colorScheme } = useColorScheme();

  const searchHandler = async (q: string) => {
    const data = chatsData.filter((chat) =>
      chat.username.toLowerCase().includes(q.toLowerCase())
    );
    // dispatch(setChatScreenData([...data]));
  };

  const debounce = useCallback(
    _.debounce(async (q: string) => await searchHandler(q), 300),
    []
  );

  const onChangeTextHandler = (text: string) => {
    setSearch(text);
    setSearchLoading(true);
    debounce(text);
    if (text.length === 0) {
      setSearchLoading(false);
    }
  };
  return (
    <View className=" bg-muted dark:bg-mutedDark w-[97%] h-16 flex-row  items-center justify-evenly px-  my-4 mx-auto rounded-full ">
      <TextInput
        value={search}
        onChangeText={onChangeTextHandler}
        placeholder="🔍  Search..."
        placeholderTextColor={"gray"}
        className=" text-primary dark:text-primaryDark  w-[85%] h-full text-base tracking-wider     pl-4 "
      />
      <View className="flex-1 h-full items-center justify-center ">
        {search.length > 0 ? (
          <Ionicons
            name="close"
            size={24}
            onPress={() => setSearch("")}
            style={{ opacity: 0.75 }}
            color={
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary
            }
          />
        ) : null}
      </View>
    </View>
  );
};

const RenderItem = ({ item }: { item: any }) => {
  const router = useRouter();

  const navigationHandler = (userId: number) => {
    // router.push({ pathname: "/chats/[userId]", params: { userId } });
  };
  return (
    <TouchableWithoutFeedback
      // key={index}
      onPress={() => navigationHandler(item.userId)}
    >
      {/* <Link asChild className='z-10' onPress={()=>console.log("pressed")} href={{pathname:"/chats/[userId]",params:{userId:chat.userId}}}> */}
      <View
        className="w-full h-24 px-4 flex-row items-center justify-between "
      >
        <View className="w-20 h-20 rounded-full overflow-hidden ">
          <Image
            source={{ uri: item.profileImage }}
            className="w-full h-full   "
            resizeMode="cover"
          />
        </View>
        <View className=" flex-1 h-full justify-evenly items-baseline mx-4 ">
          <Text className="text-primary dark:text-primaryDark  text-lg font-semibold capitalize">
            {item.username}
          </Text>
          <Text className="text-primary dark:text-primaryDark opacity-70">
            {item.lastMessage.length > 35
              ? item.lastMessage.slice(0, 35) + "..."
              : item.lastMessage}
          </Text>
        </View>
        <View className="h-full items-center justify-center  -mt-8">
          <Text className="text-primary dark:text-primaryDark opacity-70">
            {moment(item.lastMessageTime).format("h:mm a")}
          </Text>
        </View>
      </View>

      {/* </Link> */}
    </TouchableWithoutFeedback>
  );
};
