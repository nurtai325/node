const { transporter } = require('./lib/email');
const { generateRandomSixDigitNumber } = require('./lib/random');

const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
const port = 8000;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mydatabase.db');

const users = [];

const insert = "";
const get = "SELECT email FROM users where";
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`;

db.all("SELECT * FROM users" , [], (err, rows) => {
  if(err) {
    throw err;
  }
  console.log(rows)
})

app.listen(port, () => {
  console.log(`Listening at localhost:${port}`);
});

app.post('/api/login', function(req, res) {

  const {email, password} = req.body;
  const log = true;
  const rows = [];
  db.all(`SELECT email, password FROM users WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error('Error checking email:', err);
    } else if (row.length === 0) {
      console.log('not found');
      log = false;
    } else {
      rows.push(row[0]);
      
    }
    if(log) {
      if(rows[0].password === password) {
        res.status(200).json({'log': true});
        console.log('logined')
      } else {
        res.status(200).json({'log': false});
      }
    } else {
    res.status(200).json({'log': false});
    
  }
  });
  
}); 

app.post('/api/register', function(req, res) {

  const {email} = req.body;
  db.all(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
    if(err) {
      throw new Error('Database error: ' + err.message);
    } else if(row.length === 0) {
      const code = generateRandomSixDigitNumber();
      const mailOptions = {
        from: 'mrello@bk.ru', // sender address
        to: email, // list of receivers
        subject: 'Confirmation code', // Subject line
        text: `${code}` // Text content
      };
    
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(200).json({'log': false});
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      const count = users.length;
      users.push(code);
      res.status(200).json({'log': true, 'user': count});
    } else {
      return res.status(200).json({'log': false});
    }
  }
  );
  
}); 

app.post('/api/confirm', function(req, res) {

  const {email, password, code, user} = req.body;
  console.log(req.body)
  console.log(code, users[user]);
  if(code == users[user]) {
    console.log(users[user])
    db.all(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, password], function(err) {
      if (err) {
        console.error('Error inserting user:', err);
      } else {
        res.status(200).json({'log': true});
        console.log('inserted');
      }
    });
  } else {
    console.log(false)
    res.status(200).json({'log': false});
  }
  
}); 

