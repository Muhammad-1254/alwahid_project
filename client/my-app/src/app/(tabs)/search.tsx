import { View, Text, Button } from "react-native";
import React, { useCallback, useMemo, useRef } from "react";
import BottomSheet, { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";

export default function Search() {
  const snapPoints = useMemo(() => ["25%", "50%","75%","100%"], []);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handleClosePress = () => bottomSheetModalRef.current?.close();
  const handleOpenPress = () => bottomSheetModalRef.current?.expand();
const backdropRender = useCallback(
  (props:any)=><BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props}/>
,[])
  return (
    <View
      className="bg-background dark:bg-backgroundDark
    flex-1   items-center justify-evenly"
    >
      <View>
        <Button title="open" onPress={handleOpenPress} />
        <Button title="close" onPress={handleClosePress} />
      </View>
    
    </View>
  );
}
