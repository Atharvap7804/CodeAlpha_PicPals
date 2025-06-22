const dotenv = require('dotenv');
dotenv.config();
const express= require('express');
const path = require('path');
const cors= require('cors');
const connectDB= require('./db/db');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
connectDB(); // Connect to MongoDB

const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser()); // Parse cookies
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
       'http://localhost:4000',
      'http://localhost:5500'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  // Check if user is logged in (e.g., by checking a cookie or session)
  if (req.cookies && req.cookies.token) {
    // Optionally, verify the token here
    res.redirect('/profile.html');
  } else {
    res.redirect('/login.html');
  }
});
app.use(express.static(path.join(__dirname, '../frontend'))); // Parse URL-encoded bodies


app.use('/users', userRoutes); // User routes
app.use('/posts', postRoutes); // Post routes
app.use('/uploads', express.static('uploads'));

module.exports= app;