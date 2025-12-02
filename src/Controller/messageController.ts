import { Request, Response } from "express";
import Message from "../Model/messageModel";
import Chat from "../Model/chatModel";
import cloudinary from "./cloudinary";
import { io } from '../server';

interface MulterRequest extends Request{
  file?: Express.Multer.File
}

// Send a message
export const sendMessage = async (req: MulterRequest, res: Response) => {
  try {
    const { text, chatId, receiver } = req.body;
    const sender = (req as any).user._id;

    let fileURL : string | null = null;

    // To handle file upload
    if(req.file){
      const fileBuffer = req.file.buffer
     fileURL = await new Promise((resolve, reject) => { 
      const uploadedFile = cloudinary.uploader.upload_stream({folder: "chat_files"}, (error, result) => {
        if(error) reject(error);
        else resolve(result?.secure_url || null)
      });
      uploadedFile.end(fileBuffer);
      });
    }

    if (!text && !fileURL) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }
    // Check if chat exist
    const chatExist = await Chat.findById(chatId);
    if(!chatExist){
        return res.status(404).json({message: "Chat doesnt exist"});
    };

    const newMessage = await Message.create({
      sender,
      text: text || "",
      chat: chatId,
      receiver,
      attachments: fileURL ? [fileURL] : []
    });

    // Populate sender and chat details
    const populatedMessage = await newMessage.populate([
    { path: "sender", select: "username email" },
    {path: "receiver", select: "username email"},
    { path: "chat" },
    ]);

    // Update latest message in the chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: populatedMessage._id });

    // Socket.IO broadcast
    const chat = populatedMessage.chat as any

    if(chat.users){
      chat.users.forEach((user: any) =>{
        if(user.toString() === sender.toString()) return;

        io.to(user.toString()).emit('message received', populatedMessage)
      })
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error });
  }
};

// Fetch all messages for a chat
export const fetchMessages = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required." });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username email")
      .populate("chat")
      .sort({ createdAt: 1 }); 

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id; 
    const {messageId} = req.body;

    // check userId, text
    if (!userId || !messageId){
      return res.status(404).json({message: 'userId, text are required'})
    } 

    // check if message exists and fetch
    const message = await Message.findById(messageId).populate('chat');
    if(!message){
      return res.status(404).json({message: 'Message not found'})
    }

    const chat = message.chat as any;

    if(!chat){
      return res.status(404).json({message: 'Chat not found'})
    }

    let canDelete = false;

    // Chek if Group Chat
    if(chat.isGroupChat){
      const fullChat = await Chat.findById(chat._id);
      if(!fullChat){
        return res.status(404).json({message: 'Chat not found'})
      }

      // Only group admin and sender can delete messages
      if (
        fullChat.groupAdmin.toString() === userId.toString() ||
        message.sender.toString() === userId.toString()
      ) {
        canDelete = true;
      }
    }else {
      // Only sender can delete in 1-on-1 chat
      if (message.sender.toString() === userId.toString()) canDelete = true;
    }

    // Only sender or Group Admin can delete message
    if(!canDelete){
      return res.status(403).json({message: 'You are not allowed to delete this message'})
    }

    // To delete message
    const removeMessage = await Message.findByIdAndDelete(messageId)

    res.status(200).json({
      status: 'success',
      removeMessage,
      message: 'Message deleted successfully'
    })

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Error deleting message',
      error
    })
    console.log(error)
  }
}

export const searchMessage = async (req: Request, res: Response) => {
  try {
    const {chatId} = req.params;
    const keyword = req.query.keyword as string;

    // check chatId
    if(!chatId){
      return res.status(404).json({message: 'chatId is required'});
    }

    // return empty arry if keyword doens't exist
    if(!keyword || keyword.trim() === ""){
      return res.status(200).json([])
    } 
    // Check if Chat exists
    const chatExist = await Chat.findById(chatId);
    if(!chatExist){
      return res.status(404).json({message: 'Chat not found'})
    }

    // Search Message 
    const messages = await Message.find({
      chat: chatId,
      text: {$regex: keyword, $options: 'i'}
    })
    .populate('sender', 'username email')
    .populate('receiver', 'username email')
    .sort({createdAt: -1})

    res.status(200).json({messages});
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'Failed to search message',
      error
    })
    console.log(error)
  }
} 