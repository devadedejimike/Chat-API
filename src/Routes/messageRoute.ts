import { sendMessage, fetchMessages } from "../Controller/messageController";
import { protect } from "../Middleware/protect";
import express from 'express';


const router = express.Router();

router
    .post('/send', protect, sendMessage)
    .get('/:chatId', protect, fetchMessages)

export default router;