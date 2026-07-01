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
    const roles = requiredRole.toUpperCase().split(',');
    const hasRole = roles.some(role => userRole === role.trim() || userRole === `ROLE_${role.trim()}`);
    if (!isSuperAdmin && !hasRole) {
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
