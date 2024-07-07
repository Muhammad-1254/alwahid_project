import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchSession, setSession, signInAnonymously } from '../store/slices/auth';
import { supabase } from '../lib/supabase';

export default function AuthProvider({children}:{children:React.ReactNode}) {
  const dispatch = useAppDispatch();
  const {user,session,isAuthenticated} = useAppSelector(state=>state.auth.value)

  useEffect(()=>{
    dispatch(fetchSession())
    .then(({payload})=>{
        if(!payload){
            dispatch(signInAnonymously())
        }
    })
const {data:authListener} = supabase.auth.onAuthStateChange((_event, session) =>{
dispatch(setSession(session))
})
// console.log("authListener",authListener)
return()=>{
    authListener?.subscription.unsubscribe();
}
  },[dispatch])
    return (
    <>{children}</>
  )
}
