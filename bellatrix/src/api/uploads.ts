import axiosInstance, { endpoints } from "@/utils/axios";

export type UploadType = "ICON" | "COMPANY_ICON" | "APK" | "IPA";

export type UploadResponse = {
  path: string;
  fileName: string;
  contentType: string;
  size: number;
};

export const UploadApi = {
  async uploadFile(type: UploadType, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosInstance.post(`${endpoints.uploads.list}?type=${type}`, formData, {
      headers: { "content-type": "multipart/form-data" }
    });

    return res.data;
  }
};
