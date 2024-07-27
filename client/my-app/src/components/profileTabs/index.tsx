import { View, Text, useWindowDimensions } from "react-native";
import React, { FC, useState } from "react";
import { Tab, TabView } from "@rneui/themed";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "@/src/hooks/redux";
import UserProfilePosts from "./Posts";
import UserProfileSavedPosts from "./SavedPosts";
import UserProfileLikePosts from "./LikePosts";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
export default function ProfileTabs() {
  const [index, setIndex] = useState(2);
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();

  const user = useAppSelector((state) => state.auth.data);
  return (
    <View className="bg-background dark:bg-backgroundDark">
      <Tabs index={index} setIndex={setIndex} />
      <TabsData index={index} setIndex={setIndex} />
    </View>
  );
}

type TabsProps = {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
};
const Tabs: FC<TabsProps> = ({ index, setIndex }) => {
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const userRole = useAppSelector((state) => state.auth.data.role);
  const AnimatedViewStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(
            index === 2 ? 0 : index === 1 ? width / 3 : (width / 3) * 2,
            { duration: 150 }
          ),
        },
      ],
    };
  });

  return (
    <View className="relative w-full h-12 flex-row-reverse items-center justify-between mt-4 mb-2">
      <Animated.View
        style={[AnimatedViewStyle]}
        className={`absolute w-[32%] left-0   h-full bg-muted dark:bg-mutedDark rounded-lg`}
      />

      <View className="w-[32%] h-full ">
        <Ionicons
          name={index === 0 ? "bookmark" : "bookmark-outline"}
          size={36}
          onPress={() => setIndex(0)}
          color={
            colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          }
          style={{
            width: "100%",
            height: "100%",
            textAlign: "center",
            textAlignVertical: "center",
          }}
        />
      </View>

      <View className="w-[32%] h-full">
        <Ionicons
          name={index === 1 ? "heart" : "heart-outline"}
          size={36}
          onPress={() => setIndex(1)}
          color={
            colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          }
          style={{
            width: "100%",
            height: "100%",
            textAlign: "center",
            textAlignVertical: "center",
          }}
        />
      </View>
      {(userRole === "admin" || userRole === "creator") && (
        <View className="w-[32%] h-full">
          <Ionicons
            name={index === 2 ? "grid" : "grid-outline"}
            size={32}
            onPress={() => setIndex(2)}
            color={
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary
            }
            style={{
              width: "100%",
              height: "100%",
              textAlign: "center",
              textAlignVertical: "center",
            }}
          />
        </View>
      )}
    </View>
  );
};

type TabDataProps = {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
};

const TabsData: FC<TabDataProps> = ({ index, setIndex }) => {
  if (index === 0) {
    return <UserProfileSavedPosts />;
  } else if (index === 1) {
    return <UserProfileLikePosts />;
  } else if (index === 2) {
    return <UserProfilePosts />;
  }
};
