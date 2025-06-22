const express= require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const userModel=require('../models/User');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // make sure 'uploads/' folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

const {createPost,getAllPosts,addComment,toggleLike,getFeedPosts,updatePost,deletePost}= require('../controllers/post.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/create', authMiddleware,upload.single('media'), createPost); // Protect post creation too
router.get('/all',authMiddleware, getAllPosts)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  const posts = await Post.find({ author: req.params.userId }).populate('author', 'username');
  res.json(posts);
});

router.get('/feed',authMiddleware,async(req,res)=>{
  try{
     console.log('req.user:', req.user); // Debug
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user=await userModel.findById(req.user._id);
    if(!user) return res.status(404).json({message:'User not found'});

    const posts=await Post.find({author:{$in:user.following}}).populate('author','username').sort({createdAt:-1});

    res.json(posts);
  }catch(err){
    console.error("Feed error",err);
    res.status(500).json({message:'Server error'});
  }
})

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author comments.user');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/comment/:postId', authMiddleware, addComment);
router.delete('/comment/:postId/:commentId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Only allow comment owner or post owner to delete
    if (
      comment.user.toString() !== req.user._id &&
      post.author.toString() !== req.user._id
    ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    comment.remove();
    await post.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/like/:postId', authMiddleware, toggleLike)
; // Use :postId for consistency

router.put('/update/:postId', authMiddleware, updatePost);
router.delete('/delete/:postId', authMiddleware, deletePost);




module.exports = router;