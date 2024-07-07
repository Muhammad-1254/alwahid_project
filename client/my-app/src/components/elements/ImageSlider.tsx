import { TPostMedia } from "@/src/store/slices/postData";
import React, { useEffect } from "react";
import { Dimensions, Image } from "react-native";
import { View } from "react-native";
import Carousel from "react-native-snap-carousel";

const images = [
    "https://res.cloudinary.com/dixda8etb/image/upload/v1718054326/dbms_project/4fec8a8c-37f0-4ad1-884d-09a71ada5d0c:img:0:_:painting.jpg",
    "https://res.cloudinary.com/dixda8etb/image/upload/v1718054333/dbms_project/de04d1b4-9fcd-4df9-bbdf-d459277398d9:img:0:_:painting.jpg",
    "https://res.cloudinary.com/dixda8etb/image/upload/v1718054378/dbms_project/13bf302d-99ac-4eb3-8560-62138101916a:img:0:_:painting.jpg",
    "https://res.cloudinary.com/dixda8etb/image/upload/v1718054417/dbms_project/7f183c83-625f-432c-a82a-6b343405dec3:img:0:_:painting.jpg",
    "https://res.cloudinary.com/dixda8etb/image/upload/v1718054423/dbms_project/ce330926-623c-45f3-81b6-0ea3487b4cfd:img:0:_:painting.jpg",
    "https://res.cloudinary.com/dixda8etb/image/upload/v1718054428/dbms_project/63c9a665-3ff2-4ba8-b32c-2d98a31ff823:img:0:_:painting.jpg",
    "https://res.cloudinary.com/dixda8etb/image/upload/v1718054434/dbms_project/4176497b-7e12-4317-be3b-d251d737315e:img:0:_:painting.jpg",
    "https://res.cloudinary.com/dixda8etb/image/upload/v1718054439/dbms_project/10d7ee2a-e039-401e-b5f5-f5d3db81922e:img:0:_:painting.jpg",
    "https://res.cloudinary.com/dixda8etb/image/upload/v1718054444/dbms_project/ef314db4-8ded-4154-b35b-c7e18802a9f8:img:0:_:painting.jpg",
    "https://res.cloudinary.com/dixda8etb/image/upload/v1718054450/dbms_project/ce4578b9-48c4-411b-8cd6-cd4b97298570:img:0:_:painting.jpg",
    "https://media.licdn.com/dms/image/C4E03AQEp2KYsH8LuBw/profile-displayphoto-shrink_800_800/0/1577661386695?e=1724889600&v=beta&t=kNfgBDKBxsVrmcIhzUiDQgqDShE8sRJsKSFy7U_rQ8Q",
    "https://images.pexels.com/photos/839011/pexels-photo-839011.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  
  
  ];
const MediaSlider = ({
    media,
  }: {
    media: TPostMedia
  }) => {
    const [windowWidth, setWindowWidth] = React.useState(0);
  useEffect(()=>{
    const {width} = Dimensions.get('window')
    setWindowWidth(width)
  },[])
  console.log("images media: ",media)
    const renderItem = ({ item }) => {
      console.log({item})
      return (
        <View > 
          <Image source={{ uri: item }} alt="post image"  />
        </View>
      );
    };
    
    return (
      <Carousel
      data={images}
      renderItem={renderItem}
      sliderWidth={windowWidth}
      itemWidth={windowWidth}
  
      
      />
    )
  };
  

  export default MediaSlider