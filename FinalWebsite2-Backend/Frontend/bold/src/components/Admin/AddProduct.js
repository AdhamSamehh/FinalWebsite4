import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AddProduct.css';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        ProductName: '',
        productDescription: '',
        price: '',
        category: '',
        stockQuantity: ''
    });
    const [images, setImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        // Check if user is authenticated and is admin
        if (!isAuthenticated || !user?.isAdmin) {
            navigate('/admin/login');
            return;
        }
    }, [isAuthenticated, user, navigate]);

    // If not authenticated or not admin, show login message
    if (!isAuthenticated || !user?.isAdmin) {
        return (
            <div className="add-product-container">
                <div className="message-box">
                    <h2>Admin Access Required</h2>
                    <p>Please log in as an administrator to access this page.</p>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreview(previews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            images.forEach(image => {
                formDataToSend.append('images', image);
            });

            const response = await fetch('http://localhost:5001/admin/products/add', {
                method: 'POST',
                credentials: 'include',
                body: formDataToSend
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.error === "Authentication required" || data.error === "Admin access required") {
                    navigate('/admin/login');
                    return;
                }
                throw new Error(data.error || 'Failed to add product');
            }

            const data = await response.json();
            setSuccess('Product added successfully!');
            setFormData({
                ProductName: '',
                productDescription: '',
                price: '',
                category: '',
                stockQuantity: ''
            });
            setImages([]);
            setImagePreview([]);

            setTimeout(() => navigate('/admin/products'), 2000);
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to add product');
        }
    };

    return (
        <div className="add-product-container">
            <h2>Add New Product</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="ProductName">Product Name</label>
                    <input
                        type="text"
                        id="ProductName"
                        name="ProductName"
                        value={formData.ProductName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="productDescription">Description</label>
                    <textarea
                        id="productDescription"
                        name="productDescription"
                        value={formData.productDescription}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="stockQuantity">Stock Quantity</label>
                    <input
                        type="number"
                        id="stockQuantity"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="images">Product Images</label>
                    <input
                        type="file"
                        id="images"
                        name="images"
                        onChange={handleImageChange}
                        multiple
                        accept="image/*"
                    />
                </div>
                {imagePreview.length > 0 && (
                    <div className="image-preview">
                        {imagePreview.map((url, index) => (
                            <img key={index} src={url} alt={`Preview ${index + 1}`} />
                        ))}
                    </div>
                )}
                <button type="submit">Add Product</button>
            </form>
        </div>
    );
};

export default AddProduct;
