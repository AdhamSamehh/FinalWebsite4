import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentImageIndex, setCurrentImageIndex] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5001/products');
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch products');
            setLoading(false);
        }
    };

    const handleBuyNow = async (productId) => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert('Please login to purchase products');
                return;
            }

            await axios.put('http://localhost:5001/products/buyNow', {
                productId,
                userId,
                quantity: 1
            });
            
            alert('Purchase successful!');
            fetchProducts();
        } catch (err) {
            alert('Failed to complete purchase');
        }
    };

    const filteredProducts = products.filter(product => {
        return selectedCategory === 'all' || 
               product.category.toLowerCase() === selectedCategory.toLowerCase();
    });

    const hoodieProducts = products.filter(product => 
        product.category.toLowerCase() === 'hoodies'
    );
    const sweatpantsProducts = products.filter(product => 
        product.category.toLowerCase() === 'sweatpants'
    );

    const getProductImages = (productName) => {
        console.log('Getting images for:', productName);
        const imageMap = {
            'Pink Hoodie': ['/BoldPhotos/Pink Hoodie/PinkH1.jpg', '/BoldPhotos/Pink Hoodie/PinkH2.jpg'],
            'Black Hoodie': ['/BoldPhotos/BlackH1.JPG', '/BoldPhotos/BlackH2.JPG'],
            'Black Sweatpants': ['/BoldPhotos/BlackSP1.JPG', '/BoldPhotos/BlackSP2.JPG'],
            'Pink Sweatpants': ['/BoldPhotos/PinkSP1.jpg', '/BoldPhotos/PinkSP2.JPG']
        };
        const images = imageMap[productName] || ['/BoldPhotos/SAY_0010.jpg'];
        console.log('Returning images:', images);
        return images;
    };

    const handleNextImage = (productId) => {
        setCurrentImageIndex(prev => {
            const currentIndex = prev[productId] || 0;
            const images = getProductImages(products.find(p => p.productID === productId)?.ProductName);
            return {
                ...prev,
                [productId]: (currentIndex + 1) % images.length
            };
        });
    };

    const renderProductCards = (products) => {
        return products.map(product => {
            const images = getProductImages(product.ProductName);
            const currentIndex = currentImageIndex[product.productID] || 0;
            console.log('Rendering product:', product.ProductName, 'with image:', images[currentIndex]);

            return (
                <div key={product.productID} className="product-card">
                    <div 
                        className="product-image" 
                        onClick={() => images.length > 1 && handleNextImage(product.productID)}
                        style={{ cursor: images.length > 1 ? 'pointer' : 'default' }}
                    >
                        <img 
                            src={images[currentIndex]}
                            alt={product.ProductName}
                            onError={(e) => {
                                console.log('Image error for:', product.ProductName, e.target.src);
                                e.target.onerror = null;
                                e.target.src = `/BoldPhotos/SAY_0010.jpg`;
                            }}
                        />
                        {images.length > 1 && (
                            <div className="image-counter">
                                {currentIndex + 1}/{images.length}
                            </div>
                        )}
                    </div>
                    <h3>{product.ProductName}</h3>
                    <p className="product-description">{product.productDescription}</p>
                    <p className="price">{product.price} EGP</p>
                    <p className="stock">In Stock: {product.stockQuantity}</p>
                    <button 
                        onClick={() => handleBuyNow(product.productID)}
                        disabled={product.stockQuantity === 0}
                        className="buy-button"
                    >
                        {product.stockQuantity === 0 ? 'Out of Stock' : 'Buy Now'}
                    </button>
                </div>
            );
        });
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="home-container">
            <div className="search-section">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select"
                >
                    <option value="all">All Categories</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="sweatpants">Sweatpants</option>
                </select>
            </div>

            {selectedCategory === 'all' ? (
                <>
                    <div className="category-section">
                        <h2 className="category-header">Hoodies</h2>
                        <div className="products-grid">
                            {renderProductCards(hoodieProducts)}
                        </div>
                    </div>

                    <div className="category-section">
                        <h2 className="category-header">Sweatpants</h2>
                        <div className="products-grid">
                            {renderProductCards(sweatpantsProducts)}
                        </div>
                    </div>
                </>
            ) : (
                <div className="products-grid">
                    {renderProductCards(filteredProducts)}
                </div>
            )}
            <div className="admin-login-container">
                <Link to="/admin/login" className="admin-link">Admin Login</Link>
            </div>
        </div>
    );
};

export default Home;