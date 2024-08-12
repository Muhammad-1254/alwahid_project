import { FC } from "react";
import { DimensionValue, Pressable, TouchableWithoutFeedback, View } from "react-native";
import { KeyboardAvoidingView, Modal as RNModal } from "react-native";

type ModalProps = {
  visible: boolean;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  withInput?: boolean;
  animationType?: "slide" | "fade" | "none";
  children: React.ReactNode;
  transparent?: boolean;
  showStatusBar?: boolean;
  modalWidth?:DimensionValue;
  modalHeight?:DimensionValue;
  bgOpacity?: number;
};
const Modal: FC<ModalProps> = ({
  children,
  setVisible,
  visible,
  animationType,
  withInput,
  transparent,
  showStatusBar,
  bgOpacity,
  modalHeight,
  modalWidth,
}) => {
  const content = withInput ? (
    <KeyboardAvoidingView behavior="padding"></KeyboardAvoidingView>
  ) : (
    children
  );

  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      onRequestClose={() => setVisible && setVisible(false)}
      statusBarTranslucent={!showStatusBar}
      animationType={animationType || "slide"}
    >
      <View style={{width:modalHeight ??"100%",height:modalHeight??"100%"}} 
      className="relative items-center justify-center ">
        <Pressable
          onPress={() => setVisible && setVisible(false)}
          style={{ opacity: bgOpacity ?? 0.5 }}
          className={`absolute top-0 left-0  w-full h-full -z-10   bg-background dark:bg-backgroundDark  `}
        />

        {content}
      </View>
    </RNModal>
  );
};
export default Modal;
