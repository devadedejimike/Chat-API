import {Request, Response} from 'express'
import Chat from '../Model/chatModel';
import User from '../Model/userModel';

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

export const getChat = async(req: Request, res: Response) => {
    try {
        //Get the logged-in user ID
        const loggedInUser = (req as any).user._id
        //Search for all chats where this user is inside the “users” array
        const chats = await Chat.find({
            users: {$elemMatch: {$eq: loggedInUser}}
        })
        //Populate user details
        .populate("users", "username email")
        .populate("groupAdmin", "username email")
        //Sort chats by latest activity
        .sort({updatedAt: -1})
        //Respond with status and data
        res.status(200).json({
            status: 'success',
            chats
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: 'Could not fetch chat', error
        })
    }
}

export const searchUser = async (req: Request, res: Response) => {
    try {
        const keyword = req.query.search as string
        const loggedInUser = (req as any)._id

        if(!keyword || keyword.trim() === ""){
            return res.status(200).json([]);
        }

        const queryCondition = {
            $or: [
                {username: {$regex: keyword, $options: "i"}},
                {email: {$regex: keyword, $options: "i"}}
            ]
        }

        const user = await User.find(queryCondition)
        .find({_id: {$ne: loggedInUser}})
        .select('-password')

        res.status(200).json({
            status: 'success',
            user,
            meesage: 'User found'
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: 'User not found',
            error
        })
        console.log(error)
    }
}