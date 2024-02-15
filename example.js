const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mydatabase.db');


db.all("", [], (err, rows) => { 
    if(err) { 
        throw err; 
    } 
    console.log(rows);
    
});