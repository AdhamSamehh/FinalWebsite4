import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserSpreadsheet.css';

const UserSpreadsheet = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5001/admin/users', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users. ' + (err.response?.data?.error || err.message));
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="user-spreadsheet-container">
            <h2>Users List</h2>
            <div className="spreadsheet-wrapper">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Created At</th>
                            <th>Last Login</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.userID}>
                                <td>{user.userID}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{new Date(user.createdAt).toLocaleString()}</td>
                                <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                                <td>
                                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="6" className="no-users">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserSpreadsheet;
