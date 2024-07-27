import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

export default function PostDetailScreen() {
  const [data, setData] = useState();
  const { postId } = useLocalSearchParams();
  useEffect(() => {
    
  },[]);
  return (
    <View>
      <Text>{postId}</Text>
    </View>
  );
}
