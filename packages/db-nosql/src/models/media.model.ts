import { Schema, model, Document } from "mongoose";
import { MEDIA_FILE_TYPE } from "@repo/types";

interface IMedia extends Document {
    url : string;
    file_type : MEDIA_FILE_TYPE;
    size : Number;
    thumbnail? : string
}

const mediaSchema = new Schema<IMedia>(
    {
        url : {
            type : String,
            required : [true, 'media is required']
        }, 
        file_type : {
            type : String,
            enum : MEDIA_FILE_TYPE,
            required : true
        }, 
        size : {
            type : Number,
            required : true
        }, 
        thumbnail : {
            type : String,
            
        }

    }, 
    {timestamps : true}
)

export const MediaModel = model<IMedia>('Media', mediaSchema);