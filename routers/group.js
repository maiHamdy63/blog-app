const express = require("express");
const {
  createGroup,
  getAllGroups,
  getOneGroup,
  addMember,
  removeMember,
  managePostPermission,
} = require("../controllers/group");
const {
  createGroupSchema,
  memberSchema,
  permissionSchema,
} = require("../utils/validate-shema/group");
const validate = require("../middleware/joi-validate");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/groups", auth, validate(createGroupSchema), createGroup);
router.get("/groups", auth, getAllGroups);
router.get("/groups/:id", auth, getOneGroup);

router.post("/groups/:id/members", auth, validate(memberSchema), addMember);
router.delete(
  "/groups/:id/members",
  auth,
  validate(memberSchema),
  removeMember,
);
router.patch(
  "/groups/:id/permissions",
  auth,
  validate(permissionSchema),
  managePostPermission,
);

module.exports = router;
