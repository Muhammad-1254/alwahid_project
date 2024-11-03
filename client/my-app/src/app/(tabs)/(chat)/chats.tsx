import {
  View,
  Text,
  TouchableWithoutFeedback,
  Image,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/src/hooks/redux";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src/db/schema/chatSchema";
import ChatSocket from "@/src/lib/chat/SocketClient.lib";
import { apiChatRoutes } from "@/src/constants/apiRoutes";
import {
  ChatScreenDataType,
  chatService,
} from "@/src/db/services/chat.service";
import { handleAsync } from "@/src/lib/utils";
import { Link, useRouter } from "expo-router";
import moment from "moment";
import { useColorScheme } from "nativewind";
import _ from "lodash";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import { FlashList } from "@shopify/flash-list";
import { MessageDetailScreenRouteTargetType } from "@/src/types/chat";
import { sql } from "drizzle-orm";

const Chats = () => {
  const database = useSQLiteContext();
  const db = drizzle(database, { schema });

  const [data, setData] = useState<ChatScreenDataType[]>([]);
  const [loading, setLoading] = useState(false);

  // get data from local db
  async function getChatScreenData() {
    console.log("fetching data from local db");
    setLoading(true);
    const [result, error] = await handleAsync(
      chatService.getChatScreenData(db)
    );
    console.log("result: ", result);
    if (error) {
      console.log("error while fetching initial data from local db: ", error);
      return;
    }
    if (result && result.length === 0) {
      return;
    }
    // @ts-ignore
    setData(result);
    setLoading(false);
  }

  useEffect(() => {
    // const socket = ChatSocket.getInstance();
    // if (!socket.isConnected()) {
    //   socket.connect(apiChatRoutes.wsUrl);
    // }
    getChatScreenData();
    return () => {
    };
  }, []);

  return (
    <View className="bg-muted dark:bg-mutedDark flex-1">
      <FlashList
        className="flex-1"
        data={data}
        // onEndReached={getChatScreenData}
        keyExtractor={(item) => item?.id}
        renderItem={({ item }) => <RenderItem item={item} />}
        estimatedItemSize={100}
      />
    </View>
  );
};

export default Chats;

const RenderItem = ({ item }: { item: ChatScreenDataType }) => {
  const router = useRouter();

  const navigationHandler = () => {
    router.push({
      pathname: "/chatsDetailsScreen/[type,id]",
      params: {
        // @ts-expect-error  params are not optional
        type: item.chatType,
        id: item.id,
      },
    });
  };
  return (
    <Pressable
      onPress={navigationHandler}
      className="w-full h-16 px-4 flex-row items-center justify-between "
    >
      <View className="w-14 h-14 rounded-full overflow-hidden ">
        <Image
          source={{ uri: item?.avatarUrl }}
          className="w-full h-full   "
          resizeMode="cover"
        />
      </View>
      <View className=" flex-1 h-full justify-evenly items-baseline mx-4 ">
        <Text className="text-primary dark:text-primaryDark  text-lg font-semibold capitalize">
          {Object.hasOwnProperty.call(item, "firstname")
          // @ts-expect-error Object.hasOwnProperty.call(item, "firstname") is always true
          ?`${item?.firstname} ${item?.lastname}`:item.groupName}
        </Text>
        <Text className="text-primary dark:text-primaryDark opacity-70">
          {item.lastMessageText?.length > 35
            ? item.lastMessageText.slice(0, 35) + "..."
            : item.lastMessageText}
        </Text>
      </View>
      <View className="h-full items-center justify-center  -mt-8">
        <Text className="text-primary dark:text-primaryDark opacity-70">
          {moment(item.lastMessageSentAt).format("h:mm a")}
        </Text>
      </View>
    </Pressable>
  );
};

const SearchInput = () => {
  const [search, setSearch] = useState("");

  const { colorScheme } = useColorScheme();

  const searchHandler = async (q: string) => {
    // const data = chatsData.filter((chat) =>
    //   chat.username.toLowerCase().includes(q.toLowerCase())
    // );
    // dispatch(setChatScreenData([...data]));
  };

  const debounce = useCallback(
    _.debounce(async (q: string) => await searchHandler(q), 300),
    []
  );

  const onChangeTextHandler = (text: string) => {
    // setSearch(text);
    // setSearchLoading(true);
    // debounce(text);
    // if (text.length === 0) {
    //   setSearchLoading(false);
    // }
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
