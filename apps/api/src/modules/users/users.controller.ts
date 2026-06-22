import { ApiError, ApiResponse } from "@repo/utils";
import { asyncHandler } from "../../utils";
import { conversationModel, userModel } from "@repo/db-nosql";
import mongoose, { Aggregate, Mongoose } from "mongoose";

type PageAndLimit = {
    page : number ,
    limit : number
}


// get the users details avatar name, last message, last seen time associated with the current logged in user

const getAssociatedUsersDetails = asyncHandler(async (req, res) => {
    const user = req.user;
    if(!user) throw new ApiError(402, "Unauthorized request");

    const currentUserId =new mongoose.Types.ObjectId(user._id);

    try {
        
const associatedUsers = await conversationModel.aggregate([
  //  Match logged-in user's conversations
    {
        $match: {
        participants: currentUserId,
        is_deleted: false
        }
    },

  //  Extract other participant (direct chat)
  {
    $addFields: {
      otherParticipant: {
        $arrayElemAt: [
          {
            $filter: {
              input: "$participants",
              as: "p",
              cond: {
                $ne: ["$$p", currentUserId]
              }
            }
          },
          0
        ]
      }
    }
  },

  // USER lookup (ONLY used when isGroup is null)
  {
    $lookup: {
      from: "users",
      localField: "otherParticipant",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            fullname: 1,
            avatar: 1
          }
        }
      ],
      as: "userInfo"
    }
  },

  {
    $unwind: {
      path: "$userInfo",
      preserveNullAndEmptyArrays: true
    }
  },

  //GROUP lookup (ONLY used when isGroup exists)
  {
    $lookup: {
      from: "groups",
      localField: "is_group",   
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            name: 1,
            avatar: 1
          }
        }
      ],
      as: "groupInfo"
    }
  },

  {
    $unwind: {
      path: "$groupInfo",
      preserveNullAndEmptyArrays: true
    }
  },

  //  Get last message
  {
    $lookup: {
      from: "messages",
      let: {
        conversationId: "$_id"
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$conversationId", "$$conversationId"]
            }
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $limit: 1
        },
        {
          $project: {
            text: 1,
            createdAt: 1
          }
        }
      ],
      as: "lastMessage"
    }
  },

  {
    $unwind: {
      path: "$lastMessage",
      preserveNullAndEmptyArrays: true
    }
  },

  // smart conditional switch
  {
    $project: {
      _id: 1,
      isGroup: 1,
      updatedAt: 1,
      lastMessage: 1,

      displayInfo: {
        $cond: {
          if: {
            $ne: ["$isGroup", null]   // group chat
          },
          then: {
            _id: "$groupInfo._id",
            name: "$groupInfo.name",
            avatar: "$groupInfo.avatar"
          },
          else: {
            _id: "$userInfo._id",
            fullname: "$userInfo.fullname",
            avatar: "$userInfo.avatar"
          }
        }
      }
    }
  },

  //Sort latest first
  {
    $sort: {
      updatedAt: -1
    }
  }
]);

return res.json(
    new ApiResponse(200, 
        associatedUsers, 
        "Associated Users fetched successfully"
    )
)
    } catch (error : any) {
        throw new ApiError(500, error.message || "Invalid server error"); 
    }
})

// this controller will return the messages of the conversation between the logged in user and the asked user,(only one to one , not a messaging);
const getConversationMessages = asyncHandler(async(req, res) => {
    // get the user to whom have conversation, with pagination of the messages so that messages will be loaded based on the 

    const {conversationedUserId} =  req.params;
    const query  = req.query as unknown as PageAndLimit;

    const currentLoggedInUser = req.user?._id;

    if(!conversationedUserId) throw new ApiError(402, "User Id is required");

    const offset = (query.page - 1) * query.limit;

    // pipelinging to get the conversation message between logged in user and asked user 

   try {
     const conversation = await conversationModel.aggregate([
             // get the conversation id by matching 
             {
                 $match : {
                     participants : [conversationedUserId, currentLoggedInUser],
                     is_deleted : false
                 }
             }, 
 
             {
                 $lookup : {
                      from : "messages",
                      localField : "_id",
                      foreignField : "conversation_Id",
                      as  : "conversation"
                 }
             }, 
             {
                 $sort : {
                     updatedAt : -1
                 }
             }, 
             {
                $skip : offset 
             }, 
             {
                 $limit : query.limit
             }
     ])

     return res.json(
        new ApiResponse(200, conversation, "Conversation of required user fetched successfully!")
     )

 
   } catch (error : any) {
    throw new ApiError(500, error.message || "Server response error");
   }

})


export {
    getAssociatedUsersDetails,
    getConversationMessages
}