const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mydatabase.db');

db.all("SELECT name, sql FROM sqlite_master WHERE type='table';", [], (err, rows) => { 
    if(err) { 
        throw err; 
    } 
    console.log(rows);
});
