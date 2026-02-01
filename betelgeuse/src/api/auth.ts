import { API_BASE_URL } from "@src/constants/config";

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
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Login failed");
  }

  return res.json();
}

export async function register(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Register failed");
  }
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Forgot password failed");
  }
}
