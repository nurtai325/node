const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mydatabase.db');


db.all("insert into messages (message, time, chat_id) VALUES ('Hey', '12:00', 1);", [], (err, rows) => { 
    if(err) { 
        throw err; 
    } 
    console.log(rows);
    
});