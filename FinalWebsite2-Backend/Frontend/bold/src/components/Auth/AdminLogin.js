import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:4444/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.text();

            if (!response.ok) {
                throw new Error(data || 'Admin login failed');
            }

            // Store admin info in auth context
            login({ username: formData.username, isAdmin: true });
            
            // If login is successful, redirect to admin dashboard
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message || 'An error occurred during admin login');
            console.error('Admin login error:', err);
        }
    };

    return (
        <div className="page-container">
            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Admin Login</h2>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Login as Admin</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
