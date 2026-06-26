import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  allowedType?: 'INTERNO' | 'EXTERNO';
}

export function ProtectedRoute({ allowedType }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedType && user.userType !== allowedType) {
    // Se tentou acessar área errada, redireciona para a correta
    if (user.userType === 'EXTERNO') {
      return <Navigate to="/portal" replace />;
    } else {
      return <Navigate to="/admin" replace />;
    }
  }

  return <Outlet />;
}
