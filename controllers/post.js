const AppError = require("../utils/AppError");
const Post = require("../model/post");
const Group = require("../model/group");

const checkOwnership = (post, user) => {
  return (
    post.author.toString() === user._id.toString() || user.role === "superAdmin"
  );
};

const createPost = async (req, res) => {
  const { title, content, group } = req.body;
  const user = req.user;
  const images = req.images || [];

  let groupId = null;
  if (group) {
    const groupDoc = await Group.findById(group);
    if (!groupDoc) {
      throw new AppError("Group not found", 404);
    }
    const isAllowed = groupDoc.allowedToPost.some(
      (id) => id.toString() === user._id.toString(),
    );
    const isAdmin = groupDoc.admins.some(
      (id) => id.toString() === user._id.toString(),
    );
    if (!isAllowed && !isAdmin && user.role !== "superAdmin") {
      throw new AppError("You are not allowed to post in this group", 403);
    }
    groupId = groupDoc._id;
  }

  const post = await Post.create({
    title,
    content,
    images,
    author: user._id,
    group: groupId,
  });
  res.status(201).json({ message: "Post created successfully", post });
};

// Global posts (group = null) + posts of groups the user is a member of
const getAllPosts = async (req, res) => {
  const user = req.user;

  const myGroups = await Group.find({ members: user._id }).select("_id");
  const myGroupIds = myGroups.map((g) => g._id);

  const filter = {
    $or: [{ group: null }, { group: { $in: myGroupIds } }],
  };

  if (req.query.search) {
    filter.title = { $regex: req.query.search, $options: "i" };
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find(filter)
    .populate("author", "name email image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({ message: "Posts retrieved successfully", posts });
};

const getUserPosts = async (req, res) => {
  const userId = req.params.id || req.user._id;
  const posts = await Post.find({ author: userId })
    .populate("author", "name email image")
    .sort({ createdAt: -1 });
  res.status(200).json({ message: "User posts retrieved successfully", posts });
};

const getOnePost = async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findById(postId).populate(
    "author",
    "name email image",
  );
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  res.status(200).json({ message: "Post retrieved successfully", post });
};

const updatePost = async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  if (!checkOwnership(post, req.user)) {
    throw new AppError("You are not authorized to edit this post", 403);
  }
  const { title, content } = req.body;
  if (title) post.title = title;
  if (content) post.content = content;
  if (req.images && req.images.length > 0) {
    post.images = req.images;
  }
  await post.save();
  res.status(200).json({ message: "Post updated successfully", post });
};

const deletePost = async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  if (!checkOwnership(post, req.user)) {
    throw new AppError("You are not authorized to delete this post", 403);
  }
  await post.deleteOne();
  res.status(200).json({ message: "Post deleted successfully", post });
};

module.exports = {
  createPost,
  getAllPosts,
  getUserPosts,
  getOnePost,
  updatePost,
  deletePost,
};
