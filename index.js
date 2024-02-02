const express = require('express');
const app = express();
const port = 8000;

app.get('/code', (req, res) => {
  res.send('3000');
  console.log('sent');
});

app.listen(port, () => {
  console.log(`Example app listening at http://127.0.0.1:${port}`);
});
