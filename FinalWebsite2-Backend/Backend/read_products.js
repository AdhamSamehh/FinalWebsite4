const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('FinalDatabase.db');

db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
        console.error("Error reading products:", err);
    } else {
        console.log("Current products in database:");
        console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
});
