import { View, Text } from 'react-native'
import React from 'react'
import { cn } from '@/src/lib/utils'

export default function Divider({styles}:{styles:string|undefined}) {
  return (
  <View className={cn("bg-border dark:bg-borderDark w-[75%] mx-auto h-[1px] ",styles)}/>
  )
}