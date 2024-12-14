const db_access = require('./db.js');
const db = db_access.db;

// Add imagePaths column to Products table
db.run(`ALTER TABLE Products ADD COLUMN imagePaths TEXT;`, (err) => {
    if (err) {
        // Column might already exist
        console.log('Column might already exist:', err.message);
    } else {
        console.log('Successfully added imagePaths column');
    }
    process.exit(0);
});
