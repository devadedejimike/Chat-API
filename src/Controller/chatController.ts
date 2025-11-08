import mongoose, {Request, Response} from 'express'
import Chat from '../Model/chatModel';

export const accessChat = async (req: Request, res: Response) => {
    try {
        const {userId} = req.body;

        // Check if user has an id
        if (!userId){
            return res.status(400).json({message: "User has no id"});
        }

        // Check if chat already exist
        let chat = await Chat.findOne({
            isGroupChat: false,
            users: {$all: [(req as any).user._id, userId]}
        })
        .populate("users", "-password")
        .populate("latestMessage");

        // If chat already exist
        if(chat){
            return res.status(200).json(chat)
        }
        // To create a new chat
        const newChat = Chat.create({
            chatName: 'Direct Chat',
            isGroupChat: false,
            users: [(req as any).user._id, userId]
        })
        // To populate the full chat
        const fullChat = (await newChat).populate('users', '-password')
        res.status(201).json(fullChat)
    } catch (error) {
        res.status(400).json({message: 'Erroraccessing chat', error})
    }
}