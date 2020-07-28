const mongoose = require('mongoose');
const Profile = require('./Profile');
const Post = require('./Post');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

/* userSchema.virtual('profile', {
    ref: 'Profile',
    localField: '_id',
    foreignField: 'user'
});

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "user"
}); */

userSchema.pre('remove', async function(next) {
    const user = this;
    await Profile.deleteMany({user: user._id});
    await Post.deleteMany({user: user._id});
    next();
});

module.exports = User = mongoose.model('user', userSchema);