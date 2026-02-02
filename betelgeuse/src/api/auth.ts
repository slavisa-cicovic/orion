import { axiosInstance } from "@src/utils/axios";
import { appConfig } from "@src/constants/config";

type LoginPayload = {
  usernameOrEmail: string;
  password: string;
};

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyCode: string;
};

type ForgotPasswordPayload = {
  email: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type ProfileResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
};

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await axiosInstance.post<LoginResponse>(
    "/auth/login",
    resolveLoginPayload(payload),
  );
  return res.data;
}

export async function register(payload: RegisterPayload): Promise<void> {
  await axiosInstance.post("/auth/register", payload);
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<void> {
  await axiosInstance.post("/auth/forgot-password", payload);
}

export async function getMyProfile(): Promise<ProfileResponse> {
  const res = await axiosInstance.get<ProfileResponse>("/auth/me");
  console.log('................', res)
  return res.data;
}

export async function updateMyProfile(
  payload: UpdateProfilePayload,
): Promise<ProfileResponse> {
  const res = await axiosInstance.put<ProfileResponse>("/auth/me", payload);
  return res.data;
}

export async function changeMyPassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await axiosInstance.post("/auth/change-password", payload);
}

function resolveLoginPayload(payload: LoginPayload): LoginPayload {
  if (appConfig.debugLoginIdentifier && appConfig.debugLoginPassword) {
    return {
      usernameOrEmail: appConfig.debugLoginIdentifier,
      password: appConfig.debugLoginPassword,
    };
  }

  if (appConfig.debugLoginMap && appConfig.debugLoginPassword) {
    const mappedIdentifier = appConfig.debugLoginMap[payload.usernameOrEmail];
    if (mappedIdentifier) {
      return {
        usernameOrEmail: mappedIdentifier,
        password: appConfig.debugLoginPassword,
      };
    }
  }

  return payload;
}
