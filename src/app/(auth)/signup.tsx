import { useState } from "react";
import { Alert, View, TextInput, Text, Pressable, ScrollView } from "react-native";
import { supabase } from "../../lib/supabase";
import { Link } from "expo-router";
import Checkbox from "expo-checkbox";
enum Gender {
  MALE = "male",
  FEMALE = "female",
}
type initialSignUpState = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender?: Gender;
  age?: string;
};
export default function SignUp() {
  const [user, setUser] = useState<initialSignUpState>({
    email: "",
    password: "",
    confirmPassword: "",

    firstname: "",
    lastname: "",
    gender: undefined,
    age: undefined,
  });

  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (user.password !== user.confirmPassword) {
      Alert.alert("Password does not match");
      return;
    }
    if (user.gender === undefined) {
      Alert.alert("Please select Gender");
      return;
    }
    if(user.age === undefined){
      Alert.alert("Please enter your age")
      return;
    }
    if( Number.parseInt(user.age)<=  0){
      Alert.alert("Please enter a valid age")
      return;
    }


    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          first_name: user.firstname,
          last_name: user.lastname,
          gender: user.gender,
          age:user.age
        },
      },
    });

    if (error) Alert.alert(error.message);
    else if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <ScrollView
      className="bg-background dark:bg-backgroundDark pt-16"
    >

      <View className="w-[95%] gap-y-5 mx-auto">
        <Text
          className="text-primary dark:text-primaryDark 
         text-2xl font-semibold text-center "
        >
          Create new Account
        </Text>
        <View className="">
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            First Name
          </Text>
          <TextInput
            onChangeText={(t) => setUser({ ...user, firstname: t.trim() })}
            value={user.firstname}
            placeholder="Jon"
            autoCapitalize={"none"}
            keyboardType="default"
            className="w-full p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
          />
        </View>
        <View className="">
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            Last Name
          </Text>
          <TextInput
            onChangeText={(t) => setUser({ ...user, lastname: t.trim()})}
            value={user.lastname}
            placeholder="Doe"
            autoCapitalize={"none"}
            keyboardType="default"
            className="w-full p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
          />
        </View>
        <View className="">
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            E-mail
          </Text>
          <TextInput
            onChangeText={(t) => setUser({ ...user, email: t.trim()})}
            value={user.email}
            placeholder="jonDoe@address.com"
            autoCapitalize={"none"}
            keyboardType="email-address"
            className="w-full p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
          />
        </View>
        <View className="">
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            Age
          </Text>
          <TextInput
            onChangeText={(t) => setUser({ ...user, age: t.trim() })}
            value={user.age}
            placeholder="jonDoe@address.com"
            keyboardType="number-pad"
            className="w-full p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
          />
        </View>
        <View className="">
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            Password
          </Text>

          <TextInput
            onChangeText={(t) => setUser({ ...user, password: t.trim() })}
            value={user.password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={"none"}
            keyboardType="visible-password"
            className="w-full p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
          />
        </View>
        <View className="">
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            Confirm Password{" "}
          </Text>
          <TextInput
            onChangeText={(t) => setUser({ ...user, confirmPassword: t.trim() })}
            value={user.confirmPassword}
            secureTextEntry={true}
            placeholder="Confirm Password"
            autoCapitalize={"none"}
            keyboardType="visible-password"
            className="w-full p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
          />
        </View>
        <View className="flex-row items-center justify-evenly">
          <View className="flex-row  items-center justify-normal gap-x-2">
            <Checkbox
              value={
                user.gender === undefined ? false : user.gender === Gender.MALE
              }
              onValueChange={() => setUser({ ...user, gender: Gender.MALE })}
            />
            <Text className="text-primary dark:text-primaryDark">Male</Text>
          </View>
          <View className="flex-row  items-center justify-normal gap-x-2">
            <Checkbox
              value={
                user.gender === undefined
                  ? false
                  : user.gender === Gender.FEMALE
              }
              onValueChange={() => setUser({ ...user, gender: Gender.FEMALE })}
            />
            <Text className="text-primary dark:text-primaryDark">Female</Text>
          </View>
        </View>
        <Pressable
          disabled={loading}
          onPress={() => signUpWithEmail()}

          className="items-center justify-center py-2 bg-secondaryForeground dark:bg-secondaryForegroundDark rounded-inputRadius"
        >
          <Text className="text-lg text-primaryForeground dark:text-primaryForegroundDark">
            Signup
          </Text>
        </Pressable>
      </View>
      <Text className="text-xs text-primary dark:text-primaryDark  text-center pt-5">
        Already have and Account? &nbsp;
        <Link  href={"/login"} className="font-semibold text-blue-500 dark:text-blue-400">
          Login here
        </Link>
      </Text>
    </ScrollView>
  );
}
