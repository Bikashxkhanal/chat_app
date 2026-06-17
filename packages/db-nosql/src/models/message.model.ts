import { Document, model, Schema } from "mongoose";

interface TMessage extends Document{
    author : Schema.Types.ObjectId;
    text : String;
    is_Media : Boolean;
    media_Id? : Schema.Types.ObjectId
    is_Deleted : Boolean 
}

const messageSchema = new Schema<TMessage>(
    {
        author : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true
        },

        text : {
            type : String,

        }, 
        is_Media : {
            type : Boolean,
            default : false
        }, 
        media_Id : {
            type : Schema.Types.ObjectId,
            ref : "Media",
            required : false
        }, 
        is_Deleted : {
            type : Boolean, 
            default : false
        }

    }, 
    {
        timestamps : true
    }
)


export const MessageModel = model('Message', messageSchema);