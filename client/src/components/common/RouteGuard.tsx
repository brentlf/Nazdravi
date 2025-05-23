import { ReactNode } from "react";
import { Navigate, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface RouteGuardProps {
  children: ReactNode;
  role?: "client" | "admin";
  requireAuth?: boolean;
}

export function RouteGuard({ children, role, requireAuth = true }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    setLocation("/login");
    return null;
  }

  if (role && user?.role !== role) {
    if (user?.role === "admin") {
      setLocation("/admin");
    } else {
      setLocation("/dashboard");
    }
    return null;
  }

  return <>{children}</>;
}
