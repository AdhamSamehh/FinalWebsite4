import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductSpreadsheet.css';

const ProductSpreadsheet = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5001/admin/products', {
                withCredentials: true
            });
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch products. ' + (err.response?.data?.error || err.message));
            setLoading(false);
            console.error('Error fetching products:', err);
        }
    };

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="product-spreadsheet-container">
            <h2>Products List</h2>
            <div className="spreadsheet-wrapper">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Images</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.productID}>
                                <td>{product.productID}</td>
                                <td>{product.ProductName}</td>
                                <td className="description-cell">
                                    {product.productDescription}
                                </td>
                                <td>${product.price}</td>
                                <td>{product.category}</td>
                                <td>{product.stockQuantity}</td>
                                <td>
                                    {product.images && product.images.length > 0 ? (
                                        <div className="image-preview">
                                            <img 
                                                src={`http://localhost:5001/${product.images[0]}`}
                                                alt={product.ProductName}
                                            />
                                            {product.images.length > 1 && (
                                                <span>+{product.images.length - 1} more</span>
                                            )}
                                        </div>
                                    ) : (
                                        'No images'
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductSpreadsheet;
