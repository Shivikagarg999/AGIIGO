const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
// const Product= require('./models/product')

// Initialize Express App
const app = express();

// Connect to MongoDB
// mongoose
//   .connect('mongodb://localhost:27017/agiigo', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB Connected'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session Middleware
app.use(
  session({
    secret: 'secret-key', // Change to a secure secret for production
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
// Home Page
app.get('/', async (req, res) => {
  try {
    // const products = await Product.find(); 
    res.render('home');
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Product Management
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('products', { products });
    
console.log(products)
  } catch (error) {
    res.status(500).send('Error loading products');
  }
});

// Error Handling
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});
// Start Server
const PORT = 7000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
