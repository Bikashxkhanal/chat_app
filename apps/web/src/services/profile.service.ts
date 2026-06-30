import type { UpdateProfileBody, CreateGroupBody } from "@repo/types";
import type { ApiSuccessResponseInterface } from "@repo/types";
import { apiClient } from "./api";

export async function getMyProfile() {
  const { data } = await apiClient.get<ApiSuccessResponseInterface>("/users/me");
  return data.data;
}

export async function updateMyProfile(body: UpdateProfileBody) {
  const { data } = await apiClient.patch<ApiSuccessResponseInterface>("/users/me", body);
  return data.data;
}

export async function createGroup(body: CreateGroupBody) {
  const { data } = await apiClient.post<ApiSuccessResponseInterface>("/groups", body);
  return data.data as {
    group: { _id: string; name: string; avatar?: string };
    conversation: { _id: string };
  };
}
