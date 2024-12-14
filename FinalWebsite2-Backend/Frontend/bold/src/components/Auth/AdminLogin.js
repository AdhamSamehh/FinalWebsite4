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
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:5001/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            // Try to parse response as JSON, fallback to text if it fails
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                const textData = await response.text();
                throw new Error(textData || 'Server error');
            }

            if (response.ok) {
                setSuccess(data.message || 'Login successful!');
                await login({ 
                    username: data.username, 
                    isAdmin: true 
                });
                navigate('/admin/dashboard');
            } else {
                throw new Error(data.error || 'Admin login failed');
            }
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
                    {success && <div className="success-message">{success}</div>}
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter your username"
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
                            placeholder="Enter your password"
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
