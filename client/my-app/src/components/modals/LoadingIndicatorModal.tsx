import { FC, useState } from "react";
import Modal from "../elements/modal";
import * as Progress from "react-native-progress";
import { Pressable, Text } from "react-native";

type LoadingIndicatorModalProps = {
  uploadProgress?: number;
  circleSize?: number;
  uploadLoading: boolean;
  loadingHeader?:React.ReactElement
  cancelUploadHandler?: () => void;

};
const LoadingIndicatorModal: FC<LoadingIndicatorModalProps> = ({
  cancelUploadHandler,
  uploadLoading,
  uploadProgress,
  circleSize,
  loadingHeader
}) => {
  const [btnDisable, setBtnDisable] = useState(false);
  return (
    <Modal
      visible={uploadLoading}
      transparent={true}
      animationType="none"
      showStatusBar={true}
    >
      {loadingHeader}
      {
        uploadProgress?(
          <Progress.Circle
          progress={uploadProgress / 100}
          size={circleSize??250}
          showsText={true}
          allowFontScaling={true}
        />
        ):(
          <Progress.Circle
          size={circleSize??75}
          endAngle={0.85}
          borderWidth={3}
          indeterminate={true}
          />
        )
      }
    

{cancelUploadHandler&&(
 <Pressable
 disabled={btnDisable}
 className="w-40 items-center justify-center mx-auto mt-8 rounded-xl  py-4  bg-muted dark:bg-mutedDark"
 onPress={() => {
   setBtnDisable(true);
   cancelUploadHandler();
 }}
>
 <Text className="text-primary dark:text-primaryDark text-base  ">
   {btnDisable ? "Cancelling..." : "Cancel"}
 </Text>
</Pressable>
)}
     
    </Modal>
  );
};

export default LoadingIndicatorModal;
