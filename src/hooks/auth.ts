import { RootState } from "../store/store"
import { useAppSelector } from "./redux"

export const useAuth = ()=>{
    return useAppSelector((state:RootState)=>state.auth.value)
}