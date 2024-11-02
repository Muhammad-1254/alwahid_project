import React, { useState } from "react";
import { View, TextInput, Text, Pressable, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import axios from "axios";
import { apiRoutes } from "@/src/constants/apiRoutes";
import * as SecureStore from "expo-secure-store";
import Checkbox from "expo-checkbox";
import { UserRoleEnum } from "@/src/types/user";
import { AuthLoadingModal } from "./signup";
import { setIsAuthenticated } from "@/src/store/slices/auth";
import { useAppDispatch } from "@/src/hooks/redux";
import ParsePhoneNumber from "libphonenumber-js";
import { checkIsValidEmail, checkIsValidPhoneNumber } from "@/src/lib/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import ErrorHandler from "@/src/lib/ErrorHandler";

type InitialLoginStateProps = {
  email: string;
  password: string;
  userRole: UserRoleEnum;
  errors: {
    email?: string;
    password?: string;
    userRole?: UserRoleEnum;
    unknown?: string;
  };
};
export default function Login() {
  const [user, setUser] = useState<InitialLoginStateProps>({
    email: "usman@gmail.com",
    password: "usman123",
    userRole: UserRoleEnum.NORMAL,
    errors: {},
  });
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const dispatch = useAppDispatch();




  async function handleLogin() {
    setUser((prev) => ({ ...prev, errors: {} }));
    
    // checking if email is valid
    if(!checkIsValidEmail(user.email)){
      // if email is not valid then check if it is a phone number
      const phoneNumber = checkIsValidPhoneNumber(user.email);
      if(!phoneNumber){
        setUser((prev) => ({
          ...prev,
          errors: { email: "Invalid Email or Phone Number" },
        }));
        return;
      }else{
        setUser((prev) => ({
          ...prev,
          email: phoneNumber,
        }));
      }
    }

    try {
      setLoading(true);
      const res = await axios.post(apiRoutes.login, {
        email: user.email,
        password: user.password,
        role: user.userRole,
      });
      if (res.status === 401) {
        setUser((prev) => ({
          ...prev,
          errors: { unknown: "Invalid Credentials" },
        }));
        throw new Error("Invalid Credentials");
      }
      if (res.status === 200 || res.status === 201) {
        if (res.data.accessToken && res.data.refreshToken) {
          // save token to local storage
          await SecureStore.setItemAsync("accessToken", res.data.accessToken);
          await SecureStore.setItemAsync("refreshToken", res.data.refreshToken);
          // save user data to redux
          dispatch(setIsAuthenticated(true));
        } else {
          setUser((prev) => ({
            ...prev,
            errors: { unknown: "Something went wrong while login" },
          }));
          throw new Error("Something went wrong while login");
        }
      } else console.log("Not handle status while login: ", res.status);
      setLoading(false);
      router.replace("/(tabs)");
    } catch (error) {
      console.log("error while login", error);
      if(axios.isAxiosError(error)){
        if(error.response?.status === 401){
          ErrorHandler.handle(error,{alertTitle:"Invalid Credentials",customMessage:`${checkIsValidEmail(user.email)?"Email":"Phone Number"} or Password is incorrect`});
        }else{
          ErrorHandler.handle(error);
        }
      }else{
        ErrorHandler.handle(error);
      }
    }finally{
      setLoading(false);
  }
}

  return (
    <ScrollView className="bg-background dark:bg-backgroundDark pt-12">
      <AuthLoadingModal loading={loading} />

      <View className="w-[95%] gap-y-5 mx-auto">
        <Text
          className="text-primary dark:text-primaryDark 
         text-3xl font-semibold text-center "
        >
          Login to your Account
        </Text>
        <View>
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            Email or Phone
          </Text>
          <TextInput
            onChangeText={(t) => setUser((prev) => ({ ...prev, email: t }))}
            value={user.email}
            placeholder="jonDoe@address.com"
            autoCapitalize={"none"}
            keyboardType="email-address"
            className="w-full p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
          />
          {user.errors.email && (
            <Text className="text-destructive dark:text-destructiveDark font-normal  mt-2 text-center">
              {user.errors.email}
            </Text>
          )}
        </View>
        <View className="">
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            Password{" "}
          </Text>
          <View className=" w-full  flex-row items-center ">
            <TextInput
              onChangeText={(t) => setUser({ ...user, password: t.trim() })}
              value={user.password}
              secureTextEntry={showPassword}
              placeholder="Password"
              autoCapitalize={"none"}
              keyboardType="default"
              className="flex-1 p-2  text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-l-inputRadius "
            />
           
            <MaterialCommunityIcons
            name={showPassword?"eye-off":"eye"}
            size={24}
            color={colorScheme === "dark" ? Colors.dark.input : Colors.light.input}
            onPress={()=>setShowPassword(prev=>!prev)}
            style={{
              width:48,
              height:"100%",
              textAlign:"center",
              textAlignVertical:"center",
              borderTopRightRadius:12,
              borderBottomRightRadius:12,
              backgroundColor:colorScheme === "dark" ? "#fafafa":"#171717" 
            }}
            />
          </View>
          {user.errors.password && (
            <Text className="text-destructive dark:text-destructiveDark font-normal  mt-2 text-center">
              {user.errors.password}
            </Text>
          )}
        </View>
        <View>
          <Text className="text-primary dark:text-primaryDark text-center  mb-2">Please select your role. Default Normal</Text>

        <View className="flex-row items-center justify-evenly">

          <Pressable
            className="flex-1 flex-row  items-center justify-center gap-x-2  pb-4 pt-1"
            onPress={() => setUser({ ...user, userRole: UserRoleEnum.NORMAL })}
          >
            <Checkbox value={user.userRole === UserRoleEnum.NORMAL} />
            <Text className="text-primary dark:text-primaryDark">Normal</Text>
          </Pressable>
          <Pressable
            className="flex-1 flex-row  items-center justify-center gap-x-2  pb-4 pt-1"
            onPress={() => setUser({ ...user, userRole: UserRoleEnum.CREATOR })}
          >
            <Checkbox value={user.userRole === UserRoleEnum.CREATOR} />
            <Text className="text-primary dark:text-primaryDark">Creator</Text>
          </Pressable>
          <Pressable
            className="flex-1 flex-row  items-center justify-center gap-x-2  pb-4 pt-1"
            onPress={() => setUser({ ...user, userRole: UserRoleEnum.ADMIN })}
          >
            <Checkbox value={user.userRole === UserRoleEnum.ADMIN} />
            <Text className="text-primary dark:text-primaryDark">Admin</Text>
          </Pressable>
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
