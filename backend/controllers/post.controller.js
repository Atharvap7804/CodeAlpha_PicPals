const Post = require('../models/Post');
const User = require('../models/User');

module.exports.createPost = async (req, res) => {
 try {
    console.log("🔍 req.body:", req.body);
    console.log("🖼️ req.file:", req.file);
    console.log("👤 req.user:", req.user);

    const { caption } = req.body;
    const author = req.user?.username;

    if (!author || !caption) {
      return res.status(400).json({ message: 'Author and caption are required' });
    }

    let image = null, video = null;

    if (req.file) {
      const mimeType = req.file.mimetype;
      if (mimeType.startsWith("image/")) image = req.file.filename;
      else if (mimeType.startsWith("video/")) video = req.file.filename;
      else return res.status(400).json({ message: 'Unsupported file type' });
    }

    const user = await User.findOne({ username: author });
    if (!user) return res.status(404).json({ message: 'Author not found' });

    const newPost = new Post({
      author: user._id,
      image: image || null,
      video: video || null,
      content: caption || ''
    });

    await newPost.save();
    console.log("✅ Post saved:", newPost);

    return res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (err) {
    console.error("❌ Create Post Error:", err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

;

exports.getAllPosts = async (req, res) => {
  console.log('Fetching posts for user:', req.user);
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'username')
      .populate('likes', 'username')
      .populate('comments.user', 'username')
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
     
    res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.addComment = async (req, res) => {
  const postId = req.params.postId;
  // Debug log
  console.log('req.user:', req.user);
  const userId = req.user && (req.user._id?.toString() || req.user.id);
  const { text } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = {
      user: userId,
      text: text
    };

    post.comments.push(comment);
    const savedPost=await post.save()
    await savedPost.populate('comments.user', 'username');
    const lastComment=savedPost.comments[savedPost.comments.length - 1];

    console.log('Saved post:', savedPost);
console.log('Last comment:', lastComment);
    res.status(200).json({
      message: 'Comment added successfully',
      post:savedPost,
      comment: lastComment
    });
  } catch (error) {
    console.error('Error finding post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.toggleLike= async (req, res) => {
  const postId = req.params.postId; // Use postId for consistency with route
  const userId = req.user._id;

  try{
   const post=await Post.findById(postId);
   if(!post) {
     return res.status(404).json({ message: 'Post not found' });
   }
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      // User has already liked the post, so remove the like
      post.likes = post.likes.filter((id)=>id.toString() !== userId.toString());
      await post.save();
      return res.status(200).json({ message: 'Post unliked successfully', post });
    }
    // If not liked, add the like
    else{
    post.likes.push(userId);
    await post.save();
    return res.status(200).json({ message: 'Post liked successfully', post });}
  } catch(error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getFeedPosts=async(req,res)=>{
  try{
    const currentUser=await User.findById(req.user.id)
    const followingUsers=currentUser.following
    const posts=await Post.find({
    author:{
      $in: followingUsers,
    }
  })
  .sort({createdAt:-1})
  .populate("author","username");

    res.status(200).json(posts);
  } catch(error){
    console.error("Error getting feed:", error);
    res.status(500).json({ message: "Failed to load feed" });
  }
  
}

exports.updatePost=async(req,res)=>{
  try{
 const post=await Post.findById(req.params.postId);

 if(!post) return res.status(404).json({message:"Post not found"});
 if(post.author.toString()!==req.user.id.toString()) return res.status(403).json({message:"You are not authorized to update this post"});

 const updatedPost=await post.findByIdAndUpdate(
  req.params.id,
  {$set:req.body},
  {new:true}
 )
  res.status(200).json({
    message:"Post updated successfully",
    post:updatedPost
  })
}catch(error){
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Failed to update post" });
  }
}

exports.deletePost=async(req, res)=>{
  try{
    const post=await Post.findById(req.params.postId);
    if(!post) return res.status(404).json({message:"Post not found"});
    if(post.author.toString()!==req.user.id.toString()) return res.status(403).json({message:"You are not authorized to delete this post"});
    await post.deleteOne();
    res.status(200).json({message:"Post deleted successfully"});
  }catch(error){
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
}