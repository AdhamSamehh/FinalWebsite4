import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminLogin from './components/Auth/AdminLogin';
import NotFound from './components/NotFound/NotFound';

// Protected Route component for future protected routes
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/notFound" element={<NotFound />} />
            <Route path="/" element={<Home />} />
            {/* Add protected routes here if needed */}
        </Routes>
    );
};

export default AppRoutes;
