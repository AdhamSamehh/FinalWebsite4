import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || !user?.isAdmin) {
            navigate('/admin/login');
            return;
        }
        fetchProducts();
    }, [isAuthenticated, user, navigate]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5001/products', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            setError('Error fetching products: ' + error.message);
        }
    };

    const updateProductCode = async (productId, newCode) => {
        try {
            const response = await fetch(`http://localhost:5001/admin/products/${productId}/code`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ newCode })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update product code');
            }

            setSuccess('Product code updated successfully');
            fetchProducts(); // Refresh the product list
            setEditingProduct(null);
        } catch (error) {
            setError('Error updating product code: ' + error.message);
        }
    };

    const handleCodeUpdate = (product) => {
        setEditingProduct(product);
    };

    const handleCodeSubmit = async (e, product) => {
        e.preventDefault();
        const newCode = e.target.newCode.value;
        await updateProductCode(product.ProductID, newCode);
    };

    if (!isAuthenticated || !user?.isAdmin) {
        return <div>Please log in as admin to view this page.</div>;
    }

    return (
        <div className="product-list-container">
            <h2>Product Management</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <table className="product-table">
                <thead>
                    <tr>
                        <th>Product Code</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.ProductID}>
                            <td>
                                {editingProduct?.ProductID === product.ProductID ? (
                                    <form onSubmit={(e) => handleCodeSubmit(e, product)}>
                                        <input 
                                            type="text" 
                                            name="newCode"
                                            defaultValue={product.ProductCode}
                                            required
                                        />
                                        <button type="submit">Save</button>
                                        <button type="button" onClick={() => setEditingProduct(null)}>Cancel</button>
                                    </form>
                                ) : (
                                    <>
                                        {product.ProductCode}
                                        <button onClick={() => handleCodeUpdate(product)}>Edit Code</button>
                                    </>
                                )}
                            </td>
                            <td>{product.ProductName}</td>
                            <td>{product.category}</td>
                            <td>${product.price}</td>
                            <td>
                                <button onClick={() => navigate(`/admin/products/edit/${product.ProductID}`)}>
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;
