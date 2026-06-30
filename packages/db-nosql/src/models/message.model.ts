import { Document, model, Schema } from "mongoose";
import { MESSAGE_STATUS } from "@repo/types";

interface TMessage extends Document {
  author: Schema.Types.ObjectId;
  conversation_Id: Schema.Types.ObjectId;
  text: string;
  is_Media: boolean;
  media_Id?: Schema.Types.ObjectId;
  is_Deleted: boolean;
  status: string;
  clientMessageId?: string;
  delivered_at?: Date;
  seen_at?: Date;
}

const messageSchema = new Schema<TMessage>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    conversation_Id: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    is_Media: {
      type: Boolean,
      default: false,
    },
    media_Id: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      required: false,
    },
    is_Deleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(MESSAGE_STATUS),
      default: MESSAGE_STATUS.SENT,
      index: true,
    },
    clientMessageId: {
      type: String,
      sparse: true,
      index: true,
    },
    delivered_at: {
      type: Date,
      default: null,
    },
    seen_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversation_Id: 1, createdAt: -1 });

export const MessageModel = model("Message", messageSchema);
