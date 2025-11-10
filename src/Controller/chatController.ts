import mongoose, {Request, Response} from 'express'
import Chat from '../Model/chatModel';

export const accessChat = async (req: Request, res: Response) => {
    try {
        const {userId} = req.body;
        const currentUser = (req as any).user._id;

        // Check if user has an id
        if (!userId){
            return res.status(400).json({message: "User has no id"});
        }

        // Check if chat already exist
        let chat = await Chat.findOne({
            isGroupChat: false,
            users: {$all: [currentUser, userId]}
        })
        .populate("users", "-password")
        .populate("latestMessage");

        // If chat already exist
        if(chat){
            return res.status(200).json(chat)
        }
        // To create a new chat
        const newChat = await Chat.create({
            chatName: 'Direct Chat',
            isGroupChat: false,
            users: [currentUser, userId]
        })
        // To populate the full chat
        const fullChat = await Chat.findById(newChat._id).populate('users', '-password')
        res.status(201).json(fullChat)
    } catch (error) {
        res.status(400).json({message: 'Erroraccessing chat', error})
    }
}