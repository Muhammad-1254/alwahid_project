import { useState } from "react";
import {
  Alert,
  View,
  TextInput,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { Link, usePathname, useRouter } from "expo-router";
import { z } from "zod";
import axios from "axios";
import { apiRoutes } from "@/src/constants/apiRoutes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setUser as setGlobalUser } from "@/src/store/slices/auth";
const LoginSchema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .min(8, "Email must be at least 8 characters"),
  password: z.string().min(6, "Password must be at least 6 characters "),
});
type LoginFormValues = z.infer<typeof LoginSchema>;
type LoginFormError = Partial<Record<keyof LoginFormValues, string>>;
type InitialLoginStateProps = {
  email: string;
  password: string;
  errors: LoginFormError;
};
export default function Login() {
  const [user, setUser] = useState<InitialLoginStateProps>({
    email: "usman@gmail.com",
    password: "usman123",
    errors: {},
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  async function handleLogin() {
    console.log("clicked");
    const validation = LoginSchema.safeParse({
      email: user.email,
      password: user.password,
    });
    if (!validation.success) {
      const fieldErrors = validation.error.errors.reduce((acc, err) => {
        acc[err.path[0] as keyof LoginFormValues] = err.message;
        return acc;
      }, {} as LoginFormError);
      setUser({ ...user, errors: { ...fieldErrors } });
    } else {
      try {
        setUser({ ...user, errors: {} });
        setLoading(true);
        const res = await axios.post(apiRoutes.login, {
          username: user.email,
          password: user.password,
        });
        if (
          (res.status === 200 || res.status === 201) &&
          res.data.access_token &&
          res.data.refresh_token
        ) {
          // save token to local storage
          await AsyncStorage.setItem("accessToken", res.data.access_token);
          await AsyncStorage.setItem("refreshToken", res.data.refresh_token);
          // saving user data to state
          dispatch(
            setGlobalUser({
              ...res.data.user
            })
          );
          router.navigate("(tabs)");
        }
        setLoading(false);
      } catch (error) {
        console.log({ error });
        setLoading(false);
      }
    }
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
            Email or Phone
          </Text>
          <TextInput
            onChangeText={(t) => setUser({ ...user, email: t })}
            value={user.email}
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
