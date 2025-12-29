
import React from 'react';
import { useAuth, UserRole } from '../../context/AuthContext';

interface RBACWrapperProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RBACWrapper: React.FC<RBACWrapperProps> = ({ allowedRoles, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RBACWrapper;
