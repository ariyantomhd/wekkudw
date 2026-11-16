import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export interface ProtectedRouteProps {
  isAllowed: boolean;
  isChecking?: boolean;
  redirectTo?: string;
  children: ReactNode;
}

export function ProtectedRoute({
  isAllowed,
  isChecking = false,
  redirectTo = '/admin/login',
  children,
}: ProtectedRouteProps) {
  const location = useLocation();

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600">
          Verifying admin session...
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
