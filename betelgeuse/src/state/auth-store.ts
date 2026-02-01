import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "betelgeuse.auth";

export type AuthState = {
  accessToken: string | null;
  hydrated: boolean;
  setAccessToken: (token: string | null) => void;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  hydrated: false,
  setAccessToken: (token) => {
    set({ accessToken: token });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: token })).catch(() => undefined);
  },
  clearSession: async () => {
    set({ accessToken: null });
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { accessToken?: string };
        set({ accessToken: parsed.accessToken ?? null, hydrated: true });
        return;
      }
    } catch {
      // ignore
    }
    set({ hydrated: true });
  }
}));
