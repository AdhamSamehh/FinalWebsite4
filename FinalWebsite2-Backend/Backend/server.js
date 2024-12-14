const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken')
const server = express();
const bcrypt = require('bcryptjs')
const port = 5001;
const { db, initializeTables } = require('./database');
const cookieParser = require('cookie-parser')
const multer = require('multer');
const path = require('path');
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Initialize database tables
initializeTables();

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// Serve static files from uploads directory
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for token authentication
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token', cookieOptions);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

// Middleware for admin authentication
function verifyAdminToken(req, res, next) {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({ error: "Admin access required" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token', cookieOptions);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

// Apply CORS configuration
server.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie']
}));

server.use(cookieParser());
server.use(express.json());

// Cookie settings
const cookieOptions = {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

// Admin Registration Route
server.post('/admin/register', async(req, res) => {
    const { username, email, password, } = req.body;

    if (!username || !password || !email) {
        return res.status(400).send("Missing required fields: username, password.");
    }

    // Check if username already exists
    const checkUserQuery = `SELECT * FROM admins WHERE username = ?`;
    db.get(checkUserQuery, [username], async(err, row) => {
        if (err) {
            return res.status(500).send("Error checking username: " + err.message);
        } else if (row) {
            return res.status(400).send("Username already exists.");
        }
        const checkEmailQuery = `SELECT * FROM admins WHERE email = ?`;
        db.get(checkEmailQuery, [email], async(err, row) => {
            if (err) {
                return res.status(500).send("Error checking email: " + err.message);
            } else if (row) {
                return res.status(400).send("Email already exists.");
            }

            // Hash password
            const bcrypt = require('bcryptjs');
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const insertQuery = `INSERT INTO admins (username,email, password) VALUES (?, ?,?)`;

            db.run(insertQuery, [username, email, hashedPassword], function(err) {
                if (err) {
                    return res.status(500).send("Error registering admin: " + err.message);
                }
                // Generate token
                const token = jwt.sign(
                    { 
                        id: this.lastID, 
                        username: username,
                        isAdmin: true 
                    }, 
                    JWT_SECRET, 
                    { expiresIn: '24h' }
                );

                // Set cookie
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000 // 24 hours
                });
                return res.status(201).json({
                    message: "Admin registered successfully.",
                    userID: this.lastID,
                    username: username,
                    isAdmin: true
                });
            });
        });
    });
});

// Admin Login Route
server.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ 
                error: "Missing required fields" 
            });
        }

        const query = `SELECT * FROM admins WHERE username = ?`;
        
        db.get(query, [username], async (err, admin) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    error: "Error retrieving admin account" 
                });
            }
            
            if (!admin) {
                return res.status(404).json({ 
                    error: "Admin not found" 
                });
            }

            const passwordMatch = await bcrypt.compare(password, admin.password);
            
            if (!passwordMatch) {
                return res.status(401).json({ 
                    error: "Invalid password" 
                });
            }

            const token = jwt.sign(
                { 
                    id: admin.adminID,
                    username: admin.username,
                    isAdmin: true 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.cookie('token', token, cookieOptions);

            return res.status(200).json({
                message: "Admin login successful",
                username: admin.username,
                isAdmin: true
            });
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({ 
            error: "An error occurred during admin login" 
        });
    }
});

// Admin Logout Route
server.post('/admin/logout', verifyAdminToken, (req, res) => {
    try {
        res.clearCookie('token', cookieOptions);
        return res.status(200).json({ 
            message: "Admin logout successful" 
        });
    } catch (error) {
        console.error('Admin logout error:', error);
        return res.status(500).json({ 
            error: "An error occurred during admin logout" 
        });
    }
});

//User Register
server.post('/user/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validation of Inputs
    if (!username || !email || !password) {
        return res.status(400).json({
            error: "Username, email, and password are required."
        });
    }

    try {
        // First check if user already exists
        const checkQuery = `SELECT username, email FROM users WHERE username = ? OR email = ?`;
        const existingUser = await new Promise((resolve, reject) => {
            db.get(checkQuery, [username, email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({
                    error: "Username already exists"
                });
            }
            if (existingUser.email === email) {
                return res.status(400).json({
                    error: "Email already exists"
                });
            }
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into the database
        const insertQuery = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        const result = await new Promise((resolve, reject) => {
            db.run(insertQuery, [username, email, hashedPassword], function(err) {
                if (err) reject(err);
                resolve(this);
            });
        });

        // Generate token
        const token = jwt.sign({ 
            id: result.lastID, 
            username 
        }, JWT_SECRET, {
            expiresIn: '24h'
        });

        // Set cookie
        res.cookie('token', token, cookieOptions);
        
        return res.status(200).json({
            message: "Registration successful",
            username: username
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            error: "An error occurred during registration"
        });
    }
});

// User Login Route
server.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ 
                error: "Missing required fields: username and password" 
            });
        }

        const query = `SELECT * FROM users WHERE username = ?`;
        
        db.get(query, [username], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    error: "Error retrieving user account" 
                });
            }
            
            if (!user) {
                return res.status(404).json({ 
                    error: "User account not found" 
                });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (!passwordMatch) {
                return res.status(401).json({ 
                    error: "Invalid password" 
                });
            }

            const token = jwt.sign(
                { 
                    id: user.userID,
                    username: user.username,
                    isAdmin: false 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.cookie('token', token, cookieOptions);

            return res.status(200).json({
                message: "Login successful",
                username: user.username,
                isAdmin: false
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            error: "An error occurred during login" 
        });
    }
});

//Login
server.post('/user/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ 
                error: "Missing required fields: username and password" 
            });
        }

        const query = `SELECT * FROM users WHERE username = ?`;
        
        db.get(query, [username], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    error: "Error retrieving user account" 
                });
            }
            
            if (!user) {
                return res.status(404).json({ 
                    error: "User not found" 
                });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (!passwordMatch) {
                return res.status(401).json({ 
                    error: "Invalid password" 
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.userID,
                    username: user.username,
                    isAdmin: false 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set cookie
            res.cookie('token', token, cookieOptions);

            return res.status(200).json({
                message: "Login successful",
                username: user.username,
                isAdmin: false
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            error: "An error occurred during login" 
        });
    }
});

server.get('/users', authenticateToken, (req, res) => {
    const getusersquery = 'SELECT * FROM users'; // Make sure you reference 'users' table correctly
    db.all(getusersquery, [], (err, rows) => {
        if (err) {
            return res.status(500).send(`Error during presentation: ${ err.message }`);
        }
        if (rows.length == 0) {
            return res.send("No users found");
        } else {
            return res.status(200).json(rows);
        }
    });
});

// Add Products
server.post('/products/add', authenticateToken, (req, res) => {
    const productName = req.body.productName;
    const price = parseFloat(req.body.price);
    const category = req.body.category;
    const description = req.body.description;
    const stockQuantity = parseInt(req.body.stockQuantity, 10);
    // Validate input fields
    if (!productName || !price || !category || !stockQuantity) {
        return res.status(400).send("Product Name, Price, Category, and Stock Quantity are required.");
    }
    const insertQuery = `INSERT INTO PRODUCTS (productName, price, category, productDescription, stockQuantity) VALUES (?, ?, ?, ?, ?)`;
    db.run(insertQuery, [productName, price, category, description, stockQuantity], (err) => {
        if (err) {
            return res.status(500).send("Error adding product: " + err.message);
        }
        return res.status(200).send("Product added successfully.");
    });
});

// List All Products
server.get('/products', (req, res) => {
    const query = 'SELECT * FROM PRODUCTS';
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).send("Error retrieving products: " + err.message);
        }
        return res.json(rows);
    });
});

// Search for a Product by ID
server.get('/products/search/:id', (req, res) => {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
        return res.status(400).send("Invalid product ID.");
    }
    const query = 'SELECT * FROM PRODUCTS WHERE ProductID = ?';
    db.get(query, [productId], (err, row) => {
        if (err) {
            return res.status(500).send("Error retrieving product: " + err.message);
        }
        if (!row) {
            return res.status(404).send("Product not found.");
        }
        return res.json(row);
    });
});

// Search for Products
server.get('/products/search', authenticateToken, (req, res) => {
    const { productName, category, quantity } = req.query;
    let query = `SELECT * FROM PRODUCTS WHERE 1=1`;
    if (productName) {
        query += ` AND productName LIKE ?`;
    }
    if (category) {
        query += ` AND category = ?`;
    }
    if (quantity) {
        query += ` AND stockQuantity >= ?`;
    }
    const params = [];
    if (productName) {
        params.push(`%${productName}%`);
    }
    if (category) {
        params.push(category);
    }
    if (quantity) {
        params.push(parseInt(quantity, 10));
    }
    db.all(query, params, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error searching for products: " + err.message);
        } else {
            return res.status(200).json(rows);
        }
    });
});

//create orders
server.put('/products/buyNow', authenticateToken, (req, res) => {
    const { productId, userId, quantity } = req.body;
    if (!productId || !userId || !quantity) {
        return res.status(400).send("Product ID, User ID, and Quantity are required.");
    }
    const query = `SELECT * FROM PRODUCTS WHERE productID = ?`;
    db.get(query, [productId], (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error retrieving product: " + err.message);
        }
        if (!row) {
            return res.status(404).send(`Product with ID ${productId} not found.`);
        }
        if (row.stockQuantity < quantity) {
            return res.status(400).send("Insufficient stock available.");
        }
        const updatedQuantity = row.stockQuantity - quantity;
        const totalAmount = row.price * quantity; // Assuming `price` is a column in `PRODUCTS`
        // Insert the order into the `orders` table
        const insertQuery = `INSERT INTO orders (userID, productID, productsQuantity, totalAmount, paymentStatus) VALUES (?, ?, ?, ?, ?)`;
        db.run(insertQuery, [userId, productId, quantity, totalAmount, 0], (err) => { // Assuming 0 is for "pending" payment status
            if (err) {
                console.log(err);
                return res.status(500).send("Error recording order: " + err.message);
            }
            // Update the stock in the `PRODUCTS` table
            const updateQuery = `UPDATE PRODUCTS SET stockQuantity = ? WHERE productID = ?`;
            db.run(updateQuery, [updatedQuantity, productId], (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("Error updating product stock: " + err.message);
                }
                return res.status(200).send("Product purchased successfully.");
            });
        });
    });
});

// Add a Review for a Product
server.post('/reviews/add', authenticateToken, (req, res) => {
    const { userID, productID, comment, rating } = req.body;
    if (!userID || !productID || !comment || !rating) {
        return res.status(400).send("Missing required fields.");
    }
    const query = `INSERT INTO reviews (userID, productID, comment, rating) 
                   VALUES (?, ?, ?, ?)`;
    db.run(query, [userID, productID, comment, rating], function(err) {
        if (err) {
            return res.status(500).send("Error adding review: " + err.message);
        }
        return res.status(201).json({
            message: "Review added successfully.",
            review: {
                reviewID: this.lastID,
                userID: userID,
                productID: productID,
                comment: comment,
                rating: rating
            }
        });
    });
});

// View All Reviews for a Product
server.get('/reviews/product/:productID', authenticateToken, (req, res) => {
    const productID = parseInt(req.params.productID, 10);
    if (isNaN(productID)) {
        return res.status(400).send("Invalid product ID.");
    }
    const query = `SELECT * FROM reviews WHERE productID = ?`;

    db.all(query, [productID], (err, rows) => {
        if (err) {
            return res.status(500).send("Error retrieving reviews: " + err.message);
        } else if (rows.length === 0) {
            return res.status(404).send(`No reviews found for product with ID ${productID}.`);
        }
        return res.status(200).json({ reviews: rows });
    });
});

// View All Reviews by a User
server.get('/reviews/user/:userID', authenticateToken, (req, res) => {
    const userID = parseInt(req.params.userID, 10);
    if (isNaN(userID)) {
        return res.status(400).send("Invalid user ID.");
    }
    const query = `SELECT * FROM reviews WHERE userID = ?`;
    db.all(query, [userID], (err, rows) => {
        if (err) {
            return res.status(500).send("Error retrieving reviews: " + err.message);
        } else if (rows.length === 0) {
            return res.status(404).send(`No reviews found for user with ID ${userID}.`);
        }
        return res.status(200).json({ reviews: rows });
    });
});

// Update a Review
server.put('/reviews/update/:reviewID', authenticateToken, (req, res) => {
    const { comment, rating } = req.body;
    const reviewID = parseInt(req.params.reviewID, 10);

    if (isNaN(reviewID) || !comment || !rating) {
        return res.status(400).send("Missing required fields.");
    }
    const query = `UPDATE reviews SET comment = ?, rating = ? WHERE reviewID = ?`;
    db.run(query, [comment, rating, reviewID], function(err) {
        if (err) {
            return res.status(500).send("Error updating review: " + err.message);
        } else if (this.changes === 0) {
            return res.status(404).send("Review not found.");
        }
        return res.status(200).json({
            message: "Review updated successfully.",
            review: {
                reviewID: reviewID,
                comment: comment,
                rating: rating
            }
        });
    });
});

// Delete a Review
server.delete('/reviews/delete/:reviewID', authenticateToken, (req, res) => {
    const reviewID = parseInt(req.params.reviewID, 10);
    if (isNaN(reviewID)) {
        return res.status(400).send("Invalid review ID.");
    }
    const query = `DELETE FROM reviews WHERE reviewID = ?`;
    db.run(query, [reviewID], function(err) {
        if (err) {
            return res.status(500).send("Error deleting review: " + err.message);
        } else if (this.changes === 0) {
            return res.status(404).send("Review not found.");
        }
        return res.status(200).json({
            message: "Review deleted successfully."
        });
    });
});

// Admin Product Routes
server.post('/admin/products/add', verifyAdminToken, upload.array('images', 5), async (req, res) => {
    try {
        const { ProductName, productDescription, price, category, stockQuantity } = req.body;

        // Validate required fields
        if (!ProductName || !productDescription || !price || !category || !stockQuantity) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Get uploaded file paths
        const imagePaths = req.files ? req.files.map(file => file.path) : [];

        const query = `
            INSERT INTO products (
                ProductName, 
                productDescription, 
                price, 
                category, 
                stockQuantity, 
                images
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(
            query,
            [ProductName, productDescription, price, category, stockQuantity, JSON.stringify(imagePaths)],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: "Error adding product to database" });
                }

                res.status(201).json({
                    message: "Product added successfully",
                    productId: this.lastID
                });
            }
        );
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: "Failed to add product" });
    }
});

// Get all products (admin)
server.get('/admin/products', verifyAdminToken, (req, res) => {
    const query = 'SELECT * FROM products';
    
    db.all(query, [], (err, products) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Error retrieving products" });
        }
        
        // Parse images JSON string for each product
        const processedProducts = products.map(product => ({
            ...product,
            images: JSON.parse(product.images || '[]')
        }));
        
        res.json(processedProducts);
    });
});

// Delete product (admin)
server.delete('/admin/products/:id', verifyAdminToken, (req, res) => {
    const productId = req.params.id;
    
    const query = 'DELETE FROM products WHERE productID = ?';
    
    db.run(query, [productId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Error deleting product" });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.json({ message: "Product deleted successfully" });
    });
});

// Update product (admin)
server.put('/admin/products/:id', verifyAdminToken, upload.array('images', 5), (req, res) => {
    const productId = req.params.id;
    const { ProductName, productDescription, price, category, stockQuantity } = req.body;
    
    // Get new image paths if files were uploaded
    const newImagePaths = req.files ? req.files.map(file => file.path) : [];
    
    // First get the existing product to merge images
    const getQuery = 'SELECT images FROM products WHERE productID = ?';
    
    db.get(getQuery, [productId], (err, product) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Error retrieving product" });
        }
        
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        // Merge existing and new images
        const existingImages = JSON.parse(product.images || '[]');
        const updatedImages = [...existingImages, ...newImagePaths];
        
        const updateQuery = `
            UPDATE products 
            SET ProductName = ?,
                productDescription = ?,
                price = ?,
                category = ?,
                stockQuantity = ?,
                images = ?
            WHERE productID = ?
        `;
        
        db.run(
            updateQuery,
            [ProductName, productDescription, price, category, stockQuantity, JSON.stringify(updatedImages), productId],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: "Error updating product" });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ error: "Product not found" });
                }
                
                res.json({ message: "Product updated successfully" });
            }
        );
    });
});

// Update product code
server.put('/admin/products/:productId/code', verifyAdminToken, async (req, res) => {
    const { productId } = req.params;
    const { newCode } = req.body;

    if (!productId || !newCode) {
        return res.status(400).json({ error: "Product ID and new code are required" });
    }

    try {
        const updateQuery = `UPDATE products SET ProductCode = ? WHERE ProductID = ?`;
        db.run(updateQuery, [newCode, productId], function(err) {
            if (err) {
                console.error('Error updating product code:', err);
                return res.status(500).json({ error: "Failed to update product code" });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.json({ message: "Product code updated successfully" });
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get product by code
server.get('/products/code/:code', async (req, res) => {
    const { code } = req.params;
    
    try {
        const query = `SELECT * FROM products WHERE ProductCode = ?`;
        db.get(query, [code], (err, product) => {
            if (err) {
                console.error('Error fetching product:', err);
                return res.status(500).json({ error: "Failed to fetch product" });
            }
            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.json(product);
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get all users (admin)
server.get('/admin/users', verifyAdminToken, (req, res) => {
    // First check if the users table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", [], (err, table) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Error checking users table" });
        }
        
        if (!table) {
            console.error('Users table does not exist');
            return res.status(500).json({ error: "Users table not found" });
        }
        
        // Get table info
        db.all("PRAGMA table_info(users)", [], (err, columns) => {
            if (err) {
                console.error('Error getting table info:', err);
                return res.status(500).json({ error: "Error getting table structure" });
            }
            
            console.log('Users table columns:', columns);
            
            // Now fetch the users
            const query = `
                SELECT userID, username, email, createdAt, lastLogin, isActive 
                FROM users 
                WHERE isAdmin = 0
                ORDER BY userID DESC
            `;
            
            db.all(query, [], (err, users) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: "Error retrieving users" });
                }
                
                console.log('Found users:', users);
                res.json(users || []);
            });
        });
    });
});

// Update user credentials
server.put('/admin/users/:userId', verifyAdminToken, async (req, res) => {
    const userId = req.params.userId;
    const { username, email, password } = req.body;
    
    try {
        // Start with base query
        let updateQuery = 'UPDATE users SET';
        const updateValues = [];
        const updateFields = [];

        // Add fields that are present in the request
        if (username) {
            updateFields.push(' username = ?');
            updateValues.push(username);
        }
        if (email) {
            updateFields.push(' email = ?');
            updateValues.push(email);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push(' password = ?');
            updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        // Complete the query
        updateQuery += updateFields.join(',') + ' WHERE userID = ?';
        updateValues.push(userId);

        // Execute the update
        db.run(updateQuery, updateValues, function(err) {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({ error: "Failed to update user" });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json({ message: "User updated successfully" });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete user (admin)
server.delete('/admin/users/:userId', verifyAdminToken, (req, res) => {
    const userId = req.params.userId;
    
    const query = 'DELETE FROM users WHERE userID = ? AND isAdmin = 0';
    
    db.run(query, [userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Error deleting user" });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: "User not found or cannot delete admin" });
        }
        
        res.json({ message: "User deleted successfully" });
    });
});

// Logout Route (works for both users and admins)
server.post('/logout', (req, res) => {
    try {
        res.clearCookie('token', {
            ...cookieOptions,
            maxAge: 0
        });

        return res.status(200).json({
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            error: "An error occurred during logout"
        });
    }
});

// Auth verification route
server.get('/auth/verify', (req, res) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ 
            error: "Authentication required" 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
            username: decoded.username,
            isAdmin: decoded.isAdmin
        });
    } catch (error) {
        res.clearCookie('token', cookieOptions);
        return res.status(403).json({ 
            error: "Invalid or expired token" 
        });
    }
});

server.listen(port, () => {
    console.log(`Server is listening at port ${ port }`)
});