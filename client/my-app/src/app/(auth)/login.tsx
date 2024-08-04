import { useState } from "react";
import { View, TextInput, Text, Pressable, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import axios from "axios";
import { apiRoutes } from "@/src/constants/apiRoutes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import Checkbox from "expo-checkbox";
import { UserRoleEnum } from "@/src/types/user";
import { AuthLoadingModal } from "./signup";
import { setIsAuthenticated, setUserRole } from "@/src/store/slices/auth";

type InitialLoginStateProps = {
  email: string;
  password: string;
  userRole: UserRoleEnum;
  errors: { email?: string; password?: string, userRole?: UserRoleEnum};
};
export default function Login() {
  const [user, setUser] = useState<InitialLoginStateProps>({
    email: "usman@gmail.com",
    password: "usman123",
    userRole: UserRoleEnum.NORMAL,
    errors: {},
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  async function handleLogin() {
    if(!user.email){
      setUser({...user, errors:{email: "Email is required"}});
    }
    if(!user.password || user.password.length < 6){
      setUser({...user, errors:{password: "Password must be at least 6 characters long"}});
    }

      try {
        setUser({ ...user, errors: {} });
        setLoading(true);
        const res = await axios.post(apiRoutes.login, {
          username: user.email,
          password: user.password,
          role: user.userRole,
        });

        if (
          (res.status === 200 || res.status === 201) &&
          res.data.accessToken &&
          res.data.accessToken
        ) {
          // save token to local storage
          await AsyncStorage.setItem("accessToken", res.data.accessToken);
          await AsyncStorage.setItem("refreshToken", res.data.accessToken);
          
          // save user data to redux
          dispatch(setIsAuthenticated(true));

          setLoading(false);
          await new Promise((res) => setTimeout(res, 1000));
          router.replace("/(tabs)");
        }
        setLoading(false);
      } catch (error) {
        console.log({ error });
        setLoading(false);
      }
    
  }

  return (
    <ScrollView className="bg-background dark:bg-backgroundDark pt-16">
      <AuthLoadingModal loading={loading} />
      <View className="w-[95%] gap-y-5 mx-auto">
        <Text
          className="text-primary dark:text-primaryDark 
         text-2xl font-semibold text-center"
        >
          Login to your Account
        </Text>
        <View className="">
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            Email or Phone
          </Text>
          <TextInput
            onChangeText={(t) => setUser({ ...user, email: t })}
            value={user .email}
            placeholder="jonDoe@address.com"
            autoCapitalize={"none"}
            keyboardType="email-address"
            className="w-full p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
          />
          {user.errors.email && (
            <Text className="text-red-500 dark:text-red-400">
              {user.errors.email}
            </Text>
          )}
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
          {user.errors.password && (
            <Text className="text-red-500 dark:text-red-400">
              {user.errors.password}
            </Text>
          )}
        </View>
        <View className="flex-row items-center justify-evenly">
          <View className="flex-row  items-center justify-normal gap-x-2">
            <Checkbox
              value={
                user.userRole === undefined
                  ? false
                  : user.userRole === UserRoleEnum.NORMAL
              }
              onValueChange={() =>
                setUser({ ...user, userRole: UserRoleEnum.NORMAL })
              }
            />
            <Text className="text-primary dark:text-primaryDark">Normal</Text>
          </View>
          <View className="flex-row  items-center justify-normal gap-x-2">
            <Checkbox
              value={
                user.userRole === undefined
                  ? false
                  : user.userRole === UserRoleEnum.CREATOR
              }
              onValueChange={() =>
                setUser({ ...user, userRole: UserRoleEnum.CREATOR })
              }
            />
            <Text className="text-primary dark:text-primaryDark">Creator</Text>
          </View>
          <View className="flex-row  items-center justify-normal gap-x-2">
            <Checkbox
              value={
                user.userRole === undefined
                  ? false
                  : user.userRole === UserRoleEnum.ADMIN
              }
              onValueChange={() =>
                setUser({ ...user, userRole: UserRoleEnum.ADMIN })
              }
            />
            <Text className="text-primary dark:text-primaryDark">Admin</Text>
          </View>
        </View>

        <Pressable
          // disabled={loading}
          onPress={() => handleLogin()}
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
