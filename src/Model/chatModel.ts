import mongoose,{ Schema, Document } from "mongoose";

export interface IChat extends Document{
    chatName: string;
    isGroupChat: boolean;
    groupAdmin: mongoose.Types.ObjectId,
    users: mongoose.Types.ObjectId[];
    latestMessage?: mongoose.Types.ObjectId;
}

const chatSchema = new Schema<IChat>(
    {
        chatName: {
            type: String,
            trim: true
        },
        isGroupChat: {
            type: Boolean,
            default: false
        },
        groupAdmin: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        users: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        latestMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message"
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IChat>("Chat", chatSchema);