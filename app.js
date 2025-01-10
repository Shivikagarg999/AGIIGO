const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const Product= require('./models/product')

const app = express();

mongoose
  .connect('mongodb+srv://agiigo:agiigo123@cluster0.qyodo.mongodb.net/', 
  { connectTimeoutMS: 10000, 
    socketTimeoutMS: 45000})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'secret-key', 
    resave: false,
    saveUninitialized: true,
  })
);
app.get('/', async (req, res) => {
  try {
    const products = await Product.find(); 
    // const trendingProducts = await Product.find({ isTrending: true }) 
    // .sort({ createdAt: -1 }) 
    // .limit(5); 
    res.render('home', { products});
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find(); 
    res.render('allProducts', { products });
    console.log(products);
  } catch (error) {
    console.error('Error loading products:', error);
    res.status(500).send('Error loading products');
  }
});
app.get('/products/add', (req, res) => {
  res.render('addProduct'); 
});
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
  }
  res.redirect('/login');
}    
app.post('/products/add', async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      image,
    });
    await newProduct.save(); 
    res.redirect('/'); 
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).send('Error adding product');
  }
});

app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Start Server
const PORT = 7000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
