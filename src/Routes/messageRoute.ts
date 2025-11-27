import { sendMessage, fetchMessages, deleteMessage } from "../Controller/messageController";
import { protect } from "../Middleware/protect";
import express from 'express';


const router = express.Router();

router
    .post('/send', protect, sendMessage)
    .get('/:chatId', protect, fetchMessages)
    .delete('/delete', protect, deleteMessage)

export default router;