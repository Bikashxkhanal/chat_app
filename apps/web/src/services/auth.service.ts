// import { ApiError, ApiResponse } from "@repo/utils";
// import { ApiResponse } from "@repo/utils";


import type {localLoginBody, localRegisterBody, preLocalRegisterBody} from '@repo/types'
import api from "./axios";
import type { ApiResponse, User } from '../types/auth.types';
import { ApiError } from '@repo/utils';
import { AxiosError } from 'axios';

const postFn = async<TBody, TData> (endpoint : string, body : TBody) : Promise<ApiResponse<TData>> => {

    try {
      const response = await api.post(endpoint, body );  
      return response.data;
    } catch (error : unknown) {
      if(error instanceof ApiError){
        throw error.message;
      }else if (error instanceof AxiosError){
        throw error.message;
      }
      throw new Error("Request failed, please try again");
    }
    
}

export const login = async (loginData : localLoginBody) : Promise<ApiResponse<User>> => {
  // console.log("inside login");
  return postFn("/login", loginData);
} 

export const preRegister = async (preSignupData:preLocalRegisterBody) : Promise<ApiResponse<{isUser : boolean, otpVerified :  boolean}>> => {
  return postFn("/presignup", preSignupData);
}

export const register = async (postSignupData:localRegisterBody) : Promise<ApiResponse<User>> =>{
  return postFn('/postsignup', postSignupData);
}