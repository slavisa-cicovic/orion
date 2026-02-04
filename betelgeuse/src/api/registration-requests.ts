import { axiosInstance } from "@src/utils/axios";

export type RegistrationRequestItem = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  requestedAt: string;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type RegistrationDecisionPayload = {
  approve: boolean;
  pilotUser?: boolean;
};

export async function getPendingRegistrationRequests(params: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<PagedResponse<RegistrationRequestItem>> {
  const res = await axiosInstance.get<PagedResponse<RegistrationRequestItem>>(
    "/mobile/registration-requests",
    { params },
  );
  return res.data;
}

export async function processRegistrationRequest(
  requestId: number,
  payload: RegistrationDecisionPayload,
): Promise<void> {
  await axiosInstance.post(`/mobile/registration-requests/${requestId}/decision`, payload);
}
