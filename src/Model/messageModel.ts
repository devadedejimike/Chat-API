import mongoose, { Schema, Document } from "mongoose";


export interface IMessage extends Document{
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    chat: mongoose.Types.ObjectId,
    text?: string;
    attachments?: string[];
    createdAt: Date;
}

const messageSchema  = new Schema<IMessage>(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        chat: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
            required: true
        },
        text: {type: String},
        attachments: [{ type: String }]
    }, {timestamps: true}
)

export default mongoose.model<IMessage>('Message', messageSchema);