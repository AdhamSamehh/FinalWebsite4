const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('FinalDatabase.db');

const createUsertable = `
  CREATE TABLE IF NOT EXISTS users (
    userID INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL, 
    email TEXT UNIQUE NOT NULL, 
    password TEXT NOT NULL
    )`;

const createAdminstable = `
    CREATE TABLE IF NOT EXISTS admins (
        adminID INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL, 
        password TEXT NOT NULL
    );`



const createProductstable = `
   CREATE TABLE IF NOT EXISTS products (
    productID INTEGER PRIMARY KEY AUTOINCREMENT,
    ProductName TEXT NOT NULL, 
    productDescription TEXT UNIQUE, 
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    stockQuantity INTEGER NOT NULL
    )`

const createOrderstable = `
   CREATE TABLE IF NOT EXISTS orders (
    orderID INTEGER PRIMARY KEY AUTOINCREMENT,
    productsQuantity INTEGER NOT NULL,
    totalAmount INTEGER NOT NULL,
    paymentStatus INTEGER NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(userID),
    FOREIGN KEY (productID) REFERENCES products(productID)
);

    )`;

const createReviewstable = `
   CREATE TABLE IF NOT EXISTS reviews (
    reviewID INTEGER PRIMARY KEY AUTOINCREMENT,
    userID INTEGER NOT NULL,
    productID INTEGER NOT NULL,
    comment TEXT NOT NULL,
    rating INTEGER NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(userID),
    FOREIGN KEY (productID) REFERENCES products(productID)
);
 )`;



//To export all tables
module.exports = { db, createUsertable, createProductstable, createOrderstable, createReviewstable, createAdminstable }