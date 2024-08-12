import { FC, useEffect, useRef, useState } from "react";
import {
  Alert,
  View,
  TextInput,
  Text,
  Pressable,
  ScrollView,
  Platform,
  Image,
  useWindowDimensions,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Checkbox from "expo-checkbox";
import axios from "axios";
import { apiRoutes } from "@/src/constants/apiRoutes";
import DatePicker from "@react-native-community/datetimepicker";
import { useColorScheme } from "nativewind";
import { Fontisto, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
// import PhoneInput from "react-native-phone-number-input";
import Modal from "@/src/components/elements/modal";
import * as Progress from "react-native-progress";
import { GenderEnum } from "@/src/types/user";
import { FlashList } from "@shopify/flash-list";
import { checkIsValidEmail, checkIsValidPhoneNumber } from "@/src/lib/utils";
import { AuthProviderEnum } from "@/src/types/auth";
import ErrorHandler from "@/src/lib/ErrorHandler";

const selectedCountryInitialState = {
  id: 173,
  countryName: "Pakistan",
  countryCode: "92",
  isoCode: "pk",
  flagUrl:
    "https://alwahid-post-data-01.s3.eu-north-1.amazonaws.com/country_flags/pk__92.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZGODJ2YXZRZEWNGS%2F20240808%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20240808T201156Z&X-Amz-Expires=518400&X-Amz-Signature=78628df8e36bad05673d596d1ffc5dbcc9e195f0158caf191bcf850df1a8f380&X-Amz-SignedHeaders=host&x-id=GetObject",
};

type initialSignUpState = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  gender: GenderEnum;
  error: {
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phoneNumber?: string;
    gender?: string;
    dateOfBirth?: string;
    unknown?: string;
  };
};
const userInitialState: initialSignUpState = {
  email: "amna@gmail.com",
  password: "usman123",
  confirmPassword: "usman123",
  firstname: "amna",
  lastname: "jabbar",
  phoneNumber: "3131158807",
  gender: GenderEnum.FEMALE,
  error: {},
};
export default function SignUp() {
  const [user, setUser] = useState<initialSignUpState>(userInitialState);
  const [loading, setLoading] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<CountryCodeDataType>(
    selectedCountryInitialState
  );
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const [date, setDate] = useState<Date | null>(null);
  const [dateShow, setDateShow] = useState(false);
  const [maximumDate, setMaximumDate] = useState<Date | null>(null);
  const [minimumDate, setMinimumDate] = useState<Date | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const { colorScheme } = useColorScheme();
  const router = useRouter();
  async function signUpWithEmail() {
    setUser((prev) => ({ ...prev, error: {} }));
    if (user.firstname.length < 2) {
      setUser((prev) => ({
        ...prev,
        error: { firstname: "First Name is required" },
      }));
      return;
    }
    if (user.lastname.length < 2) {
      setUser((prev) => ({
        ...prev,
        error: { lastname: "Last Name is required" },
      }));
      return;
    }

    if (user.password.length < 6) {
      setUser((prev) => ({
        ...prev,
        error: { password: "Password must be at least 6 characters long" },
      }));
      return;
    }
    if (user.password !== user.confirmPassword) {
      setUser((prev) => ({
        ...prev,
        error: { confirmPassword: "Password does not match" },
      }));
      return;
    }
    if (date === null) {
      setUser((prev) => ({
        ...prev,
        error: { dateOfBirth: "Date of Birth is required" },
      }));
      return;
    }
    if (!user.gender) {
      setUser((prev) => ({ ...prev, error: { gender: "Gender is required" } }));
      return;
    }
    if (!checkIsValidEmail(user.email)) {
      setUser((prev) => ({ ...prev, error: { email: "Email is not valid" } }));
      return;
    }
    if (!selectedCountry) {
      setUser((prev) => ({
        ...prev,
        error: { phoneNumber: "Please select country code" },
      }));
      return;
    }
    const isValidPhoneNumber = checkIsValidPhoneNumber(
      selectedCountry.countryCode + user.phoneNumber
    );
    if (!isValidPhoneNumber) {
      setUser((prev) => ({
        ...prev,
        error: { phoneNumber: "Phone Number is not valid" },
      }));
      return;
    } else {
      setUser((prev) => ({
        ...prev,
        phoneNumber: isValidPhoneNumber.split("-")[1],
      }));
    }
    setLoading(true);
    try {
      const res = await axios.post(apiRoutes.signup, {
        email: user.email,
        password: user.password,
        firstname: user.firstname,
        lastname: user.lastname,
        gender: user.gender,
        dateOfBirth: date,
        phoneNumber: isValidPhoneNumber,
        authProvider: AuthProviderEnum.LOCAL,
      });
      if (res.status === 201 || res.status === 200) {
        setUser(userInitialState);
        setDate(null);
        setSelectedCountry(selectedCountryInitialState);
        router.canGoBack() && router.back();
      }
    } catch (error) {
      console.log("error while signup", error);
      if (axios.isAxiosError(error)) {
        console.log("axios error true");
        if (error.response?.status === 409){
          ErrorHandler.handle(error, {
            alertTitle: "Error",
            customMessage: "Email or Phone number is already in use",
          });
        }else {
          ErrorHandler.handle(error);
        }
      } else
       ErrorHandler.handle(error);
    } finally {
      setLoading(false);
    }
  }

  const onDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setDateShow(false);
  };
  const showDatePicker = () => {
    setDateShow(true);
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
      <CountryCodeFlagModal
        visible={countryModalVisible}
        setVisible={setCountryModalVisible}
        setCountry={setSelectedCountry}
      />
      {dateShow && (
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
      <View className="w-full px-4 gap-y-5 mx-auto mt-4 ">
        <Text
          className="text-primary dark:text-primaryDark 
         text-3xl font-semibold text-center -mb-2"
        >
          Create new Account
        </Text>
        <View>
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
          {user.error.firstname && (
            <Text className="text-destructive dark:text-destructiveDark text-center font-normal">
              {user.error.firstname}{" "}
            </Text>
          )}
        </View>
        <View>
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
          {user.error.lastname && (
            <Text className="text-destructive dark:text-destructiveDark text-center font-normal">
              {user.error.lastname}{" "}
            </Text>
          )}
        </View>
        <View>
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            E-mail
          </Text>
          <TextInput
            onChangeText={(t) =>
              setUser((prev) => ({ ...prev, email: t.trim() }))
            }
            value={user.email}
            placeholder="jonDoe@address.com"
            autoCapitalize={"none"}
            keyboardType="email-address"
            className="w-full p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
          />
          {user.error.email && (
            <Text className="text-destructive dark:text-destructiveDark text-center font-normal">
              {user.error.email}{" "}
            </Text>
          )}
        </View>
        <View>
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            Phone Number
          </Text>
          <View className="flex-row items-center justify-between">
            <Pressable
              className="flex-row items-center justify-evenly w-28  h-[42px] mr-3.5 bg-mutedForeground dark:bg-mutedForegroundDark rounded-inputRadius"
              onPress={() => setCountryModalVisible(true)}
            >
              <Image
                source={{ uri: selectedCountry?.flagUrl }}
                style={{ width: 30, height: 20 }}
                resizeMethod="resize"
                resizeMode="contain"
              />
              <View className=" flex-row items-center">
                <Text className="text-input dark:text-inputDark ">
                  +
                  {selectedCountry?.countryCode.length >= 8
                    ? selectedCountry?.countryCode.slice(0, 7)
                    : selectedCountry?.countryCode}
                </Text>
                <Ionicons
                  name="caret-down"
                  size={20}
                  style={{ paddingTop: 3 }}
                  color={
                    colorScheme === "dark"
                      ? Colors.dark.input
                      : Colors.light.input
                  }
                />
              </View>
            </Pressable>
            <TextInput
              onChangeText={(t) =>
                setUser((prev) => ({ ...prev, phoneNumber: t }))
              }
              value={user.phoneNumber}
              placeholder="3331234567"
              autoCapitalize={"none"}
              keyboardType="number-pad"
              className=" flex-1 p-2 text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-inputRadius"
            />
          </View>
          {user.error.phoneNumber && (
            <Text className="text-destructive dark:text-destructiveDark text-center font-normal">
              {user.error.phoneNumber}{" "}
            </Text>
          )}
        </View>

        <View>
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            Password
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
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color={
                colorScheme === "dark" ? Colors.dark.input : Colors.light.input
              }
              onPress={() => setShowPassword((prev) => !prev)}
              style={{
                width: 48,
                height: "100%",
                textAlign: "center",
                textAlignVertical: "center",
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                backgroundColor: colorScheme === "dark" ? "#fafafa" : "#171717",
              }}
            />
          </View>
          {user.error.password && (
            <Text className="text-destructive dark:text-destructiveDark text-center font-normal">
              {user.error.password}{" "}
            </Text>
          )}
        </View>
        <View>
          <Text className="pl-2 pb-0.5 text-primary dark:text-primaryDark">
            Confirm Password{" "}
          </Text>

          <View className=" w-full  flex-row items-center ">
            <TextInput
              onChangeText={(t) =>
                setUser({ ...user, confirmPassword: t.trim() })
              }
              value={user.confirmPassword}
              secureTextEntry={showPassword}
              placeholder="Confirm Password"
              autoCapitalize={"none"}
              keyboardType="default"
              className="flex-1 p-2  text-input dark:text-inputDark bg-secondaryForeground dark:bg-secondaryForegroundDark placeholder:text-muted dark:placeholder:text-mutedDark rounded-l-inputRadius "
            />

            <MaterialCommunityIcons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color={
                colorScheme === "dark" ? Colors.dark.input : Colors.light.input
              }
              onPress={() => setShowPassword((prev) => !prev)}
              style={{
                width: 48,
                height: "100%",
                textAlign: "center",
                textAlignVertical: "center",
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                backgroundColor: colorScheme === "dark" ? "#fafafa" : "#171717",
              }}
            />
          </View>
          {user.error.confirmPassword && (
            <Text className="text-destructive dark:text-destructiveDark text-center font-normal">
              {user.error.confirmPassword}{" "}
            </Text>
          )}
        </View>

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
        {user.error.dateOfBirth && (
          <Text className="text-destructive dark:text-destructiveDark text-center font-normal">
            {user.error.dateOfBirth}{" "}
          </Text>
        )}
        <View className="flex-row items-center ">
          <Pressable
            className="flex-1 flex-row  items-center justify-center gap-x-2 border  pb-5"
            onPress={() =>
              setUser((prev) => ({ ...prev, gender: GenderEnum.MALE }))
            }
          >
            <Checkbox value={user.gender === GenderEnum.MALE} />
            <Text className="text-primary dark:text-primaryDark">Male</Text>
          </Pressable>
          <Pressable
            className="flex-row flex-1   items-center justify-center gap-x-2 pb-5"
            onPress={() =>
              setUser((prev) => ({ ...prev, gender: GenderEnum.FEMALE }))
            }
          >
            <Checkbox value={user.gender === GenderEnum.FEMALE} />
            <Text className="text-primary dark:text-primaryDark">Female</Text>
          </Pressable>
        </View>
        <Pressable
          disabled={loading}
          onPress={() => signUpWithEmail()}
          className=" items-center justify-center py-2 bg-secondaryForeground dark:bg-secondaryForegroundDark rounded-inputRadius"
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

type CountryCodeFlagModalProps = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setCountry: React.Dispatch<React.SetStateAction<CountryCodeDataType>>;
};
type CountryCodeDataType = {
  id: number;
  countryName: string;
  countryCode: string;
  isoCode: string;
  flagUrl: string;
};
const CountryCodeFlagModal: FC<CountryCodeFlagModalProps> = ({
  setCountry,
  setVisible,
  visible,
}) => {
  const [data, setData] = useState<CountryCodeDataType[]>([]);
  const { colorScheme } = useColorScheme();
  const { height } = useWindowDimensions();
  useEffect(() => {
    async function fetchCountryCode() {
      const res = await axios.get(apiRoutes.getAllCountryFlagsCode);
      setData(res.data);
    }

    if (visible === true) {
      fetchCountryCode();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      animationType="slide"
      bgOpacity={1}
      showStatusBar={true}
    >
      <View className="w-full h-16 items-start justify-center bg-muted dark:bg-mutedDark">
        <Ionicons
          name="arrow-back"
          size={24}
          style={{ paddingLeft: 20 }}
          onPress={() => setVisible(false)}
          color={
            colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary
          }
        />
      </View>
      <View style={{ width: "100%", height: height - 64 }}>
        <FlashList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={254}
          renderItem={({ item }) => (
            <CountryCodeFlagModalRenderItem
              item={item}
              setCountry={setCountry}
              setVisible={setVisible}
            />
          )}
        />
      </View>
    </Modal>
  );
};

type CountryCodeFlagModalRenderItemProps = {
  item: CountryCodeDataType;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setCountry: React.Dispatch<React.SetStateAction<CountryCodeDataType>>;
};
const CountryCodeFlagModalRenderItem: FC<
  CountryCodeFlagModalRenderItemProps
> = ({ item, setCountry, setVisible }) => {
  const onCountrySelectHandler = () => {
    setCountry(item);
    setVisible(false);
  };
  return (
    <Pressable
      onPress={onCountrySelectHandler}
      className=" w-full flex-row items-center  pl-5 pr-2  py-1 border border-border dark:border-borderDark "
    >
      <Image
        className="w-[68px] h-12 "
        source={{ uri: item.flagUrl }}
        resizeMethod="resize"
        resizeMode="stretch"
      />
      <Text className="text-primary dark:text-primaryDark px-5">
        +{item.countryCode}
      </Text>
      <Text className="text-primary dark:text-primaryDark opacity-80">
        {item.countryName}
      </Text>
    </Pressable>
  );
};
