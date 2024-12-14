import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is authenticated on mount
        const token = Cookies.get('token');
        if (token) {
            setIsAuthenticated(true);
            // Optionally fetch user data here
        }
    }, []);

    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        // Clear cookie
        Cookies.remove('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
