import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, userRole, isLoading } = useAuth();

    if (isLoading) {
        // You might want to show a spinner here
        return <div>Loading...</div>;
    }

    if (!user) {
        // User not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // User does not have the required role, redirect to home page
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;