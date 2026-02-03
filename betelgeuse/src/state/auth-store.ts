import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "betelgeuse.auth";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  setSession: (tokens: { accessToken: string | null; refreshToken: string | null }) => void;
  setAccessToken: (token: string | null) => void;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const persistSession = async (accessToken: string | null, refreshToken: string | null) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }));
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  setSession: ({ accessToken, refreshToken }) => {
    set({ accessToken, refreshToken });
    persistSession(accessToken, refreshToken).catch(() => undefined);
  },
  setAccessToken: (token) => {
    const refreshToken = useAuthStore.getState().refreshToken;
    set({ accessToken: token });
    persistSession(token, refreshToken).catch(() => undefined);
  },
  clearSession: async () => {
    set({ accessToken: null, refreshToken: null });
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { accessToken?: string; refreshToken?: string };
        set({
          accessToken: parsed.accessToken ?? null,
          refreshToken: parsed.refreshToken ?? null,
          hydrated: true,
        });
        return;
      }
    } catch {
      // ignore
    }
    set({ hydrated: true });
  }
}));
