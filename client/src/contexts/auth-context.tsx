import React, { createContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

type User = {
  id: number;
  username: string;
  name: string;
  role: "manager" | "influencer";
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, password: string, name: string, role: "manager" | "influencer") => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error(t("fetch_user_failed"), error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [t]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const data = await response.json();
      setUser(data.user);
      setLocation("/");
      toast({
        title: t("login_success"),
        description: `${t("welcome")}, ${data.user.name}!`,
      });
    } catch (error) {
      toast({
        title: t("login_failed"),
        description: t("invalid_credentials"),
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
      setLocation("/login");
      toast({
        title: t("logout_success"),
        description: t("logout_success_description"),
      });
    } catch (error) {
      toast({
        title: t("logout_failed"),
        description: t("logout_failed_description"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, name: string, role: "manager" | "influencer") => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/register", { username, password, name, role });
      const data = await response.json();
      setUser(data.user);
      setLocation("/");
      toast({
        title: t("registration_success"),
        description: `${t("welcome")}, ${data.user.name}!`,
      });
    } catch (error: any) {
      toast({
        title: t("registration_failed"),
        description: error.message === "User already exists" 
          ? t("registration_failed_exists")
          : t("error"),
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
