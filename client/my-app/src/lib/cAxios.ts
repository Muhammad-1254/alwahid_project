import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import { apiRoutes } from '../constants/apiRoutes';
import { router } from 'expo-router';

const cAxios = axios.create({
  baseURL: ""
});

// Request interceptor to add token to headers
cAxios.interceptors.request.use(async (config) => {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token refresh
cAxios.interceptors.response.use((response) => {
  return response;
}, async (error) => {
  if(!error.response){
    // handling network error
    console.log("error message from cAxios: ",error.message)
    return Promise.reject(error)
  }
  const originalRequest = error.config;
      // Check if the error status is 401 and retry flag is not set
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    
    // try to refresh the token 
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken")
      const response = await axios.post(apiRoutes.getAccessToken,{refreshToken})
      console.log("response status from get new access token: ",response.status)
      if(response.status ===200|| response.status ===201){
        const {accessToken,refreshToken} = response.data

        // save new tokens
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);

        // set the new accessToken in the request headers
        cAxios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`

        // retry the original request with the new accessToken
        console.log("retrying the original request with new access token")
        return cAxios(originalRequest)

      }
    } catch (refreshError) {
      // if this fails, logout the user
      console.error("Token refresh failed: ",refreshError)
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      router.navigate("/(auth)/login")
    }
  
  }
  return Promise.reject(error);
});

export default cAxios;
