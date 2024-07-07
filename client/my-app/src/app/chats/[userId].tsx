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
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
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

interface MessageProps {
  [key: string]: TMessage;
}

export default function ChatDetailScreen() {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const { userId } = useLocalSearchParams();
  const data = useAppSelector(
    (state) => state.chatScreen.value.chatDetailsScreen
  );
  const dispatch = useDispatch();
  const { colorScheme } = useColorScheme();
  const router = useRouter();

  function checkIfDayPassed(date: string) {
    const inputDate = new Date(date);
    const today = new Date();

    // Strip time part to only compare dates
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    const timeDiff = today.getTime() - inputDate.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24); // Convert time difference from milliseconds to days

    if (dayDiff === 0) {
      return "Today";
    } else if (dayDiff === 1) {
      return "Yesterday";
    } else {
      // Return the input date in ISO format (yyyy-mm-dd)
      return date.split("T")[0];
    }
  }
  useEffect(() => {
    if (userId && typeof userId === "string") {
      const data = chatsData.find((chat) => chat.userId === parseInt(userId));
      if (data) dispatch(setChatDetailsScreenData(data));
    }
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerLeft: () => (
            <View className="flex-row items-center  my-2">
              <Ionicons
                style={{ padding: 10, marginLeft: -10 }}
                name="arrow-back"
                onPress={() => router.back()}
                size={24}
                color={
                  colorScheme === "dark"
                    ? Colors.dark.primary
                    : Colors.light.primary
                }
              />
              <TouchableHighlight className="" onPress={()=>router.push("/modal")}>
                <View className="flex-row items-center gap-x-3 ">
                  <View className="w-12 h-12 rounded-full overflow-hidden">
                    {data.profileImage.length > 0 && (
                      <Image
                        className="w-full h-full "
                        resizeMode="cover"
                        source={{ uri: data.profileImage }}
                      />
                    )}
                  </View>
                  <Text className="text-primary dark:text-primaryDark text-lg">
                    {data.username}
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
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.primary
              }
            />
          ),
        }}
      />

      <View className="flex-1 relative  ">
        <FlatList
          className="flex-1 bg-background dark:bg-backgroundDark  "
          data={data.messages}
          renderItem={(i) => (
            <RenderItem
              message={i.item}
              messages={data.messages}
              index={i.index}
            />
          )}
          keyExtractor={(item, _) => _.toString()}
        />

        {/* <ScrollView className='flex-1 bg-background dark:bg-backgroundDark gap-y-4 py-2 '>
{data.messages.map((message,_)=>{
  return(
<View key={_}
className={`${message.isSent?'flex-row justify-end':'flex-row justify-start'} ${data.messages.length-1==_?"mb-4":'mb-0'} ${_==0?"mt4":"mt-0"}  `}
>
<View className='relative bg-accent dark:bg-accentDark  p-4 pb-5 mx-4  rounded-2xl max-w-[80%] '>
  <Text className='text-primary dark:text-primaryDark'>{message.message}</Text>
  <Text className='absolute text-primary dark:text-primaryDark opacity-50 right-4 bottom-1 '>{moment(message.dateTime).format("hh:mm a")}</Text>
 
</View>
</View>
)})}
    </ScrollView> */}
        <ChatsInput />
      </View>
    </>
  );
}

const RenderItem = ({
  messages,
  message,
  index,
}: {
  messages: TMessage;
  message: TMessage[0];
  index: number;
}) => {
  return (
    <>
      <Spacer styles={`${index == 0 ? "h-4" : "h-0"}`} />
      <View
        key={index}
        className={`${
          message.isSent ? "flex-row justify-end" : "flex-row justify-start"
        }`}
      >
        <View className="relative bg-accent dark:bg-accentDark  p-4 pb-5 mx-4  rounded-2xl max-w-[80%] ">
          <Text className="text-primary dark:text-primaryDark">
            {message.message}
          </Text>
          <Text className="absolute text-primary dark:text-primaryDark opacity-50 right-4 bottom-1 ">
            {moment(message.dateTime).format("hh:mm a")}
          </Text>
        </View>
      </View>
      <Spacer styles={messages.length-1 === index?"h-16":"h-4"} />
    </>
  );
};

const ChatsInput = () => {
  const [input, setInput] = useState("");
  const [inputHeight, setInputHeight] = useState(80);
  const { colorScheme } = useColorScheme();
  
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

  return (
    <>
      <View style={{height:inputHeight-20}} className="absolute bottom-0 w-full  bg-background dark:bg-backgroundDark opacity-50 " />

        <View  style={{height:inputHeight,}} className={`absolute bottom-0  w-full flex-row px-1  ${inputHeight>=80?"items-end pb-[2.5%]":"items-center"}`}>
          <View style={{height:inputHeight-20}} className={`  bg-muted  dark:bg-mutedDark flex-1 flex-row    rounded-[30px]  px-3 ${inputHeight>80?"items-end pb-[2.5%]":"items-center"}  `}>
            <Animated.View style={{ ...animatedStyle }}>
              <TextInput
                value={input}
                onChangeText={(text) => setInput(text)}
                placeholderTextColor={"gray"}
                placeholder="Message"
                className="w-full  text-base font-medium text-primary dark:text-primaryDark   "
                multiline
                scrollEnabled
               
                onContentSizeChange={(e)=>{
                  const height = e.nativeEvent.contentSize.height+30;
                  if(height>150)setInputHeight(150)
                  else if(height>40)setInputHeight(height+16)
                }}
              />
            </Animated.View>

            <Ionicons
              name="attach-outline"
              size={32}
              style={{ opacity: 0.75, }}
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
<Spacer styles="w-1 h-full"/>
          <TouchableOpacity
            className=""
            onLongPress={() => console.log("voice recording")}
          >
            <Ionicons
              name="mic"
              style={{
                padding: 10,
                backgroundColor: "lightgreen",
                borderRadius: 999,
              }}
              size={28}
              color={
                colorScheme === "dark"
                  ? Colors.dark.muted
                  : Colors.light.muted
              }
            />
          </TouchableOpacity>
        </View>
    </>
  );
};
