const AppError = require("../utils/AppError");
const Group = require("../model/group");

const isGroupAdmin = (group, userId) => {
  return group.admins.some((id) => id.toString() === userId.toString());
};

const isGroupMember = (group, userId) => {
  return group.members.some((id) => id.toString() === userId.toString());
};

const createGroup = async (req, res) => {
  const { name } = req.body;
  const user = req.user;
  const group = await Group.create({
    name,
    admins: [user._id],
    members: [user._id],
    allowedToPost: [user._id],
  });
  res.status(201).json({ message: "Group created successfully", group });
};

const getAllGroups = async (req, res) => {
  const groups = await Group.find({});
  res.status(200).json({ message: "Groups retrieved successfully", groups });
};

const getOneGroup = async (req, res) => {
  const groupId = req.params.id;
  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  res.status(200).json({ message: "Group retrieved successfully", group });
};

const addMember = async (req, res) => {
  const groupId = req.params.id;
  const { userId } = req.body;
  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  if (!isGroupAdmin(group, req.user._id) && req.user.role !== "superAdmin") {
    throw new AppError("You are not authorized", 403);
  }
  if (!isGroupMember(group, userId)) {
    group.members.push(userId);
    await group.save();
  }
  res.status(200).json({ message: "Member added successfully", group });
};

const removeMember = async (req, res) => {
  const groupId = req.params.id;
  const { userId } = req.body;
  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  if (!isGroupAdmin(group, req.user._id) && req.user.role !== "superAdmin") {
    throw new AppError("You are not authorized", 403);
  }
  group.members = group.members.filter((id) => id.toString() !== userId);
  group.allowedToPost = group.allowedToPost.filter(
    (id) => id.toString() !== userId,
  );
  group.admins = group.admins.filter((id) => id.toString() !== userId);
  await group.save();
  res.status(200).json({ message: "Member removed successfully", group });
};

const managePostPermission = async (req, res) => {
  const groupId = req.params.id;
  const { userId, allow } = req.body;
  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  if (!isGroupAdmin(group, req.user._id) && req.user.role !== "superAdmin") {
    throw new AppError("You are not authorized", 403);
  }
  if (!isGroupMember(group, userId)) {
    throw new AppError("User is not a member of this group", 400);
  }
  const alreadyAllowed = group.allowedToPost.some(
    (id) => id.toString() === userId,
  );
  if (allow && !alreadyAllowed) {
    group.allowedToPost.push(userId);
  } else if (!allow) {
    group.allowedToPost = group.allowedToPost.filter(
      (id) => id.toString() !== userId,
    );
  }
  await group.save();
  res.status(200).json({ message: "Permissions updated successfully", group });
};

module.exports = {
  createGroup,
  getAllGroups,
  getOneGroup,
  addMember,
  removeMember,
  managePostPermission,
};
