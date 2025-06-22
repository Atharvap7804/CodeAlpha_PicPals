const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  profileImage:{
    type: String,
    default: '/uploads/defaultimg.jpg'
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default:[]
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default:[]
  }],
  comments:[{
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  text: String,
  createdAt: { type: Date, default: Date.now }
  }],
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false, // Do not return password in queries
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.generateAuthToken = function() {
  // Add username and email to the payload for easier debugging and future use
  const token = jwt.sign(
    { _id: this._id, username: this.username, email: this.email },
    process.env.JWT_SECRET
  );
  return token;
}

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}

userSchema.statics.hashPassword = async function(password) {
  return await bcrypt.hash(password, 10);
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;