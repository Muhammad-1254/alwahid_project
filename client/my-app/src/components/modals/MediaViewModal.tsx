import { ResizeMode, Video } from "expo-av";
import { FC, useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import Modal from "../elements/modal";
import { View } from "react-native";
import { Image } from "react-native";

export interface MediaViewModalProps extends MediaViewModalDataType {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  }
  
 export type MediaViewModalDataType = {
    url?: string;
    mimeType?: string;
    videoUrl?: string | null;
    ar?: string;
  };
  const MediaViewModal: FC<MediaViewModalProps> = ({
    setVisible,
    visible,
    mimeType,
    url,
    videoUrl,
    ar,
  }) => {
    const ref = useRef<Video>(null);
    const { width, height } = Dimensions.get("window");
    const [contentDimensions, setContentDimensions] = useState({ width, height });
  
    useEffect(() => {
      if (ar) {
        const [w, h] = ar.split("/").map(Number);
        const height_ = (width / w) * h;
        if (height_ >= height - 100) {
          setContentDimensions({
            width: (width / 100) * 92,
            height: (height / 100) * 92,
          });
        } else {
          setContentDimensions({ width, height: height_ });
        }
      }
    }, [ar]);
    return (
      <Modal
        visible={visible}
        setVisible={setVisible}
        transparent={true}
        animationType="fade"
        showStatusBar={true}
        withInput={false}
        bgOpacity={0.8}
      >
        <View
          style={{
            width: contentDimensions.width,
            height: contentDimensions.height,
          }}
        >
          {mimeType?.includes("image") && (
            <Image
              className="w-full h-full"
              source={{ uri: url }}
              resizeMethod="resize"
              resizeMode="contain"
              alt="image"
            />
          )}
          {mimeType?.includes("video") && videoUrl && (
            <Video
              ref={ref}
              source={{ uri: videoUrl }}
              className="w-full h-full"
              resizeMode={ResizeMode.COVER}
              useNativeControls
              isLooping
            />
          )}
        </View>
      </Modal>
    );
  };

  export default MediaViewModal;