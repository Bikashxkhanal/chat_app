import axios from "axios";
import type { localLoginBody, localRegisterBody, preLocalRegisterBody } from "@repo/types";
import type { ApiResponse, User, LoginResponse } from "../types/auth.types";
import { apiClient } from "./api";

const postFn = async <TBody, TData>(
  endpoint: string,
  body: TBody
): Promise<ApiResponse<TData>> => {
  try {
    const response = await apiClient.post(endpoint, body);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "something went wrong");
    }
    throw new Error("Request failed, please try again");
  }
};

export const login = async (
  loginData: localLoginBody
): Promise<ApiResponse<LoginResponse>> => {
  return postFn("/auth/login", loginData);
};

export const logout = async () => {
  return postFn("/auth/logout", {});
};

export const preRegister = async (
  preSignupData: preLocalRegisterBody
): Promise<ApiResponse<{ isUser: boolean; otpVerified: boolean }>> => {
  return postFn("/auth/preregister", preSignupData);
};

export const register = async (
  postSignupData: localRegisterBody
): Promise<ApiResponse<User>> => {
  return postFn("/auth/register", postSignupData);
};
