import mongoose,{ Schema, Document } from "mongoose";

export interface IChat extends Document{
    chatName: string;
    isGroupChat: boolean;
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
        users: [{
            type: mongoose.Types.ObjectId,
            ref: "User"
        }],
        latestMessage: {
            type: mongoose.Types.ObjectId,
            ref: "Message"
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IChat>("Chat", chatSchema);