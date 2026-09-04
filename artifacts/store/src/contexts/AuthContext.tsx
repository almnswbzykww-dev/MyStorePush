import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useGetMe, useLogin, useLogout, useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface User {
  id: number;
  username: number | null;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  permissions: string | null;
  mustChangePassword: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  loginMutation: ReturnType<typeof useLogin>;
  registerMutation: ReturnType<typeof useRegister>;
  logoutFn: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: sessionUser, isLoading: sessionLoading } = useGetMe();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const logoutFn = useCallback(() => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        queryClient.clear();
      },
    });
  }, [logoutMutation, queryClient]);

  const currentUser = sessionUser as User | undefined;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser ?? null,
        isLoading: sessionLoading,
        isAdmin: currentUser?.role === "admin",
        loginMutation,
        registerMutation,
        logoutFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
