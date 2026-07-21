import type { UpdateProfileBody, CreateGroupBody } from "@repo/types";
import type { ApiSuccessResponseInterface, IUserDocument } from "@repo/types";
import { apiClient } from "./api";

export async function getMyProfile() {
  const { data } = await apiClient.get<ApiSuccessResponseInterface>("/users/me");
  return data.data;
}

export async function updateMyProfile(body: UpdateProfileBody) {
  const { data } = await apiClient.patch<ApiSuccessResponseInterface>("/users/me", body);
  return data.data;
}

export async function uploadProfileAvatar(
  file: File,
  onProgress?: (percent: number) => void
): Promise<Partial<IUserDocument>> {
  const formData = new FormData();
  formData.append("profilePicture", file);

  const { data } = await apiClient.post<ApiSuccessResponseInterface>(
    "/users/upload-profile",
    formData,
    {
      // Do not set Content-Type here. The browser adds the multipart boundary
      // when it serializes FormData; a manually supplied value can omit it.
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    }
  );

  return data.data as Partial<IUserDocument>;
}

export async function createGroup(body: CreateGroupBody) {
  const { data } = await apiClient.post<ApiSuccessResponseInterface>("/groups", body);
  return data.data as {
    group: { _id: string; name: string; avatar?: string };
    conversation: { _id: string };
  };
}
