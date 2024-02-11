const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mydatabase.db');


db.all("update users set password = '123456' where id = 2;", [], (err, rows) => { 
    if(err) { 
        throw err; 
    } 
    console.log(rows);
    
});