import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role.toUpperCase();
  const isSuperAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMIN';
  const hasGlobalFormAccess = isSuperAdmin || userRole.includes('HOD');

  if (requiredRole) {
    if (!isSuperAdmin && userRole !== requiredRole.toUpperCase() && userRole !== `ROLE_${requiredRole.toUpperCase()}`) {
      return <Navigate to="/" replace />;
    }
  }

  if (requiredPermission) {
    if (!hasGlobalFormAccess && !user.formPermissions?.includes(requiredPermission)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
