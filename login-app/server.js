const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('database.db');
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
)`);

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Handle signup
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.send('All fields are required.');

  const insert = `INSERT INTO users (username, password) VALUES (?, ?)`;
  db.run(insert, [username, password], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.send('Username already exists.');
      }
      return res.send('Error creating user.');
    }
    res.send(`<h2>Signup successful! <a href="/">Login here</a></h2>`);
  });
});

// Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
  db.get(query, [username, password], (err, row) => {
    if (err) return res.send('Database error.');
    if (row) {
      res.send(`<h2>Welcome, ${username}!</h2>`);
    } else {
      res.send(`<h2>Invalid username or password. <a href="/">Try again</a></h2>`);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
