import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableHighlight,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { notificationsData } from "@/src/constants/data";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";

export default function Notification() {
  const { colorScheme } = useColorScheme();
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark ">
      <SortNotification />
      <ScrollView className="">
        <View className="">
          {notificationsData.map((item, _) => (
            <View
              key={_}
              className={`flex-row items-center px-4 py-2.5
   border-b border-border dark:border-borderDark 
   ${
     item.isRead
       ? "bg-popover dark:bg-popoverDark"
       : "bg-background dark:bg-backgroundDark"
   }`}
            >
              <View className={`w-2 h-2 rounded-full bg-muted dark:bg-muted`} />
              <Image
                source={{ uri: item.image }}
                alt="notification image"
                className="w-16 h-16 rounded-full object-cover bg-center mx-2.5"
              />
              <View className="flex-1">
                <Text className="text-primary dark:text-primaryDark text-base  mb-1">
                  {item.title}
                </Text>
                <Text className="text-primary dark:text-primaryDark font-medium">
                  {item.description.length > 80 ? (
                    <>
                      {item.description.slice(0, 80)}
                      <Text className="text-gray-500 dark:text-gray-400">
                        ...
                      </Text>
                    </>
                  ) : (
                    item.description
                  )}
                </Text>
              </View>
              <View className="items-center gap-y-3">
                <Text className="text-gray-500 dark:text-gray-400">
                  {item.date}
                </Text>
                <Ionicons
                  name="ellipsis-vertical"
                  size={25}
                  color={
                    colorScheme === "dark"
                      ? Colors.dark.primary
                      : Colors.light.primary
                  }
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SortNotification = () => {
  const [filters, setFilters] = useState({
    all: true,
    myPost: false,
    mentions: false,
  });
  return (
    <View
      style={{ gap: 20 }}
      className="w-full flex-row items-center px-4 py-7"
    >
      <TouchableWithoutFeedback
        onPress={() => setFilters({ ...filters, all: !filters.all })}
      >
        <Text
          className={`${
            filters.all
              ? "bg-green-500 dark:bg-green-400 text-primaryForeground dark:text-primaryForegroundDark border-0"
              : "bg-transparent   text-primary dark:text-primaryDark border "
          } border-gray-500 dark:border-gray-400 px-4 py-1 text-base  rounded-2xl `}
        >
          All
        </Text>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={() => setFilters({ ...filters, myPost: !filters.myPost })}
      >
        <Text
          className={`${
            filters.myPost
              ? "bg-green-500 dark:bg-green-400 text-primaryForeground dark:text-primaryForegroundDark border-0"
              : "bg-transparent   text-primary dark:text-primaryDark border "
          } border-gray-500 dark:border-gray-400 px-4 py-1 text-base  rounded-2xl `}
        >
          My posts
        </Text>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={() => setFilters({ ...filters, mentions: !filters.mentions })}
      >
        <Text
          className={`${
            filters.mentions
              ? "bg-green-500 dark:bg-green-400 text-primaryForeground dark:text-primaryForegroundDark border-0"
              : "bg-transparent   text-primary dark:text-primaryDark border "
          } border-gray-500 dark:border-gray-400 px-4 py-1 text-base  rounded-2xl `}
        >
          Mentions
        </Text>
      </TouchableWithoutFeedback>
    </View>
  );
};
