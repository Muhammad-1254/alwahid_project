import { FC } from "react";
import { Pressable, TouchableWithoutFeedback, View } from "react-native";
import { KeyboardAvoidingView, Modal as RNModal } from "react-native";

type ModalProps = {
  visible: boolean;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  withInput?: boolean;
  animationType?: "slide" | "fade" | "none";
  children: React.ReactNode;
  transparent?: boolean;
  showStatusBar?: boolean;
};
const Modal: FC<ModalProps> = ({
  children,
  setVisible,
  visible,
  animationType,
  withInput,
  transparent,
  showStatusBar,
}) => {
  const content = withInput ? (
    <KeyboardAvoidingView
      behavior="padding"
    ></KeyboardAvoidingView>
  ) : (
    children
  );

  return (
    <RNModal
      visible={visible}
      transparent={transparent}
    
      statusBarTranslucent={showStatusBar}
      animationType={animationType || "slide"}
    >
      <View       
      className="relative w-full h-full items-center justify-center border border-gray-600">


      <Pressable
        onPress={() => setVisible && setVisible(false)}
        className="absolute top-0 left-0  w-full h-full -z-10   bg-background dark:bg-backgroundDark opacity-50 "/>

        <View className="z-10  ">{content}</View>
        </View>
    </RNModal>
  );
};
export default Modal;
