import _ from "lodash";
import { View, Text, TextInput, TouchableWithoutFeedback } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setChatScreenData, TChat } from "@/src/store/slices/chatScreenData";
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
export default function Chats() {
  const dispatch = useDispatch();
  const chatScreenData = useAppSelector(
    (state) => state.chatScreen.value.chatScreen
  );

  useEffect(() => {
    dispatch(setChatScreenData([...chatsData]));
  }, []);

  return (
    <View className="bg-background dark:bg-backgroundDark flex-1">
      <SearchInput />
      <FlatList
        data={chatScreenData}
        renderItem={(item) => (
          <RenderItem index={item.index} item={item.item} />
        )}
        keyExtractor={(item, _) => _.toString()}
        scrollEnabled
      />
      {/* <ScrollView className='flex-1   ' >
  
  {chatsScreenData.map((chat,_)=>{
    return(
      <TouchableWithoutFeedback key={_} onPress={()=>navigationHandler(chat.userId)} >

      <View key={_+12} className='w-full h-24 px-4 flex-row items-center justify-between '>
<View className='w-20 h-20 rounded-full overflow-hidden '>
      <Image
  
  source={{uri:chat.profileImage}}
  className='w-full h-full   '
      resizeMode='cover'
      
      />
      </View>
    <View className=' flex-1 h-full justify-evenly items-baseline mx-4 '>
      <Text className='text-primary dark:text-primaryDark  text-lg font-semibold capitalize'>{chat.username}</Text>
      <Text className='text-primary dark:text-primaryDark opacity-70'>{chat.lastMessage.length>35?chat.lastMessage.slice(0,35)+"...":chat.lastMessage}</Text>
    </View>
    <View className='h-full items-center justify-center  -mt-8'>
      <Text className='text-primary dark:text-primaryDark opacity-70'>{moment(chat.lastMessageTime).format("h:mm a")}</Text>
      </View>
      </View>
    
    </TouchableWithoutFeedback>

  )})}
 
</ScrollView>  */}
    </View>
  );
}

const SearchInput = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  
  const {colorScheme} = useColorScheme()

  const searchHandler = async (q: string) => {
    const data = chatsData.filter((chat) =>
      chat.username.toLowerCase().includes(q.toLowerCase())
    );
    dispatch(setChatScreenData([...data]));
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
        <View className="flex-1 h-full items-center justify-center "  >

{search.length>0?
      <Ionicons name="close"  size={24} onPress={()=>setSearch('')} style={{opacity:0.75}} color={colorScheme==='dark'?Colors.dark.primary:Colors.light.primary} />
    :null}
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
