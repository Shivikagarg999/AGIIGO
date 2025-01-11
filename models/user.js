
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    address: String,
    state: String,
    country: String,
    pincode: Number
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); 
    this.password = await bcrypt.hash(this.password, 10);  
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);  
};

const User = mongoose.model('User', userSchema);

module.exports = User;
