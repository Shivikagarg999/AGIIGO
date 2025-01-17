
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
    city: String,
    country: String,
    pincode: Number,
    orders: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order', // Reference to the Order model
        },
      ]
});
userSchema.methods.getOrders = async function () {
    try {
      const orders = await mongoose.model('Order').find({ user: this._id });
      return orders;
    } catch (error) {
      throw new Error('Unable to fetch orders');
    }
  };

const User = mongoose.model('User', userSchema);

module.exports = User;
