import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditUser from './EditUser';
import './UserList.css';
import './Admin.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5001/admin/users/list', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    navigate('/admin/login');
                    return;
                }
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
    };

    const handleUpdateUser = (updatedUser) => {
        setUsers(users.map(user => 
            user.userID === updatedUser.userID ? updatedUser : user
        ));
    };

    const handleDeleteClick = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/admin/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    navigate('/admin/login');
                    return;
                }
                throw new Error('Failed to delete user');
            }

            // Remove user from state
            setUsers(users.filter(user => user.userID !== userId));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="user-list-container">Loading...</div>;
    if (error) return <div className="user-list-container">Error: {error}</div>;

    return (
        <div className="user-list-container">
            <h2>User List</h2>
            <div className="user-table-wrapper">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.userID}>
                                <td>{user.userID}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            onClick={() => handleEditClick(user)}
                                            className="edit-button"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(user.userID)}
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <EditUser
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onUpdate={handleUpdateUser}
                />
            )}
        </div>
    );
};

export default UserList;
