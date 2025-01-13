
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email: {
        type: String,
        required: true,
        unique: true,  
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6 
    },
    role: {
        type: String,
        enum: ['buyer', 'seller'],  
        default: 'buyer'  
    },
    contact:{
        type:String,
        required: true,
    },
    cart: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 }
      }],
    address: String,
    state: String,
    country: String,
    pincode: Number
});


const User = mongoose.model('User', userSchema);

module.exports = User;
