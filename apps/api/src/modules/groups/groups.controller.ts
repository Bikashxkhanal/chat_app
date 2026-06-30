import mongoose from "mongoose";
import {
  conversationModel,
  GroupModel,
  MessageModel,
  userModel,
} from "@repo/db-nosql";
import { CONVERSATION_TYPE, chatEventEnums, type CreateGroupBody } from "@repo/types";
import { ApiError, ApiResponse } from "@repo/utils";
import { asyncHandler } from "../../utils";

export const createGroup = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new ApiError(401, "Unauthorized");

  const { name, avatar, memberIds } = req.body as CreateGroupBody;

  if (!name?.trim()) throw new ApiError(400, "Group name is required");
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    throw new ApiError(400, "At least one member is required");
  }

  const uniqueMemberIds = [
    ...new Set(memberIds.map((id) => id.toString()).filter((id) => id !== currentUser._id.toString())),
  ];

  if (uniqueMemberIds.length === 0) {
    throw new ApiError(400, "Add at least one other member");
  }

  for (const id of uniqueMemberIds) {
    if (!mongoose.isObjectIdOrHexString(id)) {
      throw new ApiError(400, `Invalid member id: ${id}`);
    }
  }

  const members = await userModel.find({ _id: { $in: uniqueMemberIds } });

  if (members.length !== uniqueMemberIds.length) {
    throw new ApiError(404, "One or more members not found");
  }

  for (const member of members) {
    if (
      currentUser.tenant_id &&
      member.tenant_id &&
      currentUser.tenant_id.toString() !== member.tenant_id.toString()
    ) {
      throw new ApiError(403, "Cannot add users from another tenant");
    }
    if (!currentUser.tenant_id && member.tenant_id) {
      throw new ApiError(403, "Cannot add tenant users to a standalone group");
    }
  }

  const group = await GroupModel.create({
    name: name.trim(),
    avatar: avatar ?? null,
    created_By: currentUser._id,
    admin: [currentUser._id],
  } as never);

  const participantIds = [
    currentUser._id,
    ...uniqueMemberIds.map((id) => new mongoose.Types.ObjectId(id)),
  ];

  const conversation = await conversationModel.create({
    participants: participantIds,
    type: CONVERSATION_TYPE.GROUP,
    is_group: true,
    group_id: group._id,
  } as never);

  const io = req.app.get("io");
  const payload = {
    conversationId: conversation._id.toString(),
    isGroup: true,
    groupName: group.name,
  };

  for (const participantId of participantIds) {
    io.to(participantId.toString()).emit(chatEventEnums.NEW_CHAT_EVENT, payload);
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        group: {
          _id: group._id,
          name: group.name,
          avatar: group.avatar,
          created_By: group.created_By,
          admin: group.admin,
        },
        conversation,
      },
      "Group created successfully"
    )
  );
});

export const getGroupByConversation = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new ApiError(401, "Unauthorized");

  const conversationId = String(req.params.conversationId);

  const conversation = await conversationModel.findOne({
    _id: conversationId,
    participants: currentUser._id,
    is_group: true,
    is_deleted: false,
  } as Record<string, unknown>);

  if (!conversation) throw new ApiError(404, "Group conversation not found");

  const group = await GroupModel.findById(conversation.group_id).lean();
  if (!group) throw new ApiError(404, "Group not found");

  const members = await userModel
    .find({ _id: { $in: conversation.participants } } as Record<string, unknown>)
    .select("full_name avatar phone_number")
    .lean();

  return res.json(
    new ApiResponse(200, { group, conversation, members }, "Group details fetched")
  );
});
