// models/Product.js
const mongoose = require('mongoose');

// Create a schema for the product
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },  // Optionally store image URL or file path
  createdAt: { type: Date, default: Date.now }
});

// Create a model from the schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
