import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogout from '../Auth/AdminLogout';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>BOLD Admin Dashboard</h1>
                <AdminLogout />
            </div>
            
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Products Management</h3>
                    <div className="card-actions">
                        <button 
                            className="dashboard-button primary"
                            onClick={() => navigate('/admin/products/add')}
                        >
                            Add New Product
                        </button>
                        <button 
                            className="dashboard-button secondary"
                            onClick={() => navigate('/admin/products')}
                        >
                            View All Products
                        </button>
                        <button 
                            className="dashboard-button danger"
                            onClick={() => navigate('/admin/products/delete')}
                        >
                            Delete Products
                        </button>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>User Management</h3>
                    <div className="card-actions">
                        <button 
                            className="dashboard-button primary"
                            onClick={() => navigate('/admin/users')}
                        >
                            Manage Users
                        </button>
                        <button 
                            className="dashboard-button secondary"
                            onClick={() => navigate('/admin/users')}
                        >
                            View All Users
                        </button>
                        <button 
                            className="dashboard-button danger"
                            onClick={() => navigate('/admin/users/delete')}
                        >
                            Delete Users
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
