import { ApiError, ApiResponse } from "@repo/utils";
import { asyncHandler } from "../../utils";
import { conversationModel, MessageModel, userModel } from "@repo/db-nosql";
import mongoose from "mongoose";
import type { IUserDocument } from "@repo/types";
import { presenceStore } from "../../services/presence.store";
import { enrichMessagesWithAuthors } from "../../services/message.service";

type PageAndLimit = {
  page: number;
  limit: number;
};

const getAssociatedUsersDetails = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized request");

  const currentUserId = new mongoose.Types.ObjectId(user._id);

  const associatedUsers = await conversationModel.aggregate([
    {
      $match: {
        participants: currentUserId,
        is_deleted: false,
      },
    },
    {
      $addFields: {
        otherParticipant: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$participants",
                as: "p",
                cond: { $ne: ["$$p", currentUserId] },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "otherParticipant",
        foreignField: "_id",
        pipeline: [{ $project: { full_name: 1, avatar: 1, last_active_at: 1, phone_number: 1 } }],
        as: "userInfo",
      },
    },
    {
      $unwind: {
        path: "$userInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "group_id",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1, avatar: 1 } }],
        as: "groupInfo",
      },
    },
    {
      $unwind: {
        path: "$groupInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { conversationId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$conversation_Id", "$$conversationId"] },
              is_Deleted: false,
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          { $project: { text: 1, createdAt: 1, author: 1, status: 1 } },
        ],
        as: "lastMessage",
      },
    },
    {
      $unwind: {
        path: "$lastMessage",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { conversationId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$conversation_Id", "$$conversationId"] },
                  { $ne: ["$author", currentUserId] },
                  { $eq: ["$seen_at", null] },
                  { $eq: ["$is_Deleted", false] },
                ],
              },
            },
          },
          { $count: "count" },
        ],
        as: "unread",
      },
    },
    {
      $addFields: {
        unreadCount: {
          $ifNull: [{ $arrayElemAt: ["$unread.count", 0] }, 0],
        },
      },
    },
    {
      $project: {
        _id: 1,
        is_group: 1,
        updatedAt: 1,
        lastMessage: 1,
        unreadCount: 1,
        displayInfo: {
          $cond: {
            if: "$is_group",
            then: {
              _id: "$groupInfo._id",
              name: "$groupInfo.name",
              avatar: "$groupInfo.avatar",
            },
            else: {
              _id: "$userInfo._id",
              fullname: "$userInfo.full_name",
              avatar: "$userInfo.avatar",
              lastActiveAt: "$userInfo.last_active_at",
              phone_number : "$userInfo.phone_number"
            },
          },
        },
      },
    },
    { $sort: { updatedAt: -1 } },
  ]);

  const withPresence = associatedUsers.map((conv) => ({
    ...conv,
    displayInfo: conv.displayInfo
      ? {
          ...conv.displayInfo,
          isOnline: presenceStore.isOnline(conv.displayInfo._id?.toString()),
        }
      : conv.displayInfo,
  }));

  return res.json(
    new ApiResponse(200, withPresence, "Associated users fetched successfully")
  );
});

const getConversationMessages = asyncHandler(async (req, res) => {
  const conversationedUserId = req.params.conversationedUserId as string;
  const query = req.query as unknown as PageAndLimit;
  const currentLoggedInUser = req.user!;

  if (!conversationedUserId) throw new ApiError(400, "User id is required");

  if (!mongoose.isObjectIdOrHexString(conversationedUserId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const otherUser = (await userModel.findById(conversationedUserId)) as IUserDocument | null;
  if (!otherUser) throw new ApiError(404, "User not found");

  if (
    currentLoggedInUser.tenant_id &&
    otherUser.tenant_id &&
    currentLoggedInUser.tenant_id.toString() !== otherUser.tenant_id.toString()
  ) {
    throw new ApiError(403, "Cannot access messages from another tenant");
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 30;
  const offset = (page - 1) * limit;

  const conversation = await conversationModel.findOne({
    participants: {
      $all: [
        new mongoose.Types.ObjectId(currentLoggedInUser._id),
        new mongoose.Types.ObjectId(conversationedUserId),
      ],
    },
    is_deleted: false,
    is_group: false,
  });

  if (!conversation) {
    return res.json(
      new ApiResponse(200, { conversation: null, messages: [] }, "No conversation found")
    );
  }

  const messages = await MessageModel.find({
    conversation_Id: conversation._id,
    is_Deleted: false,
  } as Record<string, unknown>)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  const enriched = await enrichMessagesWithAuthors(
    messages as unknown as Parameters<typeof enrichMessagesWithAuthors>[0]
  );

  return res.json(
    new ApiResponse(
      200,
      { conversation, messages: enriched.reverse() },
      "Messages fetched successfully"
    )
  );
});

const searchUsers = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new ApiError(401, "Unauthorized request");

  const phone = (req.query.phone as string)?.trim();
  if (!phone) throw new ApiError(400, "Phone number is required");

  const filter: Record<string, unknown> = {
    phone_number: { $regex: phone, $options: "i" },
    _id: { $ne: currentUser._id },
  };

  if (currentUser.tenant_id) {
    filter.tenant_id = currentUser.tenant_id;
  } else {
    filter.tenant_id = null;
  }

  const users = await userModel
    .find(filter)
    .select("full_name avatar phone_number")
    .limit(10)
    .lean();

  return res.json(new ApiResponse(200, users, "Users found"));
});

export { getAssociatedUsersDetails, getConversationMessages, searchUsers };
