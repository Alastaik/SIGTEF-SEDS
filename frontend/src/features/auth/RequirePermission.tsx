import { ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface RequirePermissionProps {
  permission: string;
  children: ReactNode;
}

export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { user } = useAuth();

  if (!user) return null;
  
  const hasPermission = user.authorities.includes(permission) || user.authorities.includes('ROLE_ADMIN');

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
}
