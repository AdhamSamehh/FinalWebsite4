import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './NavBar.css';

const NavBar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const endpoint = user?.isAdmin ? '/admin/logout' : '/user/logout';
            const response = await fetch(`http://localhost:5001${endpoint}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                await logout();
                navigate(user?.isAdmin ? '/admin/login' : '/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-left">
                {isAuthenticated && (
                    <span className="welcome-message">Welcome, {user?.username || 'User'}!</span>
                )}
            </div>
            <div className="nav-brand">
                <Link to="/">BOLD</Link>
            </div>
            <div className="nav-right">
                {isAuthenticated ? (
                    <>
                        {user?.isAdmin && (
                            <Link to="/admin/dashboard" className="dashboard-button">Dashboard</Link>
                        )}
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="login-button">Login</Link>
                        <Link to="/register" className="register-link">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;