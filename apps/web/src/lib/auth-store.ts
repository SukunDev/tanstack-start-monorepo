export interface User {
  id: number;
  email: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  otpToken: string | null;
  isAuthenticated: boolean;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
} as const;

export const authStore = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  getUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  setTokens: (accessToken: string, refreshToken: string, user: User) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clearTokens: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  isAuthenticated: (): boolean => {
    return !!authStore.getAccessToken();
  },
};

