import { ReactNode } from "react";
import { Route, Redirect, useLocation } from "wouter";
import { isAuthenticated } from "./auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();

  // Check if the user is authenticated
  const authenticated = isAuthenticated();

  return (
    <Route path={path}>
      {(params) => {
        if (authenticated === null) {
          // Still checking authentication status
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!authenticated) {
          // Redirect to login page if not authenticated
          return <Redirect to="/auth" />;
        }

        // Render the component if authenticated
        return <Component params={params} />;
      }}
    </Route>
  );
}