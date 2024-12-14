BOLD E-commerce Platform
A modern, secure e-commerce web application built with React.js and Express.js. This platform offers comprehensive user authentication, product management, and secure transaction processing capabilities.

Features
Secure user authentication and authorization with JWT
Admin dashboard for comprehensive product management
Protected user sessions with secure cookie handling
Responsive, modern UI design for all devices
Role-based access control (Admin/User)
Product catalog with image support
User profile management
Secure password handling with bcrypt
Cross-Origin Resource Sharing (CORS) enabled
SQLite database for reliable data storage
Setup
Clone the repository
Install dependencies:
bash
CopyInsert
cd Frontend && npm install
cd ../Backend && npm install
Start the servers:
bash
CopyInsert
# Backend (port 5001)
npm start
# Frontend (port 3000)
cd ../Frontend && npm start
Requirements
Node.js v14 or higher
npm v6 or higher
SQLite3 database
Modern web browser with JavaScript enabled
Security Features
JWT-based authentication
Encrypted password storage
Secure session management
Protected API endpoints
Input validation and sanitization
XSS and CSRF protection
Development
Built using modern web development practices with a focus on security, scalability, and user experience. The application follows a modular architecture with separate frontend and backend services for improved maintainability and deployment flexibility.
