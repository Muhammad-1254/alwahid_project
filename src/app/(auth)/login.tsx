import { useState } from "react";
import {
  Alert,
  View,
  TextInput,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { Link, usePathname } from "expo-router";

type initialLoginState = {
  email: string;
  password: string;
};

export default function Login() {
  const [user, setUser] = useState<initialLoginState>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }
 
  return (
    <ScrollView className="bg-background dark:bg-backgroundDark pt-16">
      <View className="w-[95%] gap-y-5 mx-auto">
        <Text
          className="text-primary dark:text-primaryDark 
         text-2xl font-semibold text-center"
        >
          Login to your Account
        </Text>
        <View className="">
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            E-mail
          </Text>
          <TextInput
            onChangeText={(t) => setUser({ ...user, email: t })}
            value={user.email}
            placeholder="jonDoe@address.com"
            autoCapitalize={"none"}
            keyboardType="email-address"
            className="w-full p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
          />
        </View>
        <View className="">
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            Password{" "}
          </Text>
          <TextInput
            onChangeText={(t) => setUser({ ...user, password: t })}
            value={user.password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={"none"}
            keyboardType="visible-password"
            className="w-full p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
          />
        </View>

        <Pressable
          disabled={loading}
          onPress={() => signInWithEmail()}
          className="items-center justify-center py-2  bg-secondaryForeground dark:bg-secondaryForegroundDark rounded-inputRadius"
        >
          <Text className="text-lg text-primaryForeground dark:text-primaryForegroundDark ">
            Login
          </Text>
        </Pressable>
      </View>
      <Text className="text-sm text-primary dark:text-primaryDark  text-center mt-16">
        Don't have an Account? &nbsp;
        <Link href={"/signup"} className="text-blue-500 dark:text-blue-400">
          Signup here
        </Link>
      </Text>
    </ScrollView>
  );
}
