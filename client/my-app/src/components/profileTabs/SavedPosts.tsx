import { View, Text, ScrollView, ActivityIndicator,  } from "react-native";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";

export default function UserProfileSavedPosts() {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading]= useState(false)
  const { colorScheme } = useColorScheme();
  useEffect(() => {
    async function getSavedPostData() {
    setLoading(true)
        // fake delay
      await new Promise((res) => setTimeout(res, 2500));
      setData(["Post 1", "Post 2", "Post 3", "Post 4", "Post 5"]);
      setLoading(false)
   
    }
    
    getSavedPostData();
  }, []);


  if(loading){
    return    (
    <View className="mt-6">
    <ActivityIndicator size={'large'} color={colorScheme==='dark'?Colors.dark.mutedForeground:Colors.light.mutedForeground}
    
    />
    </View>
)
  }
  return (
    <View className="w-full flex-row flex-wrap items-center   z-10 ">
      {data.map((item) => (
        <Text  key={item} className="text-primary dark:text-primaryDark w-[33%]  h-32 ">
          {item} 
        </Text>
      ))}
    
    </View>
  );
}
