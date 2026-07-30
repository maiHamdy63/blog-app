const express = require("express");
const {
  createAdmin,
  getAllUsers,
  getOneUser,
  updateUserPutMethod,
  upadateUserPatchMethod,
  deleteUser,
} = require("../controllers/user");
const {
  updateUserSchema,
  createUserSchema,
} = require("../utils/validate-shema/user");
const validate = require("../middleware/joi-validate");
const router = express.Router();
const { uploadOnDisk, uploadOnMomory } = require("../middleware/upload-image");
const uplaodImageKit = require("../middleware/image-kit");
const auth = require("../middleware/auth");
const restrictTo = require("../middleware/restrictTo");
// const upload = multer({ storage: diskStorage });

router.post(
  "/users",
  auth,
  restrictTo("admin"),
  uploadOnMomory.single("img"),
  uplaodImageKit(false, "user-iti"),
  validate(createUserSchema),
  createAdmin,
);

router.get("/users", auth, restrictTo("admin", "superAdmin"), getAllUsers);

router.get("/users/:id", auth, getOneUser);

router.put("/users/:id", auth, updateUserPutMethod);

router.patch(
  "/users/:id",
  auth,
  validate(updateUserSchema),
  upadateUserPatchMethod,
);

router.delete(
  "/users/:id",
  auth,
  restrictTo("admin", "superAdmin"),
  deleteUser,
);

module.exports = router;
