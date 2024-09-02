import _, { last } from "lodash";
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
import ChatSocket from "@/src/lib/chat/ChatSocket.lib";


export default function Chats() {
  const { Chat, Group, Message, User, UserGroupAssociation } = schema;
  
  const database = useSQLiteContext();
  const db = drizzle(database, { schema });
  
  const [chatScreenData, setChatScreenData] = useState({chat:[],group:[]});
  const [loading, setLoading] = useState(false);
  const [pageInitLoading,setPageInitLoading] = useState(true);
  const socket = useRef(ChatSocket.instance);
 
 // page initialization
  useEffect(()=>{
    socket.current = ChatSocket.getInstance();
    socket.current.on(apiChatRoutes.isUserOnChatSection,(data)=>{
      console.log("data",data);
    })
  },[])
  


  async function getChatScreenData() {
    try {
      setLoading(true);
      const data = await chatService.getChatScreenData(db);
      // setChatScreenData(data);
    } catch (error) {
      console.error("error while fetching getChatScreenData ", error);        
    }finally{
      setLoading(false);
    }
  }
  async function fetchNewMessage() {

  }
  useEffect(()=>{
    
  },[])
  useEffect(() => {
    getChatScreenData();
  }, []);

  return (
    <View className="bg-background dark:bg-backgroundDark flex-1">
      <SearchInput />
      {/* <FlatList
        data={chatScreenData}
        renderItem={(item) => (
          <RenderItem index={item.index} item={item.item} />
        )}
        keyExtractor={(item, _) => _.toString()}
        scrollEnabled
      /> */}
    </View>
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

const RenderItem = ({ index, item }: { index: number; item: TChat }) => {
  const router = useRouter();

  const navigationHandler = (userId: number) => {
    router.push({ pathname: "/chats/[userId]", params: { userId } });
  };
  return (
    <TouchableWithoutFeedback
      key={index}
      onPress={() => navigationHandler(item.userId)}
    >
      {/* <Link asChild className='z-10' onPress={()=>console.log("pressed")} href={{pathname:"/chats/[userId]",params:{userId:chat.userId}}}> */}
      <View
        key={index + 12}
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
