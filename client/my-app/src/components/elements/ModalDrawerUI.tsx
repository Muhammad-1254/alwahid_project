import { View, Text } from "react-native";
import React from "react";
import { cn } from "@/src/lib/utils";


export default function ModalDrawerUI({editClassNames}: {editClassNames?: string}) {
  return (
    <View className={cn("bg-yellow-600 items-center justify-normal gap-y-1 mt-2.5",`${editClassNames}`) }>
      <View  className="w-10 h-[3px] bg-primary dark:bg-primaryDark opacity-60 rounded-full"/>
      <View  className="w-10 h-[3px] bg-primary dark:bg-primaryDark opacity-60 rounded-full"/>
    </View>
  );
}
