import { Request, Response } from "express";
import Chat from '../Model/chatModel';


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

export const addUser = async (req: Request, res: Response) => {
    try {
        const {chatId, userId} = req.body;
        const loggedInUser = (req as any).user._id

        if(!chatId && !userId) {
            return res.status(404).json({message: 'chatId and userId are required'});
        }
        // check if chat exist
        const chatExist = await Chat.findById(chatId);
        if(!chatExist) {
            return res.status(404).json({ message: 'Chat not found'})
        }

        // Ensure its a group chat
        if(!chatExist.isGroupChat){
            return res.status(400).json({message: 'Can only add users to group chats and not direct chats'})
        }
        // Only group admin can add users
        if(chatExist.groupAdmin.toString() != loggedInUser.toString()){
            return res.status(400).json({message: 'Only group admin can add users to group'})
        }
        // Add new user
        chatExist.users.push(userId)
        await chatExist.save();

        let fullChat = await chatExist.populate('users', 'username email');
        res.status(200).json({
            status: 'success',
            chat: fullChat,
            message: 'User added to the group'
        })

    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: 'Error adding new user to the group', error
        })
    }
}

export const removeUser = async (req: Request, res: Response) => {
    try {
        const {chatId, userId} = req.body;
        const loggedInUser = (req as any).user._id;

        if(!chatId && !userId){
            return res.status(404).json({message: 'chatId and userId required'})
        }

        // Check is chat exist
        const chatExist = await Chat.findById(chatId);
        if(!chatExist){
            return res.status(404).json({message: 'Chat not found'})
        }
        // Check its a group chat
        if(!chatExist.isGroupChat){
            return res.status(400).json({message: 'Can only remove user from group'})
        }
        // Only admin can remove user
        if(chatExist.groupAdmin.toString() != loggedInUser.toString()){
            return res.status(400).json({message: 'Only group admin can remove user'})
        }
        // Remove user
        chatExist.users = chatExist.users.filter(user => user.toString() != userId);
        await chatExist.save();

        const fullchat = await chatExist.populate([
            {path: 'users', select: 'username email'},
            {path: 'groupAdmin', select: 'username email'}
        ]);

        res.status(200).json({
            status: 'success',
            chat: fullchat,
            message: 'User removed from group'
        })
    } catch (error) {
       res.status(400).json({
            status: 'fail',
            message: 'Failed to remove user'
        }) 
    }
}

export const renameGroup = async (req: Request, res: Response) => {
    try {
        const {chatId, chatName} = req.body;
        const loggedInUser = (req as any).users._id;

        // check if chatName and chatId exist
        if(!chatId && !chatName){
            return res.status(404).json({message: 'chatId and chatName required'});
        }

        // check if chat exist
        const chatExist = await Chat.findById(chatId);
        if(!chatExist){
            return res.status(404).json({message: 'Chat not found'})
        }

        // Check if is Group chat
        if(chatExist.isGroupChat){
            return res.status(400).json({message: 'Only group chat name can be changed'});
        }

        // Only group admin can change group name
        if(chatExist.groupAdmin.toString() !== loggedInUser.toString()){
            return res.status(400).json({message: 'Only group admin can change group name'});
        }

        // Rename the group chat
        const newName = await Chat.findByIdAndUpdate(chatId, {chatName}, {new: true})
        .populate([
            {path: 'users', select: 'username email'},
            {path: 'groupAdmin', select: 'username email'}
        ])

        if(!newName){
            return res.status(404).json({message: 'Group chat not found'});
        }
        res.status(200).json({
            status: 'success',
            chat: newName,
            message: 'Group Chat Name Updated'
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: 'Error occured while changing group name', error
        })
    }
}