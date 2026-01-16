import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authStore, type User } from "@/lib/auth-store";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  otpToken: string | null;
  setTokens: (accessToken: string, refreshToken: string, user: User) => void;
  setOtpToken: (token: string) => void;
  clearOtpToken: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [otpToken, setOtpTokenState] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = authStore.getUser();
    const storedAccessToken = authStore.getAccessToken();
    if (storedUser && storedAccessToken) {
      setUser(storedUser);
    }
  }, []);

  const setTokens = (accessToken: string, refreshToken: string, user: User) => {
    authStore.setTokens(accessToken, refreshToken, user);
    setUser(user);
  };

  const setOtpToken = (token: string) => {
    setOtpTokenState(token);
  };

  const clearOtpToken = () => {
    setOtpTokenState(null);
  };

  const logout = () => {
    authStore.clearTokens();
    setUser(null);
    setOtpTokenState(null);
  };

  const isAuthenticated = !!authStore.getAccessToken();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        otpToken,
        setTokens,
        setOtpToken,
        clearOtpToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

