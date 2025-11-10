import { Request, Response } from "express";
import Message from "../Model/messageModel";
import Chat from "../Model/chatModel";

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content, chatId } = req.body;
    const sender = (req as any).user._id;

    if (!content || !chatId) {
      return res.status(400).json({ message: "Content and chatId are required." });
    }

    const newMessage = await Message.create({
      sender,
      content,
      chat: chatId
    });

    // Populate sender and chat details
    const savedMessage = await newMessage.save();

    const populatedMessage = await savedMessage.populate([
    { path: "sender", select: "username email" },
    { path: "chat" },
    ]);

    res.status(201).json(populatedMessage);


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
