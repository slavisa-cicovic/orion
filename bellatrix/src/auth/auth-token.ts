let accessToken: string | null = null;

export function setAuthToken(token: string | null) {
  accessToken = token;
}

export function getAuthToken() {
  return accessToken;
}
