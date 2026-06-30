import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { IUserDocument } from "@repo/types";
import { AUTH_ROLE } from "@repo/types";
import { LocalStorage } from "../utils";
import { login as loginApi, logout as logoutApi } from "../services/auth.service";
import type { LoginResponse } from "../types/auth.types";

interface AuthContextValue {
  user: IUserDocument | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: { phone_number: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<IUserDocument> & Record<string, unknown>) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUserDocument | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = LocalStorage.get("user") as IUserDocument | null;
    const storedToken = LocalStorage.get("accessToken") as string | null;
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  const login = async (data: { phone_number: string; password: string }) => {
    const response = await loginApi({
      type: AUTH_ROLE.NORMAL,
      phone_number: data.phone_number,
      password: data.password,
    });

    const payload = response.data as LoginResponse;
    if (payload.accessToken) {
      LocalStorage.set("accessToken", payload.accessToken);
      setToken(payload.accessToken);
    }
    if (payload.user) {
      LocalStorage.set("user", payload.user);
      setUser(payload.user as unknown as IUserDocument);
    }
    navigate("/dashboard");
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      LocalStorage.remove("accessToken");
      LocalStorage.remove("user");
      setUser(null);
      setToken(null);
      navigate("/login");
    }
  };

  const updateUser = (updated: Partial<IUserDocument> & Record<string, unknown>) => {
    setUser((prev) => ({ ...(prev ?? {}), ...updated }) as IUserDocument);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
