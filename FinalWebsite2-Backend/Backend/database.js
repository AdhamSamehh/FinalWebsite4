const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, 'FinalDatabase.db'));

// Users table
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        userID INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        isAdmin BOOLEAN DEFAULT 0,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLogin DATETIME
    )
`;

// Admins table
const createAdminsTable = `
    CREATE TABLE IF NOT EXISTS admins (
        adminID INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

// Products table
const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
        ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
        ProductCode TEXT UNIQUE,
        ProductName TEXT NOT NULL,
        productDescription TEXT,
        price DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        stockQuantity INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

// Orders table
const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
        orderID INTEGER PRIMARY KEY AUTOINCREMENT,
        userID INTEGER NOT NULL,
        totalAmount DECIMAL(10,2) NOT NULL,
        orderStatus TEXT DEFAULT 'pending',
        paymentStatus TEXT DEFAULT 'unpaid',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users(userID)
    )
`;

// Order Items table
const createOrderItemsTable = `
    CREATE TABLE IF NOT EXISTS order_items (
        orderItemID INTEGER PRIMARY KEY AUTOINCREMENT,
        orderID INTEGER NOT NULL,
        ProductID INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (orderID) REFERENCES orders(orderID),
        FOREIGN KEY (ProductID) REFERENCES products(ProductID)
    )
`;

// Reviews table
const createReviewsTable = `
    CREATE TABLE IF NOT EXISTS reviews (
        reviewID INTEGER PRIMARY KEY AUTOINCREMENT,
        userID INTEGER NOT NULL,
        ProductID INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users(userID),
        FOREIGN KEY (ProductID) REFERENCES products(ProductID)
    )
`;

// Initialize all tables
const initializeTables = () => {
    db.serialize(() => {
        // Drop existing tables if they exist
        db.run("DROP TABLE IF EXISTS users", (err) => {
            if (err) console.error('Error dropping users table:', err);
            else console.log('Users table dropped if existed');
        });

        // Create tables
        db.run(createUsersTable, (err) => {
            if (err) console.error('Error creating users table:', err);
            else {
                console.log('Users table initialized');
                
                // Add a test user
                const testUser = {
                    username: 'testuser',
                    email: 'test@example.com',
                    password: '$2a$10$YourHashedPasswordHere',
                    isAdmin: 0,
                    isActive: 1
                };
                
                db.run(
                    'INSERT INTO users (username, email, password, isAdmin, isActive) VALUES (?, ?, ?, ?, ?)',
                    [testUser.username, testUser.email, testUser.password, testUser.isAdmin, testUser.isActive],
                    function(err) {
                        if (err) console.error('Error creating test user:', err);
                        else console.log('Test user created with ID:', this.lastID);
                    }
                );
            }
        });

        db.run(createAdminsTable, (err) => {
            if (err) console.error('Error creating admins table:', err);
            else console.log('Admins table initialized');
        });

        db.run(createProductsTable, (err) => {
            if (err) console.error('Error creating products table:', err);
            else console.log('Products table initialized');
        });

        db.run(createOrdersTable, (err) => {
            if (err) console.error('Error creating orders table:', err);
            else console.log('Orders table initialized');
        });

        db.run(createOrderItemsTable, (err) => {
            if (err) console.error('Error creating order items table:', err);
            else console.log('Order items table initialized');
        });

        db.run(createReviewsTable, (err) => {
            if (err) console.error('Error creating reviews table:', err);
            else console.log('Reviews table initialized');
        });
    });
};

// Export database and table creation functions
module.exports = {
    db,
    initializeTables,
};
