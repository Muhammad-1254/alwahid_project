import { View, Text, Animated, useWindowDimensions, ActivityIndicator } from 'react-native'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { PostDataType } from './_layout';
import cAxios from '@/src/lib/cAxios';
import { apiRoutes } from '@/src/constants/apiRoutes';
import ErrorHandler from '@/src/lib/ErrorHandler';
import { PaginationType } from '@/src/types/post';
import _ from 'lodash';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/src/constants/Colors';
import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import ContentLoader, { Rect } from "react-content-loader/native";
import { useAppDispatch } from '@/src/hooks/redux';
import { setListScrollY } from '@/src/store/slices/profile';

const pageInitialState: PaginationType = {
  skip: 0,
  take: 10,
};
const postControlInitial = {
    page: pageInitialState,
    isComplete: false,
 
};
export default function Posts() {
  const [savedPosts, setSavedPosts] = useState<PostDataType[]>([]);
  const [loading, setLoading] = useState(false)
 


const [postControl, setPostControl] = useState(postControlInitial)
const {colorScheme} =useColorScheme()

  const getPersonalPostLikedData = async () => {
    try {
      setLoading(true);
      const res = await cAxios.get(
        `${apiRoutes.getUserProfileTabLikedPosts}?skip=${postControl.page.skip}&take=${postControl.page.take}`
      );
      if (res.data.length === 0) {
        setPostControl((prev)=>({...prev,post:{...prev,isComplete:true}}))
      } else {
        setSavedPosts((prev) => [...prev, ...res.data]);
        setPostControl((prev)=>({...prev,post:{...prev,page:{...prev.page,skip:prev.page.skip+prev.page.take}}}))
      }
      setLoading(false);
    } catch (error) {
      console.log("error from fetching user profile tab liked posts", error);
      ErrorHandler.handle(error);
    } finally {
      setLoading(false);
    }
  };
  const canFetchMore = async () => {
    console.log("post control: ",postControl.isComplete)
      if (postControl.isComplete) return;
      await getPersonalPostLikedData()
  
  }

  const onEndReachedHandler = _.debounce(async () => {
    console.log("onEndReachedHandler called");
    if(loading) return
    await canFetchMore();
  },500)
  return (
   <>
   <View className='w-full h-2 bg-background dark:bg-backgroundDark'/>

    <Animated.FlatList
        data={savedPosts}
        // onScroll={Animated.event(
        //   [{ nativeEvent: { contentOffset: { y: scrollY.current } } }],
        //   { useNativeDriver: true }
        // )}
        onEndReached={onEndReachedHandler}
        onEndReachedThreshold={0.1}
        keyExtractor={(item) => item.id}
        style={{
          backgroundColor:
            colorScheme === "dark"
              ? Colors.dark.background
              : Colors.light.background,
        }}
        numColumns={3}
        // refreshControl={
        //   <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        // }
        renderItem={({ item }) => (
          <FlatListRenderItem
            item={item}
            
          />
        )}
        ListEmptyComponent={<TabDataSkeleton />}
        ListFooterComponent={() => <ListFooterComponent loading={loading} />}
      />
   </>
  )
}


type FlatListRenderItemProps = {
  item: PostDataType;
};
const FlatListRenderItem: FC<FlatListRenderItemProps> = ({ item}) => {
  const router = useRouter();
  const { width } = useWindowDimensions();

    return (
      <TouchableOpacity
        style={{ width: width / 3 }}
        className="aspect-[1/2] border border-border dark:border-borderDark rounded-md "
        key={item.id}
        onPress={() => router.push(`/(usefull)/postDetails/${item.id}`)}
      >
        <Image
          source={{
            uri: item.postMedias[0]?.url,
          }}
          className="w-full h-full object-cover bg-center"
        />
      </TouchableOpacity>
    );

  
};






type ListFooterComponentProps = {
  loading: boolean;
};
const ListFooterComponent: FC<ListFooterComponentProps> = ({ loading }) => {
  const { colorScheme } = useColorScheme();
  if (loading) {
    return (
      <View className=" items-center justify-center h-20 ">
        <ActivityIndicator
          size={"large"}
          color={
            colorScheme === "dark"
              ? Colors.dark.mutedForeground
              : Colors.light.mutedForeground
          }
        />
      </View>
    );
  }
  return null;
};



const TabDataSkeleton = () => {
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();

  const Content = ({ height, width }: { width: number; height: number }) => (
    <ContentLoader
      style={{ width, height }}
      viewBox={`0 0 ${width} ${height}`}
      animate={true}
      backgroundColor={
        colorScheme === "dark" ? Colors.dark.muted : Colors.light.border
      }
      foregroundColor={
        colorScheme === "dark"
          ? Colors.dark.primaryForeground
          : Colors.light.muted
      }
    >
      <Rect x="0" y="0" rx="4" ry="4" width={width} height={height} />
    </ContentLoader>
  );
  return (
    <View className="flex-row flex-wrap items-center justify-between">
      {Array.from({ length: 4 }, () => Math.random()).map((_) => {
          return <Content key={_} height={(width / 3) * 2} width={width / 3} />;
      })}
    </View>
  );
};
