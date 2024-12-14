import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeleteProducts.css';

const DeleteProducts = () => {
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5001/admin/products', {
                withCredentials: true
            });
            setProducts(response.data);
        } catch (err) {
            setError('Failed to fetch products: ' + (err.response?.data?.error || err.message));
            console.error('Error fetching products:', err);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:5001/admin/products/${productId}`, {
                    withCredentials: true
                });
                setMessage('Product deleted successfully');
                fetchProducts(); // Refresh the list
            } catch (err) {
                setError('Failed to delete product: ' + (err.response?.data?.error || err.message));
                console.error('Error deleting product:', err);
            }
        }
    };

    return (
        <div className="delete-products-container">
            <h2>Delete Products</h2>
            
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            
            <div className="products-grid">
                {products.map(product => (
                    <div key={product.productID} className="product-card">
                        <div className="product-image">
                            {product.images && product.images[0] && (
                                <img 
                                    src={`http://localhost:5001/${product.images[0]}`} 
                                    alt={product.ProductName}
                                />
                            )}
                        </div>
                        <div className="product-info">
                            <h3>{product.ProductName}</h3>
                            <p className="product-category">{product.category}</p>
                            <p className="product-price">${product.price}</p>
                            <button 
                                className="delete-button"
                                onClick={() => handleDelete(product.productID)}
                            >
                                Delete Product
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeleteProducts;
