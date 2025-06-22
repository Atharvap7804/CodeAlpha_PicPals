const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true }); 

const postSchema=new mongoose.Schema({
  author:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image:{
    type: String,
    required: false, // Optional field for image URL
    trim: true
  },
  video:{
    type: String,
    required: false, // Optional field for video URL
    trim: true
  },
  content:{
    type: String,
    required: false,
    trim: true
  },
  likes:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    createdAt: { type: Date, default: Date.now }
  }],
  comments: [commentSchema], // <-- Use the subdocument schema here
  createdAt: {
    type: Date,
    default: Date.now
  }

})

module.exports=mongoose.model('Post', postSchema);