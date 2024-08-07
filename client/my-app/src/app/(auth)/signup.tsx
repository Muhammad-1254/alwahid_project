import { useEffect, useRef, useState } from "react";
import {
  Alert,
  View,
  TextInput,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import Checkbox from "expo-checkbox";
import axios from "axios";
import { apiRoutes } from "@/src/constants/apiRoutes";
import DatePicker from "@react-native-community/datetimepicker";
import { useColorScheme } from "nativewind";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
// import PhoneInput from "react-native-phone-number-input";
import Modal from "@/src/components/elements/modal";
import * as Progress from "react-native-progress";
import { GenderEnum } from "@/src/types/user";


type initialSignUpState = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender?: GenderEnum;
};
const userInitialState: initialSignUpState = {
  email: "",
  password: "",
  confirmPassword: "",
  firstname: "",
  lastname: "",
  gender: undefined,
}
export default function SignUp() {
  const [user, setUser] = useState<initialSignUpState>(userInitialState);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState<Date | null>(null);
  const [show, setShow] = useState(false);
  const [maximumDate, setMaximumDate] = useState<Date | null>(null);
  const [minimumDate, setMinimumDate] = useState<Date | null>(null);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");

  // const phoneInputRef = useRef<PhoneInput>(null);

  const { colorScheme } = useColorScheme();

  async function signUpWithEmail() {
    // if (!phoneInputRef?.current?.isValidNumber(phoneNumber)) {
    //   Alert.alert("Invalid Phone Number");
    //   return;
    // }
    if (!date) {
      Alert.alert("Please select your date of birth");
      return;
    }
    if (user.password !== user.confirmPassword) {
      Alert.alert("Password does not match");
      return;
    }
    if (user.gender === undefined) {
      Alert.alert("Please select Gender");
      return;
    }

    setLoading(true);
    const res = await axios.post(apiRoutes.signup, {
      email: user.email,
      password: user.password,
      firstname: user.firstname,
      lastname: user.lastname,
      gender: user.gender,
      dateOfBirth: date,
      phoneNumber: formattedPhoneNumber,
      authProvider: "local",
    });
    setLoading(false);

    if (res.status === 201 || res.status === 200) {
      Alert.alert("Please check your inbox for email verification!.\nThen login again");
      setUser(userInitialState)
      setDate(null)
      setPhoneNumber("")
      setFormattedPhoneNumber("")

    } else {
      Alert.alert("Something went wrong, Please try again later!");
    }
  }

  const onDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios");
    setDate(currentDate);
  };
  const showDatePicker = () => {
    setShow(true);
  };

  useEffect(() => {
    // setting max and min date
    // the date should between 10 min and 100 max
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 10);
    setMaximumDate(maxDate);
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    setMinimumDate(minDate);
  }, []);
  return (
    <ScrollView className="bg-background dark:bg-backgroundDark ">
      <AuthLoadingModal loading={loading} />
      {show && (
        <DatePicker
          testID="dateTimePicker"
          value={date ?? new Date()}
          mode="date"
          maximumDate={maximumDate ?? new Date()}
          minimumDate={minimumDate ?? new Date()}
          display="default"
          themeVariant={colorScheme === "dark" ? "dark" : "light"}
          onChange={onDateChange}
        />
      )}
      <View className="w-[95%] gap-y-5 mx-auto mt-10">
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
            onChangeText={(t) => setUser({ ...user, lastname: t.trim() })}
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
            onChangeText={(t) => setUser({ ...user, email: t.trim() })}
            value={user.email}
            placeholder="jonDoe@address.com"
            autoCapitalize={"none"}
            keyboardType="email-address"
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
            onChangeText={(t) =>
              setUser({ ...user, confirmPassword: t.trim() })
            }
            value={user.confirmPassword}
            secureTextEntry={true}
            placeholder="Confirm Password"
            autoCapitalize={"none"}
            keyboardType="visible-password"
            className="w-full p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
          />
        </View>
        {/* <View className="">
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            Phone Number
          </Text>
          <PhoneInput
            ref={phoneInputRef}
            defaultValue={""}
            defaultCode="PK"
            layout="first"
            onChangeText={(text) => {
              setPhoneNumber(text);
            }}
            onChangeFormattedText={(text) => {
              setFormattedPhoneNumber(text);
            }}
            autoFocus
            containerStyle={{
              width: "100%",
              padding: 0,
              backgroundColor: colorScheme === "dark" ? "#fafafa" : "#171717",
              borderRadius: 12,
            }}
            textContainerStyle={{
              backgroundColor: colorScheme === "dark" ? "#fafafa" : "#171717",
              borderRadius: 12,
            }}
            textInputStyle={{
              color: colorScheme === "dark" ? "#262626" : "#e5e5e5",
            }}
            codeTextStyle={{
              color: colorScheme === "dark" ? "#262626" : "#e5e5e5",
            }}
          />
        </View> */}

        <View className="flex-row-reverse items-center justify-around">
          <Fontisto
            name="date"
            size={32}
            color={
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary
            }
            onPress={showDatePicker}
          />
          {date && (
            <Text className="text-primary dark:text-primaryDark ">
              Selected Date: {date.toDateString()}
            </Text>
          )}
        </View>
        <View className="flex-row items-center justify-evenly">
          <View className="flex-row  items-center justify-normal gap-x-2">
            <Checkbox
              value={
                user.gender === undefined ? false : user.gender === GenderEnum.MALE
              }
              onValueChange={() => setUser({ ...user, gender: GenderEnum.MALE })}
            />
            <Text className="text-primary dark:text-primaryDark">Male</Text>
          </View>
          <View className="flex-row  items-center justify-normal gap-x-2">
            <Checkbox
              value={
                user.gender === undefined
                  ? false
                  : user.gender === GenderEnum.FEMALE
              }
              onValueChange={() => setUser({ ...user, gender: GenderEnum.FEMALE })}
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
      <Text className=" text-primary dark:text-primaryDark  text-center pt-5 mb-10 ">
        Already have and Account? &nbsp;
        <Link
          href={"/login"}
          className="font-semibold text-blue-500 dark:text-blue-400"
        >
          Login here
        </Link>
      </Text>
    </ScrollView>
  );
}

export const AuthLoadingModal = ({ loading }: { loading: boolean }) => {
  const { colorScheme } = useColorScheme();
  return (
    <Modal
      visible={loading}
      transparent={true}
      animationType="fade"
      withInput={false}
      showStatusBar={true}
    >
      <Progress.CircleSnail
        size={100}
        indeterminate
        direction="clockwise"
        color={
          colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
        }
      />
    </Modal>
  );
};
