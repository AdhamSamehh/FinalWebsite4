import React, { useState } from 'react';
import './Admin.css';

const EditUser = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        username: user.username || '',
        email: user.email || '',
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

        // Only include fields that have been modified
        const updateData = {};
        if (formData.username !== user.username && formData.username) {
            updateData.username = formData.username;
        }
        if (formData.email !== user.email && formData.email) {
            updateData.email = formData.email;
        }
        if (formData.password) {
            updateData.password = formData.password;
        }

        if (Object.keys(updateData).length === 0) {
            setError('No changes made');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/admin/users/${user.userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('User updated successfully');
                if (onUpdate) {
                    onUpdate({
                        ...user,
                        ...updateData,
                        password: undefined // Don't update password in UI
                    });
                }
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                throw new Error(data.error || 'Failed to update user');
            }
        } catch (err) {
            setError(err.message || 'Error updating user');
            console.error('Update error:', err);
        }
    };

    return (
        <div className="edit-user-modal">
            <div className="modal-content">
                <h2>Edit User</h2>
                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter new username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter new email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="submit-button">Update User</button>
                        <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;
