import { useAuthStore } from "@/contexts/auth";
import { useEffect, useState } from "react";

console.log('Loading use-auth hook with Zustand store');

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, register } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Set loading to false after mount
    setIsLoading(false);
  }, []);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register
  };
};
