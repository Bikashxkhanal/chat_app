import { Schema, model, Document } from "mongoose";
import { CONVERSATION_TYPE } from "@repo/types";

interface IConversation extends Document{
    participants : Schema.Types.ObjectId[];
    type : CONVERSATION_TYPE;
    is_group : boolean;
    group_id? : Schema.Types.ObjectId;
    is_deleted : boolean;

}

const conversationSchema = new Schema<IConversation>(
    {
        participants : [
           {
            type :  Schema.Types.ObjectId,
            ref : "User",
            required : true
        }],
        
        type : {
            type : String,
            enum : CONVERSATION_TYPE,
            default : CONVERSATION_TYPE.DIRECT,
        }, 
        is_group : {
            type : Boolean,
            default : false
        }, 
        is_deleted : {
            type : Boolean,
            default : false
        },
        group_id : {
            type : Schema.Types.ObjectId,
            ref : "Group",
            required : false
        }

    },
    {
        timestamps : true
    }
)

conversationSchema.index({ participants: 1, is_deleted: 1 });

export const conversationModel = model<IConversation>('Conversation', conversationSchema);