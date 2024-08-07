import { View, Text, ScrollView, TouchableOpacity, Modal, Button, StyleSheet,  } from 'react-native'
import React, { useState } from 'react'
import { Link, router, Stack, useNavigation } from 'expo-router'
import { useAppSelector } from '@/src/hooks/redux';
import { HomePageItem, HomePagePostMediaItem, HomePagePostTextItem, HomePagePostUserItem } from '../(tabs)';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Colors';
import Divider from '@/src/components/elements/Divider';
import { Image } from 'react-native';
import { TextInput } from 'react-native';
const PostDetail = () =>{
    const data = useAppSelector(state=>state.postDetail.value.postDetailsScreen)

    return (
    <View className='flex-1 bg-background dark:bg-backgroundDark '>

    <ScrollView className='flex-1 pt-2'>
        <HomePagePostUserItem item={data.postBy} date={data.date} />
        <HomePagePostTextItem item={data.postText} />
        <HomePagePostMediaItem item={{media:data.postMedia, postId:data.id}} />
        <HomePagePostUsersInteractionsDetail item={{likes: data.likesBy, comments: data.commentsBy }} />

    </ScrollView>
    <Divider styles='w-full h-[4px]' />
<AddNewComment/>
    </View>
  )
}

export default PostDetail



const HomePagePostUsersInteractionsDetail = (
    {
        item,
      }: {
        item: {
          likes: {
            userId: number;
            date: string;
            likeType: string;
            profileImage: string;
            username: string;
          }[];
          comments: {
            userId: number;
            date: string;
            comment: string;
            profileImage: string;
            username: string;
          }[];
        };
      }
)=>{
    const {colorScheme} =useColorScheme()
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmark, setIsBookmark] = useState(false);

    return (
      <View className="w-full ">
        {/* likes and comment count */}
        <View className="flex-row items-center px-[2%] h-10">
          <View className="flex-1 flex-row items-center"
          >
  
            <View className="flex-row items-center">
              {item.likes.slice(0, 3).map((like, ) => (
                <Text key={Math.random()}>{like.likeType}</Text>
              ))}
            </View>
            <Text className="text-primary dark:text-primaryDark">
              {item.likes.length > 0 ?(item.likes.length>1?item.likes[0].username +" and "+ (item.likes.length-1)+ " others ":item.likes[0].username):"0 likes"}
            </Text>
          </View>
          
            <Text className="text-primary dark:text-primaryDark">{item.comments.length+" comments"}</Text>
        </View>

    <Divider styles='' />
        {/* likes... buttons */}
        <View className="flex-row items-center justify-around w-full -mb-2 h-16">
            <View className="items-center">
             <Ionicons
             name={isLiked?"thumbs-up":"thumbs-up-outline"}
             size={30}
             onPress={()=>setIsLiked(!isLiked)}
              color={colorScheme=='dark'?(isLiked?"#0000ff":Colors.dark.primary):(isLiked?"#0000ff":Colors.light.primary)}
             />
             <Text className="text-gray-500 dark:text-gray-400 ">Like</Text>
  
              </View>
              <View  className="items-center">
             <Ionicons
             name={"chatbox-outline"}
             size={30}
              color={colorScheme=='dark'?Colors.dark.primary:Colors.light.primary}
  />
             <Text className="text-gray-500 dark:text-gray-400 ">Comment</Text>
              </View>
              <View  className="items-center">
             <Ionicons
             name={isBookmark?"bookmark":"bookmark-outline"}
             size={30}
             onPress={()=>setIsBookmark(!isBookmark)}
             color={colorScheme=='dark'?Colors.dark.primary:Colors.light.primary}
             />
             <Text className="text-gray-500 dark:text-gray-400 ">Save</Text>
              </View>
              <View  className="items-center">
             <Ionicons
             name={"share-social-outline"}
             size={30}
             color={colorScheme=='dark'?Colors.dark.primary:Colors.light.primary}
             />
             <Text className="text-gray-500 dark:text-gray-400 ">Share</Text>
              </View>
        </View>
      
        {/* Reactions */}
      <View className='w-full px-4 mt-5 '>
        <Text className='text-primary dark:text-primaryDark text-lg font-semibold mb-2'>Reactions</Text>
        <View className='flex-row items-center gap-x-5 '>
            {item.likes.slice(0,5).map((like,_)=>{
                return(
                    <Link href={''} asChild>
                    <View key={_}>
                        <View className='relative '>
                            <Image source={{uri:like.profileImage}} alt='profile Image'
                            className='w-10 h-10 rounded-full overflow-hidden bg-cover object-center'
                            />
                            <View className='absolute -bottom-1.5 -right-1 '>
                            <Text className='text-base'>{like.likeType}</Text>
                            </View>
                        </View>
                        </View>
                    </ Link>
                )
                
            }
            
            
        )}{
            item.likes.length>5?
            <Ionicons style={{borderWidth:2,borderColor:'gray',borderRadius:9999,alignItems:"center",justifyContent:'center', width:44, height:44}} size={20} name='ellipsis-horizontal' color={colorScheme==='dark'?Colors.dark.border:Colors.light.border} />
            :null
        }
        </View>
      </View>
        {/* Comments */}
        <View className='w-full px-4 mt-5'>
          <View  className='w-full flex-row items-center justify-between pr-2 mb-2'>
        <Text className='text-primary dark:text-primaryDark text-lg font-semibold'>Comments</Text>
        <View className='flex-row items-center relative'>

        <Text className='text-primary dark:text-primaryDark '>Most relevant&nbsp;&nbsp;</Text>
        <Link href={'/sortData'}  className='text-red-600'>
        hello
        {/* <Ionicons name='chevron-back' style={{ transform: [{rotate: '270deg'}],marginBottom:-5}} size={25}  color={colorScheme=='dark'?Colors.dark.primary:Colors.light.primary}/> */}
        </Link>
        </View>
          </View>
        <View>
            {item.comments.map((comment,_)=>{
                return(
                    <View key={_} className='flex-row items-start '>
                        <View className='w-14 h-14 rounded-full overflow-hidden mr-2 mt-1'>
                            <Image source={{uri:comment.profileImage}} alt='profile Image'
                            className='w-full h-full bg-cover object-center'
                            />
                        </View>
                        <View className='relative flex-1 mb-4'>

                        <View className=' bg-card dark:bg-cardDark rounded rounded-tl-none border border-border p-4 my-2'>
                            <Text className='text-primary dark:text-primaryDark font-semibold mb-1  '>{comment.username}</Text>
                            <Text className='text-primary dark:text-primaryDark text-[13px]'>{comment.comment}</Text>
                            
                          </View>
                          <View className='absolute top-4 right-2 '>
                            <Ionicons name='ellipsis-vertical' size={25} color={'gray'}/>
                          </View>
                        <View className='flex-row items-center ml-2 '>
                          <TouchableOpacity className='pr-2'><Text className='text-primary dark:text-primaryDark'>Like</Text></TouchableOpacity>
                          <Text className='text-gray-400 dark:text-gray-500'>|</Text>
                          <TouchableOpacity className='pl-2'><Text className='text-primary dark:text-primaryDark'>Reply</Text></TouchableOpacity>

                          </View>


                        </View>
                    </View>
                )
            })}
        </View>
        </View>

      </View>
    );
  };



  const userProfileImage = 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
const AddNewComment=()=>{
 const [value, setValue] = useState('')
 const {colorScheme} =useColorScheme()
 return(
<View className='bg-muted dark:bg-mutedDark
w-full  flex-row items-center px-4 pt-2.5 pb-5'>
<Image source={{uri:userProfileImage}}
className='mr-2 w-10 h-10 rounded-full bg-center object-cover'
/>
<TextInput
value={value} 
onChangeText={(t)=>setValue(t)}
placeholderTextColor={'gray'}
multiline
cursorColor={colorScheme==='dark'?Colors.dark.primary:Colors.light.primary}

placeholder='Leave your thoughts here...'
className='flex-grow bg-transparent text-primary dark:text-primaryDark '
/>
<Ionicons  name='at' size={28}
 color={colorScheme==='dark'?Colors.dark.primary:Colors.light.primary}
 style={{marginLeft:20, marginRight:10}}
 />
<TouchableOpacity className='px-2.5  '>
  <Text className='text-gray-500 dark:text-gray-400 text-base'>Post</Text>
</TouchableOpacity>
</View>
  )
}
  


