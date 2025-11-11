import { Request, Response } from "express";
import Chat from '../Model/chatModel';
import User from '../Model/userModel';

export const createGroup = async (req: Request, res: Response) => {
    try {
        let {chatName, users} = req.body;
        const loggedInUser = (req as any).user._id;

        if(!chatName || !users) {
            return res.status(404).json({ message: 'chatName or User is missing'});
        }
        if(users.length < 2){
            return res.status(400).json({ message: 'Group must have atleast 2 members'});
        }
        if(typeof users == 'string') users = JSON.parse(users)

        users.push(loggedInUser);

        const groupChat = await Chat.create({
            chatName,
            isGroupChat: true,
            groupAdmin: loggedInUser,
            users
        })

        const fullGroupChat = await groupChat.populate('users', 'username email');
        return res.status(201).json({
            status: 'success',
            groupChat: fullGroupChat,
            message: 'A new group chat has been created'
        })

    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message:'Error creating a new group chat'
        })
    }
}