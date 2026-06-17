import { Schema, Document, model } from "mongoose";

interface TGroup extends Document{
    name : string ;
    avatar : string;
    created_By : Schema.Types.ObjectId
    admin : Schema.Types.ObjectId[]
}

const groupSchema = new Schema<TGroup>(
    {
        name : {
            type : String,
            required : true

        }, 
        avatar : {
            type : String
        }, 
        created_By : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        admin : [
            {
                type : Schema.Types.ObjectId,
                ref : "User",
                required : true
            }
        ]
    },
    {
        timestamps : true
    }
)

export const GroupModel = model<TGroup>('Group', groupSchema)