import { createSlice, PayloadAction } from "@reduxjs/toolkit";





export type LocationProps  ={
    id:string;
    country:string;
    province:string;
    city:string;
    zipCode:string;
    street:string;
}

export type UserBasicInfoProps = {
    userId: string;
    email: string;
    firstname: string;
    lastname: string;
    avatarUrl: string|null
    phoneNumber: string
    gender: string ;
    dateOfBirth: string;
    authProvider: string 
    isVerified: boolean 
    isSpecialUser: boolean 
    followersCount: string;
    followingCount: string;
    location: LocationProps;
}

type NormalUserINformationProps = {

}

type AdminUserInformationProps={
   
}
type CreatorUserInformationProps={
    authorizedAt: string;
    worksOn:string
    qualification:string
    workLocation:LocationProps
    authorizedAdminId:string
}

type UserInformationProps = {
    userBasicInfo:UserBasicInfoProps
    userSpecificInfo:NormalUserINformationProps|AdminUserInformationProps|CreatorUserInformationProps
}

const initialState:UserInformationProps = {
    userBasicInfo: {
        userId: "",
        email: "",
        firstname: "",
        lastname: "",
        avatarUrl: null,
        phoneNumber: "",
        authProvider:'local',
        dateOfBirth:'2000-01-01',
        followersCount: "0",
        followingCount: "0",
        gender:"",
        isVerified: false,
        isSpecialUser: false,
        location: {
            id: "",
            country: "",
            province: "",
            city: "",
            zipCode: "",
            street: "",
        }     
    },
    userSpecificInfo: {}
}




const userInformationSlice = createSlice({
        name:'userInformation',
        initialState,
        reducers:{
            setUserBasicInfo:(state,action:PayloadAction<Partial<UserBasicInfoProps>>)=>{
                state.userBasicInfo = {...state.userBasicInfo,...action.payload}
            },
            setUserSpecificInfo:(state,action:PayloadAction<NormalUserINformationProps|AdminUserInformationProps|CreatorUserInformationProps>)=>{
                state.userSpecificInfo = action.payload
            }
        }
})

export const {setUserBasicInfo,setUserSpecificInfo} = userInformationSlice.actions
export default userInformationSlice.reducer






