import { Request, Response } from "express";
import Message from "../Model/messageModel";
import Chat from "../Model/chatModel";

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { text, chatId, receiver } = req.body;
    const sender = (req as any).user._id;

    if (!text || !chatId || !receiver) {
      return res.status(400).json({ message: "Text, chatId, and receiver are required." });
    }
    // Check if chat exist
    const chatExist = await Chat.findById(chatId);
    if(!chatExist){
        return res.status(404).json({message: "Chat doesnt exist"});
    };

    const newMessage = await Message.create({
      sender,
      text,
      chat: chatId,
      receiver
    });

    // Populate sender and chat details
    const populatedMessage = await newMessage.populate([
    { path: "sender", select: "username email" },
    {path: "receiver", select: "username email"},
    { path: "chat" },
    ]);

    // Update latest message in the chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: populatedMessage._id });

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
