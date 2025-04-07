import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import InfluencerDashboard from "@/pages/influencer-dashboard";
import Influencers from "@/pages/influencers";
import Login from "@/pages/login";
import { AuthProvider } from "@/contexts/auth-context";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">{t("loading")}</div>;
  }
  
  if (!user) {
    return <Login />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        {user?.role === "manager" ? 
          <ProtectedRoute component={Dashboard} /> : 
          <ProtectedRoute component={InfluencerDashboard} />
        }
      </Route>
      
      <Route path="/projects">
        <ProtectedRoute component={Projects} />
      </Route>
      
      <Route path="/projects/:id">
        {(params) => <ProtectedRoute component={ProjectDetail} id={params.id} />}
      </Route>
      
      <Route path="/influencers">
        <ProtectedRoute component={Influencers} />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
