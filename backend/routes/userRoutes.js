const express= require('express');
const router = express.Router();
const userModel=require('../models/User');
const postModel=require('../models/Post');
const {body}= require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const {toggleFollowUser }=require('../controllers/user.controller');
router.post('/register', [
  // Validation rules
  body('firstName').notEmpty().withMessage('First   name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], userController.registerUser);

router.post('/login', [
  // Validation rules
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], userController.loginUser);


router.get('/profile',authMiddleware, userController.getUserProfile)

router.get('/logout', authMiddleware, userController.logoutUser);

router.get('/search', authMiddleware, userController.searchUsers);
router.get('/me',authMiddleware,async(req,res)=>{
 try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await userModel.findById(req.user._id).select('username following');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
})
router.get('/:id', authMiddleware, async (req, res) => {
  const user = await userModel.findById(req.params.id).select('username name followers following');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});
router.post('/follow/:id', authMiddleware, toggleFollowUser ); // Use :username for clarity

router.put('/update',authMiddleware,userController.updateUser)

router.delete('/delete', authMiddleware, async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.user._id);
    // Optionally, delete user's posts and comments as well
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get followers
router.get('/followers/:userId', authMiddleware, async (req, res) => {
  const user = await userModel.findById(req.params.userId).populate('followers', 'username');
  // Optionally, mark if current user is following each
  const currentUser = await userModel.findById(req.user._id);
  const list = user.followers.map(u => ({
    _id: u._id,
    username: u.username,
    isFollowing: currentUser.following.includes(u._id)
  }));
  res.json(list);
});

// Get following
router.get('/following/:userId', authMiddleware, async (req, res) => {
  const user = await userModel.findById(req.params.userId).populate('following', 'username');
  const currentUser = await userModel.findById(req.user._id);
  const list = user.following.map(u => ({
    _id: u._id,
    username: u.username,
    isFollowing: currentUser.following.includes(u._id)
  }));
  res.json(list);
});
router.post('/forgot-password', userController.forgotPassword);

module.exports = router;