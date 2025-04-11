import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import ProjectFormPage from "@/pages/project-form-page";
import InfluencerDashboard from "@/pages/influencer-dashboard";
import Influencers from "@/pages/influencers";
import Login from "@/pages/login";
import Register from "@/pages/register";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/">
        <ProtectedRoute>
          {user?.role === "manager" ? <Dashboard /> : <InfluencerDashboard />}
        </ProtectedRoute>
      </Route>
      
      <Route path="/projects">
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      </Route>
      
      <Route path="/projects/new">
        <ProtectedRoute>
          <ProjectFormPage id="new" />
        </ProtectedRoute>
      </Route>
      
      <Route path="/projects/:id/edit">
        {(params) => (
          <ProtectedRoute>
            <ProjectFormPage id={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/projects/:id">
        {(params) => (
          <ProtectedRoute>
            <ProjectDetail id={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/influencers">
        <ProtectedRoute>
          <Influencers />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;