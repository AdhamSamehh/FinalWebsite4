import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeleteUsers.css';

const DeleteUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5001/admin/users', {
                withCredentials: true
            });
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users. Please try again later.');
            setLoading(false);
        }
    };

    const handleCheckboxChange = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleDeleteSelected = async () => {
        if (!selectedUsers.length) {
            alert('Please select at least one user to delete.');
            return;
        }

        if (!window.confirm('Are you sure you want to delete the selected users? This action cannot be undone.')) {
            return;
        }

        try {
            await Promise.all(
                selectedUsers.map(userId =>
                    axios.delete(`http://localhost:5001/admin/users/${userId}`, {
                        withCredentials: true
                    })
                )
            );
            
            alert('Selected users have been deleted successfully.');
            setSelectedUsers([]);
            fetchUsers(); // Refresh the list
        } catch (err) {
            alert('Failed to delete some users. Please try again.');
        }
    };

    if (loading) return <div className="delete-users-container">Loading...</div>;
    if (error) return <div className="delete-users-container error">{error}</div>;

    return (
        <div className="delete-users-container">
            <h2>Delete Users</h2>
            
            <div className="delete-actions">
                <button 
                    className="delete-button"
                    onClick={handleDeleteSelected}
                    disabled={selectedUsers.length === 0}
                >
                    Delete Selected Users ({selectedUsers.length})
                </button>
            </div>

            <div className="users-list">
                {users.map(user => (
                    <div key={user.userID} className="user-item">
                        <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.userID)}
                            onChange={() => handleCheckboxChange(user.userID)}
                        />
                        <div className="user-info">
                            <span className="username">{user.username}</span>
                            <span className="email">{user.email}</span>
                            <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                ))}
                
                {users.length === 0 && (
                    <div className="no-users">No users found.</div>
                )}
            </div>
        </div>
    );
};

export default DeleteUsers;
