import {
  View,
  Text,
  Button,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  Image,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Platform } from "react-native";
import cAxios from "@/src/lib/cAxios";
import { apiRoutes } from "@/src/constants/apiRoutes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MessageDetailScreenRouteTargetType } from "@/src/types/chat";

export default function Search() {
  const [data, setData] = useState<any>([]);
  const [input, setInput] = useState("");
  useEffect(() => {
    async function getUsers() {
      const res = await cAxios.get(`${apiRoutes.getUsersSearch}/${input}`);
      console.log(res.data);
      setData(res.data);
    }
    if(input.length>2)
    getUsers();
  }, [input]);

  const router = useRouter()
const userChatHandler = ()=>{
  router.push({
    pathname:"/(usefull)/chatsDetailsScreen/[type,id]",
    // @ts-expect-error  params are not optional
    params: { type: MessageDetailScreenRouteTargetType.NEW_CHAT, id:null  },
  })
}
  
  return (
    <View
      className="bg-background dark:bg-backgroundDark
    flex-1 "
    >
      <View className="w-full h-10 px-2 mt-10">
        <TextInput
          value={input}
          className="w-full h-full bg-muted dark:bg-mutedDark  text-primaryDark"
          onChangeText={(text) => setInput(text)}
        />
      </View>
      <View className="items-center justify-between gap-y-2">
        {data.map((item: any) => (
          <View key={item?.id}
          className="w-full h-20 flex-row items-center justify-between px-4 border border-borderDark rounded-2xl">
            <View
              className="w-20 h-20"
            >
            <Image
              className="w-full h-full rounded-full"
            source={{ uri: item?.avatarUrl }}
            />
            </View>
            <Text className="text-primaryDark flex-1 text-start">{item?.firstname}&nbsp;{item?.lastname}</Text>
            
            <Ionicons
            name="chatbubble-ellipses"
            size={24}
            color={'green'}
            onPress={userChatHandler}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
