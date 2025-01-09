// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: 'secret-key',  // You can change the secret key
  resave: false,
  saveUninitialized: true,
}));

app.get('/', (req, res) => {
  res.render('home');
});

app.listen(7000, () => {
  console.log(`Server running`);
});