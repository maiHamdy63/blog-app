const express = require("express");
const {
  createPost,
  getAllPosts,
  getUserPosts,
  getOnePost,
  updatePost,
  deletePost,
} = require("../controllers/post");
const {
  createPostSchema,
  updatePostSchema,
} = require("../utils/validate-shema/post");
const validate = require("../middleware/joi-validate");
const auth = require("../middleware/auth");
const { uploadOnMomory } = require("../middleware/upload-image");
const uplaodImageKit = require("../middleware/image-kit");
const router = express.Router();

router.post(
  "/posts",
  auth,
  uploadOnMomory.array("images", 5),
  uplaodImageKit(true, "posts-iti"),
  validate(createPostSchema),
  createPost,
);

router.get("/posts", auth, getAllPosts);
router.get("/posts/user/:id", auth, getUserPosts);
router.get("/posts/me", auth, getUserPosts);
router.get("/posts/:id", auth, getOnePost);

router.patch(
  "/posts/:id",
  auth,
  uploadOnMomory.array("images", 5),
  uplaodImageKit(true, "posts-iti"),
  validate(updatePostSchema),
  updatePost,
);

router.delete("/posts/:id", auth, deletePost);

module.exports = router;
