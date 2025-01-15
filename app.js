const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const Product= require('./models/product')
const User= require('./models/user')
const bcrypt= require('bcrypt');
const app = express();
const moment = require('moment'); 


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
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: false, 
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, 
      secure: false,
    },
  })
);


app.get('/', async (req, res) => {
  try {
    // Fetch all products
    const products = await Product.find(); 
    
    // Fetch trending products (limit 5)
    const trendingProducts = await Product.find({ isTrending: true })
      .sort({ createdAt: -1 })  // Sort by creation date, descending
      .limit(3);

    // Calculate the date 5 days ago
    const fiveDaysAgo = moment().subtract(5, 'days').toDate();

    // Fetch latest products added in the last 5 days (limit 5)
    const latestProducts = await Product.find({ createdAt: { $gte: fiveDaysAgo } })
      .sort({ createdAt: -1 })  // Sort by creation date, descending
      .limit(3);

    res.render('home', {
      products,
      trendingProducts,
      latestProducts
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    let products;

    if (category) {
      // Fetch products by category
      products = await Product.find({ category });
    } else {
      // Fetch all products if no category is provided
      products = await Product.find();
    }

    res.render('allProducts', { products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  }
});

app.get('/products/add', (req, res) => {
  res.render('addProduct'); 
});
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
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect(req.session.user.role === 'seller' ? '/seller' : '/buyer');
  }
  res.render('login');
});

app.get("/register", (req,res)=>{
  res.render("register")
})
app.post('/register', async (req, res) => {
  const { name, email, password, contact, role } = req.body;

  if (!name || !email || !password || !contact) {
    return res.render('register', { error: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'User already exists' });
    }

    console.log('Plain password being saved:', password); // Debug here to confirm

    const user = new User({
      name,
      email,
      password, // Saving plain password
      contact,
      role: role || 'buyer',
    });
    await user.save();

    console.log('User saved:', user);

    res.render('login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.render('register', { error: 'An error occurred, please try again' });
  }
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', { error: 'Please fill in all fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }


    if (user.password !== password) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
    };

    console.log('Session after login:', req.session);

    if (user.role === 'seller') {
      return res.redirect('/seller');
    } else if (user.role === 'buyer') {
      return res.redirect('/buyer');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.render('login', { error: 'An error occurred. Please try again.' });
  }
});

const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {  
    return res.redirect('/');
  }
  next();
};
app.get('/seller', async (req, res) => {
  console.log('Session in /seller route:', req.session.user);  // Verify session data
  if (req.session.user && req.session.user.role === 'seller') {
    try {
      // Fetch all products
      const products = await Product.find();  // Modify this query as needed to fetch seller-specific products
      res.render('sellerPage', {
        user: req.session.user, // Send user data
        products: products,     // Send all products
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).send('Error loading products');
    }
  } else {
    res.redirect('/login');  // If no session or wrong role, redirect to login
  }
});
app.get('/buyer', async (req, res) => {
  console.log('Session in /buyer route:', req.session.user);  // Verify session data
  if (req.session.user && req.session.user.role === 'buyer') {
    try {
      // Fetch all products
      const products = await Product.find();

      // Calculate the date 5 days ago
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);  // Subtract 5 days

      // Fetch latest products added in the last 5 days (limit 5)
      const latestProducts = await Product.find({ createdAt: { $gte: fiveDaysAgo } })
        .sort({ createdAt: -1 })  // Sort by creation date, descending
        .limit(5);

      // Fetch trending products
      const trendingProducts = await Product.find({ isTrending: true })
        .sort({ createdAt: -1 })  // You can change this sorting to prioritize trending logic
        .limit(5);

      res.render('buyerPage', {
        user: req.session.user,  // Send user data
        products: products,      // Send all products
        latestProducts: latestProducts,  // Send the latest products
        trendingProducts: trendingProducts  // Send trending products
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).send('Error loading products');
    }
  } else {
    res.redirect('/login');  // If no session or wrong role, redirect to login
  }
});
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/buyer'); // or wherever the user was
    }
    res.redirect('/login'); // Redirect to login page after logout
  });
});
app.post('/cart/add', async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const user = await User.findById(req.session.user.id);  
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const cart = user.cart || [];
    const existingProductIndex = cart.findIndex(item => item.productId && item.productId.toString() === productId);

    if (existingProductIndex >= 0) {
      cart[existingProductIndex].quantity += parseInt(quantity, 10);
    } else {
      cart.push({ productId, quantity: parseInt(quantity, 10) });
    }
    user.cart = cart;
    await user.save();  

    res.redirect('/buyer');  
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ error: 'You need to login first' });
  }
});
app.get('/cart', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');  // Ensure user is logged in
  }

  try {
    const user = await User.findById(req.session.user.id).populate('cart.productId'); // Populate cart with product details
    const cart = user.cart;

    res.render('cart', { cart });  // Render cart page with cart details
  } catch (error) {
    console.error('Error loading cart:', error);
    res.status(500).send('Error loading cart');
  }
});
app.post('/cart/remove', async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    // Get the user from the session (fetch full user document)
    const user = await User.findById(req.session.user.id);  // Fetch the full user document
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Find the product in the cart and remove it
    const cart = user.cart || [];
    const existingProductIndex = cart.findIndex(item => item.productId && item.productId.toString() === productId);

    if (existingProductIndex === -1) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    // Remove the product from the cart
    cart.splice(existingProductIndex, 1); // Remove the product at the found index

    // Save updated user cart
    user.cart = cart;
    await user.save();  // Now that 'user' is a Mongoose document, this should work

    res.redirect('/cart');  // Redirect to cart page after removal
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ error: 'An error occurred while removing from cart' });
  }
});
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, contact, role } = req.body;

    if (!name || !email || !password || !contact) {
      return res.render('register', { error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      contact,
      role: role || 'buyer',
    });
    await user.save();

    res.render('login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.render('register', { error: 'An error occurred, please try again' });
  }
});
app.get('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.render('product-detail', { product });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.use((req, res) => {
  res.status(404).send('Page Not Found');
});
const PORT = 7000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
