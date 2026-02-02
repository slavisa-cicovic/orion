export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080/api";

const normalize = (value?: string) =>
  value && value.trim().length > 0 ? value : undefined;

const parseJsonMap = (value?: string): Record<string, string> | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const appConfig = {
  debugLoginIdentifier: normalize(
    process.env.EXPO_PUBLIC_DEBUG_LOGIN_IDENTIFIER,
  ),
  debugLoginPassword: normalize(process.env.EXPO_PUBLIC_DEBUG_LOGIN_PASSWORD),
  debugLoginMap: parseJsonMap(process.env.EXPO_PUBLIC_DEBUG_LOGIN_MAP),
};
