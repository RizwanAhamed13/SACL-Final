import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role.toUpperCase();
  const isAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMIN' || userRole === 'HOD' || userRole === 'ROLE_HOD';

  if (requiredRole && !isAdmin) {
    if (user.role.toUpperCase() !== requiredRole.toUpperCase()) {
      return <Navigate to="/" replace />;
    }
  }

  if (requiredPermission && !isAdmin) {
    if (!user.formPermissions?.includes(requiredPermission)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
