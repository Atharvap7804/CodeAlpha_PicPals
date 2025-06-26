const userModel = require('../models/User');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blacklistToken = require('../models/blacklistToken.model');
const Post = require('../models/Post');
module.exports.registerUser = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, username, email, password } = req.body;

  const hashPassword = await userModel.hashPassword(password);

  const user = await userService.createUser({
    firstName,
    lastName,
    username,
    email,
    password: hashPassword
  });

  const token = user.generateAuthToken();
  res.status(201).json({
    message: 'User registered successfully',
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      password: user.password, // Note: Do not return password in production
    },
    token
  });
}

module.exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  const user = await userModel.findOne({ username }).select('+password');
  console.log('User found:', user);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }


  const isMatch = await user.comparePassword(password);
  console.log('Password match:', isMatch);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }


  const token = user.generateAuthToken();
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json({
    token,
    message: 'User logged in successfully',
    user
  })


}

module.exports.getUserProfile = async (req, res, next) => {
  const postCount = await Post.countDocuments({ author: req.user._id });
  res.status(200).json({
    message: 'User profile retrieved successfully',
    user: {
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      username: req.user.username,
      email: req.user.email,
      followers: req.user.followers ? req.user.followers.length : 0,
      following: req.user.following ? req.user.following.length : 0,
      postCount: postCount
    }
  });
}


module.exports.logoutUser = async (req, res, next) => {

  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Add the token to the blacklist
  await blacklistToken.create({ token });

  // Clear the cookie
  res.clearCookie('token');

  res.status(200).json({ message: 'User logged out successfully' });
}

module.exports.searchUsers = async (req, res, next) => {
  const query = req.query.q;
  console.log('Search query:', req.query.q);
  const currentUserId = req.user._id
  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }
  try {
    const users = await userModel.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user._id }
    }).select('username')
    const currentUser = await userModel.findById(currentUserId)
    console.log('Search results:', users);
    const response = users.map(user => {
      const isFollowing = currentUser.following.includes(user._id)
      return {
        _id: user._id,
        username: user.username,
        isFollowing: isFollowing
      }


    })
    res.json(response)
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports.toggleFollowUser = async (req, res) => {
  const currentUserId = req.user._id;
  const targetUserId = req.params.id;

  if (currentUserId.toString() === targetUserId.toString()) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  try {
    const currentUser = await userModel.findById(currentUserId);
    const targetUser = await userModel.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());

      await Promise.all([currentUser.save(), targetUser.save()]);
      return res.status(200).json({
        message: 'Unfollowed user successfully',
        user: targetUser,
        isFollowing: false
      });

    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      await Promise.all([currentUser.save(), targetUser.save()]);
      return res.status(200).json({
        message: 'Followed user successfully',
        user: targetUser,
        isFollowing: true
      });
    }

  } catch (error) {
    console.error('Error in toggleFollowUser:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const { username,firstName,lastName} = req.body
    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        username,firstName,lastName
      },
      { new: true })
      res.join(user)
  }catch(error){
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required.' });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }
    const hashedPassword = await userModel.hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};