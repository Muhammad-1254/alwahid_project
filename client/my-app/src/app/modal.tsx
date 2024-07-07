import { Modal, View } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
export default function Modal_() {
  // If the page was reloaded or navigated to directly, then the modal should be presented as
  // a full screen page. You may need to change the UI to account for this.
  const isPresented = router.canGoBack();
  return (
      <View>
        <Text>Modal Content</Text>
        {/* <TouchableOpacity onPress={closeModal}> */}
          <Text>Close Modal</Text>
        {/* </TouchableOpacity> */}
      </View>
  );
}
