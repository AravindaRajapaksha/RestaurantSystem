import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default AdminRoute;
