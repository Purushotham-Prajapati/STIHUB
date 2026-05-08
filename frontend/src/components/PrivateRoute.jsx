import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './ui/Loading';

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    // If not logged in, silently redirect to home instead of a generic /login to prevent discovery
    return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
