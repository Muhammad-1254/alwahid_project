import { PostLikeEnum } from "@/src/types/post";
import { FC } from "react";
import { Pressable, View } from "react-native";
import { Image } from "react-native";
import Modal from "../elements/modal";
import { getPostLikeIcon } from "@/src/lib/utils";

type ChooseLikeTypeModalProps = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  modalPosition: { x: number; y: number };
  likeHandler: (likeType: PostLikeEnum) => Promise<void>;
};

const ChooseLikeTypeModal: FC<ChooseLikeTypeModalProps> = ({
    likeHandler,
  setVisible,
  visible,
  modalPosition,
}) => {
  const likeList = [
    PostLikeEnum.HEART,
    PostLikeEnum.LIKE,
    PostLikeEnum.LAUGH,
    PostLikeEnum.SAD,
    PostLikeEnum.WOW,
  ];

  

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      transparent={true}
      animationType="none"
    >
      <View
        style={{
          position: "absolute",
          left: modalPosition.x,
          top: modalPosition.y,
        }}
        className="flex-row items-center justify-center  w-60    bg-card dark:bg-mutedDark  rounded-2xl"
      >
        {likeList.map((likeType, _) => (
          <Pressable
            key={_}
            onPress={async () =>{ 
              await likeHandler(likeType)
            setVisible(false)
            }}
            className="  px-[7px] py-[11px]"
          >
            <Image
              className="w-8 h-8 "
              resizeMethod="resize"
              resizeMode="contain"
              source={getPostLikeIcon(likeType)}
            />
          </Pressable>
        ))}
      </View>
    </Modal>
  );
};


export default ChooseLikeTypeModal;