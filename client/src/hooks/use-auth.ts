import { useAuthStore } from "@/contexts/auth";

console.log('Loading use-auth hook with Zustand store');

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, register } = useAuthStore();
  
  console.log('Auth state:', { user, isAuthenticated });
  
  return {
    user,
    isAuthenticated,
    isLoading: false,
    login,
    logout,
    register
  };
};
