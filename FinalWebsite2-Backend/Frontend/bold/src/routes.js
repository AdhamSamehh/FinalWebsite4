import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminLogin from './components/Auth/AdminLogin';
import NotFound from './components/NotFound/NotFound';
import AddProduct from './components/Admin/AddProduct';
import Dashboard from './components/Admin/Dashboard';
import DeleteProducts from './components/Admin/DeleteProducts';
import ProductSpreadsheet from './components/Admin/ProductSpreadsheet';
import UserSpreadsheet from './components/Admin/UserSpreadsheet';
import DeleteUsers from './components/Admin/DeleteUsers';

// Protected Route component for future protected routes
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    return children;
};

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products/add" element={<AddProduct />} />
            <Route path="/admin/products/delete" element={<DeleteProducts />} />
            <Route path="/admin/products" element={<ProductSpreadsheet />} />
            <Route path="/admin/users" element={<UserSpreadsheet />} />
            <Route path="/admin/users/list" element={<UserSpreadsheet />} />
            <Route path="/admin/users/delete" element={<DeleteUsers />} />
            <Route path="/notFound" element={<NotFound />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
