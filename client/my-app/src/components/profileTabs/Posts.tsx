import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import cAxios from "@/src/lib/cAxios";
import { apiRoutes } from "@/src/constants/apiRoutes";
import { Link, useRouter } from "expo-router";

type PostProps = {
  id: string;
  admin_user: string | null;
  creator_user_id: string;
  admin_user_id: string | null;
  post_by: string;
  text_content: string;
  postMedias: PostMediasProps[];
  created_at: string;
  updated_at: string;
};

type PostMediasProps = {
  id: string;
  mime_type: string;
  url: string;
  created_at: string;
  updated_at: string;
};

export default function UserProfilePosts() {
  const [data, setData] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(false);
  const { colorScheme } = useColorScheme();
  const router = useRouter()
  useEffect(() => {
    async function getPostData() {
      setLoading(true);
      try {
        const res = await cAxios.get(apiRoutes.findUserPersonalPosts);
        setData(res.data);
        setLoading(false);
      } catch (e) {
        console.log("error from getting user Personal Posts: ", e);
        setLoading(false);
      }
    }
    if (data.length === 0) {
      getPostData();
    }
  }, []);


  if (loading) {
    return (
      <View className="mt-6">
        <ActivityIndicator
          size={"large"}
          color={
            colorScheme === "dark"
              ? Colors.dark.mutedForeground
              : Colors.light.mutedForeground
          }
        />
      </View>
    );
  }

  return (
    <View className="w-full flex-row flex-wrap items-center   z-10 ">
      {data?.map((item, _) => {
        return (
            <TouchableOpacity className="w-[33%] aspect-square"
            key={item.id} onPress={() =>router.push(`postDetails/${item.id}`) } >
              <Image
                source={{ uri: item.postMedias[0].url }}
                className="w-full h-full object-cover bg-center"
              />
      </TouchableOpacity>
            
        );
      })}
    </View>
  );
}
