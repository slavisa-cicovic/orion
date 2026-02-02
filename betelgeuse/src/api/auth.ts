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

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
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
