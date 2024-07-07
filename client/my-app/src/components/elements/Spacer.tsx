import { View, Text } from 'react-native'
import React from 'react'
import { cn } from '@/src/lib/utils'

export default function Spacer({styles}:{styles?:string}) {
  return (
    <View className={cn("w-full h-4 bg-transparent",styles)}/>
  )
}