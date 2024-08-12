import { View, Text, ScrollView, Pressable, Platform, Modal, Button } from "react-native";
import React, { FC, useEffect, useRef, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Colors } from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux";
import { Image } from "react-native";
import { getImageAspectRatio } from "@/src/lib/utils";
import * as ImagePicker from "expo-image-picker";
import cAxios from "@/src/lib/cAxios";
import { apiRoutes } from "@/src/constants/apiRoutes";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import ErrorHandler from "@/src/lib/ErrorHandler";
import { Buffer } from "buffer";
import { setUser, UserDataAuthProps } from "@/src/store/slices/auth";
import LoadingIndicatorModal from "@/src/components/modals/LoadingIndicatorModal";
import { TextInput } from "react-native";
import Toast from "react-native-root-toast";
import DatePicker from "@react-native-community/datetimepicker";

export default function ProfileData() {
 

  const { colorScheme } = useColorScheme();
  const router = useRouter();

  
  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.muted : Colors.light.muted,
          },
          headerTitle: "Edit Profile",
          headerTitleStyle: {
            color:
              colorScheme === "dark"
                ? Colors.dark.primary
                : Colors.light.primary,
          },
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              style={{ paddingLeft: 20 }}
              onPress={() => {
                router.back();
              }}
              size={24}
              color={
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.primary
              }
            />
          ),
        }}
      />

      <ScrollView className="flex-1 bg-background dark:bg-backgroundDark ">
        <EditBasicInfo  />
      </ScrollView>
    
    </>
  );
}

const EditBasicInfo = () => {
  const [loading, setLoading] = useState(false);
  
  const [ar, setAr] = useState("1/1");
  
  const [userData, setUserData] = useState<UserDataAuthProps | null>(null);
  
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [maximumDate, setMaximumDate] = useState<Date | null>(null);
  const [minimumDate, setMinimumDate] = useState<Date | null>(null);
  

  const user = useAppSelector((s) => s.auth);
  const { colorScheme } = useColorScheme();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user.data.user) {
      setUserData(user.data.user);
    }
    async function getImageAr(url: string) {
      const data = await getImageAspectRatio(url);
      if (data && typeof data === "string") setAr(data);
    }
    if (user.data.user.avatarUrl) getImageAr(user.data.user.avatarUrl);
  }, [user]);

  useEffect(()=>{
    if(userData &&JSON.stringify(userData)===JSON.stringify(user.data.user)){
    setIsDataChanged(false)
    }else{
      setIsDataChanged(true)
    }
  },[userData])

  const confirmChangesHandler = async () => {
    // first take out those fields which are changed 
    const changedFields = Object.entries(userData!).filter(
      // @ts-expect-error 
      (item) => user.data.user[item[0]] !== item[1]
    );
    
    if (changedFields.length === 0) return;
    const body = changedFields.reduce((acc, [key, value]) => {
      // @ts-expect-error 
      acc[key] = value;
      return acc;
    }, {});
    console.log("body", body);
    try {
      setLoading(true)
      const res = await cAxios.patch(apiRoutes.updateUserProfileBasicInfo, body)
      if(res.status===200){
        dispatch(setUser(body))
      }
    } catch (error) {
      console.log("error while updating user data", error);
      ErrorHandler.handle(error);

    }finally{
      setLoading(false)
    }

  }
  
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

  const onDateChange = (event: any, selectedDate: any) => {
    if(selectedDate===undefined) return;
    const dob = selectedDate.toISOString().split("T")[0];
    setUserData(prev=>prev===null?null:({
      ...prev,
      dateOfBirth:dob
    }))
    setDateModalVisible(false);
  };


  const editImageBtnHandler = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (result.canceled) return;
    try {
      setLoading(true);
      const pRes = await cAxios.post(apiRoutes.getProfileAvatarPresignedUrl, {
        filename: result.assets[0].fileName,
        fileSize: result.assets[0].fileSize,
        mimeType: result.assets[0].type,
      });
      const { url, urlKey } = pRes.data;

      // converting blob uri data to base64
      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // converting base64  data to a buffer
      const buffer = Buffer.from(base64, "base64");

      const s3Res = await axios.put(url, buffer, {
        headers: {
          "Content-Type": result.assets[0].mimeType,
        },
      });

      const updateRes = await cAxios.patch(apiRoutes.updateUserProfileAvatar, {
        key: urlKey,
      });
      dispatch(setUser({ avatarUrl: updateRes.data.url }));
    } catch (error) {
      console.log("error while updating profile image", error);
      ErrorHandler.handle(error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      <LoadingIndicatorModal uploadLoading={loading} />

      <View className="px-2 mt-4">
        <View></View>
        <Text className="text-primary dark:text-primaryDark text-base">
          Basic Information:
        </Text>
        <View className="w-full flex-row items-start justify-between mt-2.5 ">
          <Text className="text-primary dark:text-primaryDark  mt-4 opacity-75">
            Profile Image:
          </Text>
          {user.data.user.avatarUrl === null ? (
            <Pressable
              className="w-1/2 aspect-square items-center justify-center rounded-2xl border border-muted dark:border-mutedDark"
              onPress={editImageBtnHandler}
            >
              <Ionicons
                name="add"
                color={
                  colorScheme === "dark"
                    ? Colors.dark.primary
                    : Colors.light.primary
                }
                size={42}
                style={{}}
              />
            </Pressable>
          ) : (
            <View
              className="relative flex-1 ml-5 rounded-2xl overflow-hidden"
              style={{ aspectRatio: ar }}
            >
              <Image
                source={{
                  uri: user.data.user.avatarUrl,
                }}
                className="w-full h-full"
                resizeMethod="resize"
                resizeMode="cover"
              />
              <Ionicons
                name="pencil"
                onPress={editImageBtnHandler}
                color={
                  colorScheme === "dark"
                    ? Colors.dark.primary
                    : Colors.light.primary
                }
                size={20}
                style={{
                  position: "absolute",
                  right: 10,
                  top: 10,
                  borderColor:
                    colorScheme === "dark"
                      ? Colors.dark.muted
                      : Colors.light.muted,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                  opacity: 0.8,
                }}
              />
            </View>
          )}
        </View>

        <View>
          {
            // make array of user object
            userData &&
              Object.entries(userData).map((item) => (
                <BasicInfoEditItem
                  key={item[0]}
                  item={item}
                  setUserData={setUserData}
                  userData={userData}
                  setDateModalVisible={setDateModalVisible}
                />
              ))
          }
        </View>
      </View>
        {dateModalVisible&& (
        <DatePicker
          testID="dateTimePicker"
          value={userData?.dateOfBirth?new Date(userData.dateOfBirth):new Date()}
          mode="date"
          maximumDate={maximumDate ?? new Date()}
          minimumDate={minimumDate ?? new Date()}
          display="default"
          themeVariant={colorScheme === "dark" ? "dark" : "light"}
          onChange={onDateChange}
        />
      )}
      {
        isDataChanged && (
          <View className="w-full h-12 mt-4 flex-row items-center justify-evenly">
            <Pressable className="w-[40%] h-full items-center justify-center bg-destructive dark:bg-destructiveDark rounded-2xl"
            onPress={()=>setUserData(user.data.user)}
            >
            <Text className="text-primary dark:text-primaryDark text-base">Cancel</Text>
          </Pressable>

          <Pressable className="w-[40%] h-full items-center justify-center bg-foreground dark:bg-foregroundDark rounded-2xl"
          onPress={confirmChangesHandler}
          >
            <Text className="text-primaryForeground dark:text-primaryForegroundDark text-base">Save changes</Text>
          </Pressable>
          </View>
        )
      }
    </>

  );
};

type BasicInfoEditItemProps = {
  item: [string, string | boolean];
  setUserData: React.Dispatch<React.SetStateAction<UserDataAuthProps | null>>;
  userData: UserDataAuthProps | null;
  setDateModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const userDataEditableFields = {
  firstname: true,
  lastname: true,
  phoneNumber: true,
  dateOfBirth: true,
};
const userDataIgnoreFields = {
  avatarUrl: true,
  userId: true,
};
const BasicInfoEditItem: FC<BasicInfoEditItemProps> = ({
  item,
  setUserData,
  setDateModalVisible
}) => {
  const [showInputField, setShowInputField] = useState(false);
  const [key, value] = item;
  const { colorScheme } = useColorScheme();

  const fieldPressHandler = () => {
    if (userDataEditableFields.hasOwnProperty(key)) {
      setShowInputField(true);
    } else {
      console.log(value.toString());
      Toast.show("This field is not editable", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.foreground
            : Colors.light.foreground,
        textColor:
          colorScheme === "dark"
            ? Colors.dark.primaryForeground
            : Colors.light.primaryForeground,
        animation: true,
        shadow: true,
        hideOnPress: true,
        opacity: 1,
        containerStyle: {
          borderRadius: 12,
        },
      });
    }
  };

  if (userDataIgnoreFields.hasOwnProperty(key)) return null;

  const getCorrectKeyForDisplay = ()=>{
    switch (key) {
      case "firstname":
        return "First Name";
      case "lastname":
        return "Last Name";
      case "phoneNumber":
        return "Phone Number";
      case "dateOfBirth":
        return "Date of Birth";
      case "isVerified":
        return "Verified";
      case "isSpecialUser":
        return "Special User";
      case "followersCount":
        return "Followers";
      case "followingCount":
        return "Following";
      case "authProvider":
        return "Auth Provider";
      case 'userRole':
        return "Role";
      case 'email':
        return "Email";
      case 'gender':
        return 'Gender'
      default:
        return key;
    }
  }

  return (
    <>
    <Pressable
      onPress={fieldPressHandler}
      className={`w-full  h-10 flex-row justify-between items-center px-3   border-b
        ${
          showInputField
            ? "border-borderDark dark:border-border"
            : "border-border dark:border-borderDark"
        }

        `}
    >
      <Text className="text-primary dark:text-primaryDark  opacity-80  ">{getCorrectKeyForDisplay()}</Text>
      <View className="flex-1">
        {
        typeof value === "string" ?(
        userDataEditableFields.hasOwnProperty(key) ? (
         key !=="dateOfBirth" ? (
            <TextInput
              value={value}
              textAlign="right"
              onChangeText={(text) =>
                setUserData((prev) =>
                  prev === null ? null : { ...prev, [key]: text }
                )
              }
              className="w-full h-full pl-2    text-primary dark:text-primaryDark "
              autoFocus={showInputField}
              onBlur={() => setShowInputField(false)}
            />
          ) : (
            key ==='dateOfBirth' && (
              <Pressable onPress={()=>setDateModalVisible(true)}>
                
              <Text  className={`text-primary dark:text-primaryDark text-right ${value.length===0&&"underline"}`}>
                {value.length > 0 ? value : "Select Date"}
                </Text>
              </Pressable>
            )
          )
        ) : (
          <Text className="text-primary dark:text-primaryDark text-right">{value}</Text>
        )
      
      ):
      <Text className="text-primary dark:text-primaryDark text-right">{value?"true":"false"}</Text>
      
      }
      </View>
    </Pressable>
    </>

  );
};
