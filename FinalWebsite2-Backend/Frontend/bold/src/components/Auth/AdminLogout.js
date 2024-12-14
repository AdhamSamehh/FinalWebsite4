import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const AdminLogout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:4444/admin/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                logout(); // Clear auth context
                navigate('/admin/login');
            } else {
                console.error('Logout failed:', data.message);
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <button 
            onClick={handleLogout}
            className="logout-button"
        >
            Logout
        </button>
    );
};

export default AdminLogout;
