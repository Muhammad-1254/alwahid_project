import { View, Text } from 'react-native'
import React from 'react'

export default function Notification() {
  return (
<View
      className="bg-background dark:bg-backgroundDark
    flex-1   items-center justify-evenly"
    >      
    <Text className='text-primary dark:text-primaryDark'>Notification</Text>
    </View>
  )
}