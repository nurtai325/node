// helper functions
const { transporter } = require('./lib/email');
const { generateRandomSixDigitNumber } = require('./lib/random');

// express initialization
const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
const port = 8000;

//database initialization
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mydatabase.db');

// real-time logic
const { Server } = require("socket.io");
const io = new Server(app);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('message', function (message) {
		// Отсылаем сообщение остальным участникам чата
		socket.broadcast.emit('sendReceived', message);
    console.log('socket', message);
	});
});

// starting the server
app.listen(port, () => {
  console.log(`Listening at localhost:${port}`);
});

db.all("SELECT * FROM users" , [], (err, rows) => {
  if(err) {
    throw err;
  }
  console.log(rows)
})

// api endpoints
const users = [];
app.post('/api/login', function(req, res) {

  const {email, password} = req.body;
  let log = true;
  const rows = [];
  db.all(`SELECT email, password, username FROM users WHERE email = ?`, [email], (err, row) => {
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
        res.status(200).json({'log': true, 'username': rows[0].username});
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

  const {email, password, code, user, username} = req.body;
  console.log(req.body)
  console.log(code, users[user]);
  if(code == users[user]) {
    console.log(users[user])
    db.all(`INSERT INTO users (email, password, username) VALUES (?, ?, ?)`, [email, password, username], function(err) {
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

app.post('/api/chats', async function (req, res) {
  const {username} = req.body;
  const chats = await new Promise((resolve, reject) => {
    db.all(`SELECT chat_id, user1, user2 FROM chats WHERE user1 = '${username}' OR user2 = '${username}'`, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

  res.status(200).json({'chats': chats});
});

app.post('/api/messages', async function (req, res) {
  const {chat} = req.body;
  const some = parseInt(chat)
  const messages = await new Promise((resolve, reject) => {
    db.all(`SELECT * FROM messages WHERE chat_id = ${some}`, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  res.status(200).json({'messages': messages});
});

app.post('/api/send', async function (req, res) {
  const {message, time, chat_id, sender} = req.body;

  try {
    db.all(`INSERT INTO messages (message, time, chat_id, sender) VALUES(?, ?, ?, ?) `, [message, time, chat_id, sender], function (err) {
      if (err) {
        throw err;
      }
      console.log(req.body)
      res.status(200).json({'insert': true});
  
    } )
  }
  catch (err) {
    console.log(err);
  }
});

app.post('/api/create', async function (req, res) {
  const {username, user_name} = req.body;
  
  try {
    // Check if the combination of username and user_name already exists
    const existingRow = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM chats WHERE user1 = ? AND user2 = ?`, [username, user_name], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (existingRow) {
      // If a row with the same username and user_name exists, send a response indicating that insertion is not allowed
      res.status(400).json({'insert': false});
    } else {
      // If no such row exists, proceed with insertion
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO chats (user1, user2) VALUES (?, ?)`, [username, user_name], (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Inserted successfully');
            resolve();
          }
        });
      });
      res.status(200).json({'insert': true});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({'error': 'Internal Server Error'});
  }
});


app.post('/api/search', async function (req, res) {
  const {username} = req.body;

  db.all(`SELECT * FROM users`, [], function(err, rows) {
    if (err) {
      console.error('Error inserting user:', err);
    } else {
      res.status(200).json({'chats': rows});
    }
  });

});