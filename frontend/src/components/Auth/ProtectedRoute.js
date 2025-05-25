import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function ProtectedRoute({ requiredRoles }) {
  const { currentUser, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }
  
  return <Outlet />;
}

export default ProtectedRoute;