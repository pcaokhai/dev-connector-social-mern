const express = require("express");
const router = express.Router();
const { check, validationResult} =  require('express-validator');


const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const auth = require('../../middleware/auth');

// @route   POST api/post
// @desc    Create a post
// @acess   Private
router.post("/", [auth, [
  check('text', 'Text is required').notEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  try {
    const user = await User.findById(req.user.id).select(
      "-password"
    );

    const newPost = new Post ({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    });

    const post = await newPost.save();
    res.json(post);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({msg: 'Server Error'})
  }
});

// @route   GET api/posts
// @desc    Get all posts
// @acess   Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({date: -1});
    res.json(posts);

  } catch (err) {
    console.log(err.message);
    res.status(500).send({ msg: "Server Error" });
  }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
// @acess   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if(!post) {
      return res.status(404).json({msg: 'Post not found'});
    }
    res.json(post);

  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send({ msg: "Server Error" });
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @acess   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if(post.user.toString() !== req.user.id) {
      return res.status(401).json({msg: 'User not authorized'});
    }

    if(!post) {
      return res.status(404).json({msg: 'Post not found'});
    }

    post.remove()

    res.json({msg: 'Post removed', post});

  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send({ msg: "Server Error" });
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @acess   Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // check if the post has already been liked
    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({msg: 'Post already liked'})
    }

    post.likes.unshift({user: req.user.id});
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ msg: "Server Error" });
  }
});

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @acess   Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // check if the post has already been liked
    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({msg: 'Post has not yet been liked'})
    }

    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ msg: "Server Error" });
  }
});

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @acess   Private
router.post("/comment/:id", [auth, [
  check('text', 'Text is required').notEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  try {
    const user = await User.findById(req.user.id).select(
      "-password"
    );
    const post = await Post.findById(req.params.id);

    const newComment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    };

    post.comments.unshift(newComment);

    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({msg: 'Server Error'})
  }
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete a comment
// @acess   Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = post.comments.find(comment => comment.id == req.params.comment_id);

    if(!comment) {
      return res.status(401).json({msg: 'Comment does not exists'});
    }

    if(comment.user.toString() !== req.user.id) {
      return res.status(404).json({msg: 'User not authorized'});
    }

    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();
    res.json(post.comments);

  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: "Comment not found" });
    }
    res.status(500).send({ msg: "Server Error" });
  }
});

module.exports = router;
