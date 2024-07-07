import { View, Text, Button, SwitchComponent, Switch, Alert } from "react-native";
import React from "react";
import { useAuth } from "@/src/hooks/auth";
import { useColorScheme } from "nativewind";
import { supabase } from "@/src/lib/supabase";

export default function Profile() {
  const { user } = useAuth();

  const { colorScheme, toggleColorScheme } = useColorScheme();

  const logoutHandler = async() => {
    const { error } = await supabase.auth.signOut();Button
    if(error){
      console.log(error);
    Alert.alert("Error logging out")
    }
  }
// console.log(user?.email)

  return (

    <View
      className="bg-background dark:bg-backgroundDark
    flex-1   items-center justify-evenly"
    >
      <Switch value={colorScheme == "dark"} onChange={toggleColorScheme} />
<Button title="logout"

onPress={logoutHandler}
/>
<View className="w-full  items-center justify-around">

        <Text className="text-primary dark:text-primaryDark">
          {user?.user_metadata?.email}
        </Text>
        <Text className="text-primary dark:text-primaryDark">
          {user?.user_metadata?.first_name}
        </Text>
        <Text className="text-primary dark:text-primaryDark">
          {user?.user_metadata?.last_name}
        </Text>
        <Text className="text-primary dark:text-primaryDark">
          {user?.user_metadata?.gender}
        </Text>
        <Text className="text-primary dark:text-primaryDark">
          {user?.user_metadata?.Age}
        </Text>
        <Text className="text-primary dark:text-primaryDark">
          {/* Role: {user?.user_metadata?.role} */}
        </Text>
</View>
    </View>
  );
}
