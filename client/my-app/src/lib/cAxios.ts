import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';

const cAxios = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_DOMAIN_DEV?.toString()+"/api",
});

// Request interceptor to add token to headers
cAxios.interceptors.request.use(async (config) => {
  const accessToken = await AsyncStorage.getItem('accessToken');
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
    console.log(error.message)
    return Promise.reject(error)
  }
  const originalRequest = error.config;
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    return cAxios.post('/auth/refresh-token', { refreshToken })
      .then(async (res) => {
        if (res.status === 200) {
          await AsyncStorage.setItem('accessToken', res.data.access_token);
          await AsyncStorage.setItem('refreshToken', res.data.refresh_token);
          cAxios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${res.data.access_token}`;
          return cAxios(originalRequest);
        }
      });
  }
  return Promise.reject(error);
});

export default cAxios;
